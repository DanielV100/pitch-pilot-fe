import React, { useEffect, useState } from "react";
import { Training } from "@/types/presentation";

type Props = {
    data: Training;
};

export function EyeTrackingHeatmap({ data }: Props) {
    const [score, setScore] = useState<number | null>(null);
    const gridSize = 40;
    const cellSize = 10;

    // Hole das Heatmap-Objekt aus dem ersten TrainingResult
    const rawHeatmap = data.training_results?.[0]?.eye_tracking_scores ?? {};

    // Umwandeln in Array von {x, y, count}
    const heatmap: { x: number; y: number; count: number }[] = Object.entries(rawHeatmap)
        .map(([key, count]) => {
            const [x, y] = key.split(",").map(Number);
            return { x, y, count: Number(count) };
        });
    console.log("Heatmap data:", heatmap);

    useEffect(() => {
        const total = data.training_results?.[0]?.eye_tracking_total_score;
        if (typeof total === "number") {
            setScore(total);
        }
    }, [data.training_results]);

    // Heatmap-Grid bauen
    const grid: number[][] = Array.from({ length: gridSize }, () =>
        Array(gridSize).fill(0)
    );

    heatmap.forEach((point) => {
        const gx = Math.min(
            gridSize - 1,
            Math.max(0, point.x)
        );
        const gy = Math.min(
            gridSize - 1,
            Math.max(0, point.y)
        );
        grid[gy][gx] += point.count;
    });

    const max = Math.max(...grid.flat());

    return (
        <div className="mt-4 p-2 bg-gray-100 rounded shadow text-sm font-mono">
            <div>Persisted Eye Tracking Heatmap:</div>
            {score !== null && (
                <div className="mb-2">
                    Aufmerksamkeitsscore: {Math.round(score * 100)}%
                </div>
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
                    const color =
                        intensity === 0
                            ? "rgba(0,0,0,0)"
                            : `rgba(255,${Math.round(255 * (1 - intensity))},0,${0.6 + 0.4 * intensity
                            })`;
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