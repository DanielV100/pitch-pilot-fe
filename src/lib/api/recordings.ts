import { StartRes, FinishRes, PresignRes } from "@/types/recordings";
import { request } from "./core";

export const startRecording = (trainingId: string) =>
  request<StartRes>("/v1/recordings/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ training_id: trainingId }),
    credentials: "include",
  });

export const finishRecording = (
  trainingId: string,
  prefix: string,
  slideEvents: { timestamp: number; page: number }[],
  blendshapes: any[]
) =>
  request<FinishRes>("/v1/recordings/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      training_id: trainingId,
      prefix,
      slide_events: slideEvents,
      blendshapes,
    }),
    credentials: "include",
  });

export const presignRecording = (objectKey: string) =>
  request<PresignRes>(
    `/v1/recordings/presign?object=${encodeURIComponent(objectKey)}`,
    { credentials: "include" }
  );

export async function saveEyeTrackingResults(tid: string, blendshapes: any[]) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/trainings/${tid}/eye-tracking`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blendshapes }),
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("Failed to save eye tracking results");
  return res.json();
}
