import React, { useEffect, useState } from "react";
import { getTrainingsForPresentation } from "@/lib/api/trainings";

type Props = {
  trainingId: string;
};

export function EyeTrackingHeatmap({ trainingId }: Props) {
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const gridSize = 40;
  const cellSize = 10;

  useEffect(() => {
    async function fetchPersistedHeatmap() {
      try {
        const res = await fetch(
          `/api/v1/trainings/${trainingId}/get-training`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("API error");
        const training = await res.json();
        console.log("[EyeTrackingHeatmap] API training result:", training);
        if (training && training.eye_tracking_scores) {
          setHeatmap(training.eye_tracking_scores);
          console.log("[EyeTrackingHeatmap] Heatmap: ", training.eye_tracking_scores);
        } else {
          setHeatmap({});
        }
        if (training && typeof training.eye_tracking_total_score === "number") {
          setScore(training.eye_tracking_total_score);
          console.log("[EyeTrackingHeatmap] Score: ", training.eye_tracking_total_score);
        } else {
          setScore(null);
        }
      } catch (e) {
        setHeatmap({});
        setScore(null);
        console.error("[EyeTrackingHeatmap] Error fetching heatmap:", e);
      }
    }
    fetchPersistedHeatmap();
  }, [trainingId]);

  // Heatmap-Grid bauen
  const grid: number[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(0)
  );
  Object.entries(heatmap).forEach(([key, count]) => {
    const [x, y] = key.split(",").map(Number);
    const gx = Math.min(gridSize - 1, Math.max(0, gridSize - 1 - Math.round((x / 100) * (gridSize - 1))));
    const gy = Math.min(gridSize - 1, Math.max(0, gridSize - 1 - Math.round((y / 100) * (gridSize - 1))));
    grid[gy][gx] += count as number;
  });
  const max = Math.max(...grid.flat());

  return (
    <div className="mt-4 p-2 bg-gray-100 rounded shadow text-sm font-mono">
      <div>Persisted Eye Tracking Heatmap:</div>
      {score !== null && (
        <div className="mb-2">Aufmerksamkeitsscore: {Math.round(score * 100)}%</div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          gap: "1px",
          background: "#eee",
          margin: "12px 0",
          width: gridSize * cellSize,
          height: gridSize * cellSize,
        }}
      >
        {grid.flat().map((value, i) => {
          const intensity = max > 0 ? value / max : 0;
          const color = intensity === 0
            ? "rgba(0,0,0,0)"
            : `rgba(${255},${Math.round(255 * (1 - intensity))},0,${0.6 + 0.4 * intensity})`;
          return (
            <div
              key={i}
              style={{
                width: cellSize,
                height: cellSize,
                background: color,
                borderRadius: 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}