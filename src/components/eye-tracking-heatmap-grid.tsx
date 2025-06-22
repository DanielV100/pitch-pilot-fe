interface HeatmapGridProps {
  heatmap: Record<string, number>;
  gridSize?: number;
  cellSize?: number;
}

export function EyeTrackingHeatmapGrid({ heatmap, gridSize = 40, cellSize = 10 }: HeatmapGridProps) {
  // Erzeuge leeres Grid
  const grid: number[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(0)
  );
  // Fülle das Grid mit den Heatmap-Werten
  Object.entries(heatmap).forEach(([key, count]) => {
    const [x, y] = key.split(",").map(Number);
    const gx = Math.min(gridSize - 1, Math.max(0, gridSize - 1 - Math.round((x / 100) * (gridSize - 1))));
    const gy = Math.min(gridSize - 1, Math.max(0, gridSize - 1 - Math.round((y / 100) * (gridSize - 1))));
    grid[gy][gx] += count as number;
  });
  const max = Math.max(...grid.flat());

  console.log("Heatmap data:", heatmap);

  return (
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
            : `rgba(255,${Math.round(255 * (1 - intensity))},0,${0.6 + 0.4 * intensity})`;
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
  );
}