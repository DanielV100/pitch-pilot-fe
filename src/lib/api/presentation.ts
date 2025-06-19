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

export async function createPresentation(data: {
  name: string;
  description?: string;
  tags: string[];
  file: File;
}) {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("description", data.description || "");
  data.tags.forEach((tag) => formData.append("tags", tag));
  formData.append("file", data.file);

  return await request<any>("/v1/presentations/add-presentation", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
}
