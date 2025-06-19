import { request } from "@/lib/api/core";
import { Presentation } from "@/types/presentation";

export async function getPresentationsWithTrainings(): Promise<Presentation[]> {
  return await request<Presentation[]>("/v1/presentations/get-presentations", {
    credentials: "include",
    cache: "no-store",
  });
}

export async function getPresentation(
  presentationId: string
): Promise<Presentation> {
  return await request<Presentation>(
    `/v1/presentations/${presentationId}/get-presentation`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );
}
