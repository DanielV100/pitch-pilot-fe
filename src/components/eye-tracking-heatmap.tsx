import React, { useEffect, useState } from "react";

type Props = {
  trainingId: string;
};

export function EyeTrackingHeatmap({ trainingId }: Props) {
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const gridSize = 40;
  const cellSize = 10;

  // Hilfsfunktion wie in face-calculate.tsx
  function getGazeXY(scores: number[]) {
    const BLENDSHAPE_NAMES = [
      "_neutral", "browDownLeft", "browDownRight", "browInnerUp", "browOuterUpLeft", "browOuterUpRight",
      "cheekPuff", "cheekSquintLeft", "cheekSquintRight", "eyeBlinkLeft", "eyeBlinkRight", "eyeLookDownLeft",
      "eyeLookDownRight", "eyeLookInLeft", "eyeLookInRight", "eyeLookOutLeft", "eyeLookOutRight", "eyeLookUpLeft",
      "eyeLookUpRight", "eyeSquintLeft", "eyeSquintRight", "eyeWideLeft", "eyeWideRight", "jawForward", "jawLeft",
      "jawOpen", "jawRight", "mouthClose", "mouthDimpleLeft", "mouthDimpleRight", "mouthFrownLeft", "mouthFrownRight",
      "mouthFunnel", "mouthLeft", "mouthLowerDownLeft", "mouthLowerDownRight", "mouthPressLeft", "mouthPressRight",
      "mouthPucker", "mouthRight", "mouthRollLower", "mouthRollUpper", "mouthShrugLower", "mouthShrugUpper",
      "mouthSmileLeft", "mouthSmileRight", "mouthStretchLeft", "mouthStretchRight", "mouthUpperUpLeft",
      "mouthUpperUpRight", "noseSneerLeft", "noseSneerRight"
    ];
    const idx = (name: string) => {
      const i = BLENDSHAPE_NAMES.indexOf(name);
      return i >= 0 ? i : 0;
    };
    const left = scores[idx("eyeLookOutLeft")] + scores[idx("eyeLookInRight")];
    const right = scores[idx("eyeLookInLeft")] + scores[idx("eyeLookOutRight")];
    const x = (left - right) / 2;
    const up = scores[idx("eyeLookUpLeft")] + scores[idx("eyeLookUpRight")];
    const down = scores[idx("eyeLookDownLeft")] + scores[idx("eyeLookDownRight")];
    const y = (up - down) / 2;
    return { x, y };
  }

  useEffect(() => {
    async function fetchBlendshapes() {
      const res = await fetch(`/api/v1/blendshapes/${trainingId}`);
      const data = await res.json();
      const counts: Record<string, number> = {};
      data.forEach((row: any) => {
        const { x, y } = getGazeXY(row.scores);
        const nx = Math.round(((x + 1) / 2) * 100);
        const yStretched = Math.max(-1, Math.min(1, y * 1.2 + 0.3));
        const ny = Math.round(((yStretched + 1) / 2) * 100);
        const key = `${nx},${ny}`;
        counts[key] = (counts[key] || 0) + 1;
      });
      setHeatmap(counts);
    }
    fetchBlendshapes();
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
      <div>Heatmap der Blickpunkte:</div>
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