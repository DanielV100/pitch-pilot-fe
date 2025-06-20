// In a new file, e.g., /hooks/useFaceTracking.ts
"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";
import {
  closeBlendshapeSocket,
  openBlendshapeSocket,
  sendBlendshapes,
} from "@/lib/api/blendshapes";

type Blendshape = {
  categoryName: string;
  score: number;
};

export function useFaceTracking(
  videoRef: React.RefObject<HTMLVideoElement>,
  trainingId: string
) {
  const [blendshapes, setBlendshapes] = useState<Blendshape[] | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameId = useRef<number>(null);

  useEffect(() => {
    openBlendshapeSocket();

    return () => {
      closeBlendshapeSocket();
    };
  }, []);
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });

        faceLandmarkerRef.current = landmarker;
        setIsTracking(true);
      } catch (error) {
        console.error("Error initializing FaceLandmarker:", error);
        setIsTracking(false);
      }
    };

    initializeFaceLandmarker();
    return () => {
      faceLandmarkerRef.current?.close();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (isTracking && video) {
      const loop = () => {
        if (video.readyState >= 3) {
          const results: FaceLandmarkerResult =
            faceLandmarkerRef.current?.detectForVideo(
              video,
              performance.now()
            )!;

          if (
            results &&
            results.faceBlendshapes &&
            results.faceBlendshapes.length > 0
          ) {
            const entries = results.faceBlendshapes[0].categories;

            setBlendshapes(entries);
            sendBlendshapes({
              training_id: trainingId,
              timestamp: performance.now(),
              scores: entries,
            });
          } else {
            setBlendshapes(null);
          }
        }
        animationFrameId.current = requestAnimationFrame(loop);
      };
      animationFrameId.current = requestAnimationFrame(loop);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isTracking, videoRef]);

  return blendshapes;
}
