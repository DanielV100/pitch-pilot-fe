import { request } from "@/lib/api/core";
import { Presentation, Training } from "@/types/presentation";

export async function getPresentationsWithTrainings(): Promise<Presentation[]> {
  const rawPresentations = await request<Omit<Presentation, "trainings">[]>(
    "/v1/presentations/get-presentations",
    { credentials: "include", cache: "no-store" }
  );

  const enriched = await Promise.all(
    rawPresentations.map(async (p) => {
      try {
        const trainings = await request<Training[]>(
          `/v1/presentations/${p.id}/get-trainings`,
          { credentials: "include", cache: "no-store" }
        );
        return { ...p, trainings };
      } catch (e) {
        console.warn("Failed to fetch trainings for", p.id);
        return { ...p, trainings: [] };
      }
    })
  );

  return enriched;
}
