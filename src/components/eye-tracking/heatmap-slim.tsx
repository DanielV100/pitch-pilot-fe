import React from "react";
import { Training } from "@/types/presentation";

type Props = {
    data: Training;
    gridSize?: number;
    cellSize?: number;
};

export function VideoHeatmapOverlay({
    data,
    gridSize = 40,
    cellSize = 10,
}: Props) {
    // Extract persisted heatmap data from first training result
    const rawHeatmap = data.training_results?.[0]?.eye_tracking_scores ?? {};
    // Convert to [{x, y, count}]
    const heatmap: { x: number; y: number; count: number }[] = Object.entries(rawHeatmap)
        .map(([key, count]) => {
            const [x, y] = key.split(",").map(Number);
            return { x, y, count: Number(count) };
        });

    // Build grid
    const grid: number[][] = Array.from({ length: gridSize }, () =>
        Array(gridSize).fill(0)
    );
    heatmap.forEach((point) => {
        const gx = Math.min(gridSize - 1, Math.max(0, point.x));
        const gy = Math.min(gridSize - 1, Math.max(0, point.y));
        grid[gy][gx] += point.count;
    });
    const max = Math.max(...grid.flat());

    return (
        <div
            className="bg-black/60 absolute inset-0 pointer-events-none z-10 size-full"
            style={{
                width: "100%",
                height: "100%",
                left: 0,
                top: 0,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    left: 0,
                    top: 0,
                }}
            >
                {grid.flat().map((value, i) => {
                    const intensity = max > 0 ? value / max : 0;
                    const color =
                        intensity === 0
                            ? "rgba(0,0,0,0)"
                            : `rgba(255, ${Math.round(180 * (1 - intensity))}, 0, ${0.12 + 0.38 * intensity})`;
                    return (
                        <div
                            key={i}
                            style={{
                                width: "100%",
                                height: "100%",
                                background: color,
                                borderRadius: 1,
                                // Optional: smooth out grid edges
                                transition: "background 0.2s",
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
