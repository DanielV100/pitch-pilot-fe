import { Training, TrainingCreatePayload } from "@/types/presentation";
import { request } from "./core";

export async function createTraining(
  payload: TrainingCreatePayload
): Promise<Training> {
  const { presentation_id, ...body } = payload;

  return request<Training>(`/v1/trainings/${presentation_id}/add-training`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
}

export async function patchTrainingScore(
  trainingId: string,
  total_score: number
): Promise<Training> {
  return request<Training>(`/trainings/${trainingId}/add-score`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ total_score }),
    credentials: "include",
  });
}

export async function getTrainingsForPresentation(presentationId: string) {
  return request<Training[]>(`/v1/trainings/${presentationId}/get-trainings`, {
    credentials: "include",
  });
}