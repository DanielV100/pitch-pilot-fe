import { StartRes, FinishRes, PresignRes } from "@/types/recordings";
import { request } from "./core";

export const startRecording = (trainingId: string) =>
  request<StartRes>("/v1/recordings/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ training_id: trainingId }),
    credentials: "omit",
  });

export const finishRecording = (
  trainingId: string,
  prefix: string,
  slideEvents: { timestamp: number; page: number }[]
) =>
  request<FinishRes>("/v1/recordings/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      training_id: trainingId,
      prefix,
      slide_events: slideEvents,
    }),
    credentials: "omit",
  });

export const presignRecording = (objectKey: string) =>
  request<PresignRes>(
    `/v1/recordings/presign?object=${encodeURIComponent(objectKey)}`,
    { credentials: "omit" }
  );
