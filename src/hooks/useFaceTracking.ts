// hooks/useFaceTracking.ts
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
  trainingId: string,
  shouldSend: boolean // <--- NEW
) {
  const [blendshapes, setBlendshapes] = useState<Blendshape[] | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameId = useRef<number | null>(null);

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
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    let stopped = false;
    const loop = () => {
      if (video && video.readyState >= 3 && faceLandmarkerRef.current) {
        const results: FaceLandmarkerResult =
          faceLandmarkerRef.current.detectForVideo(video, performance.now());
        if (
          results &&
          results.faceBlendshapes &&
          results.faceBlendshapes.length > 0
        ) {
          const entries = results.faceBlendshapes[0].categories;
          setBlendshapes(entries);
          if (shouldSend) {
            sendBlendshapes({
              training_id: trainingId,
              timestamp: performance.now(),
              scores: entries,
            });
          }
        } else {
          setBlendshapes(null);
        }
      }
      if (!stopped) {
        animationFrameId.current = requestAnimationFrame(loop);
      }
    };
    animationFrameId.current = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [isTracking, videoRef, shouldSend, trainingId]);

  return blendshapes;
}
