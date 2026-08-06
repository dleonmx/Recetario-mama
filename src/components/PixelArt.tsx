export function PixelArt({
  rows,
  palette,
  pixelSize = 8,
  className,
}: {
  rows: string[];
  palette: Record<string, string>;
  pixelSize?: number;
  className?: string;
}) {
  const width = rows[0]?.length ?? 0;
  const height = rows.length;

  return (
    <svg
      viewBox={`0 0 ${width * pixelSize} ${height * pixelSize}`}
      width={width * pixelSize}
      height={height * pixelSize}
      className={className}
      shapeRendering="crispEdges"
      role="img"
    >
      {rows.map((row, y) =>
        [...row].map((char, x) => {
          if (char === "." || !palette[char]) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * pixelSize}
              y={y * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={palette[char]}
            />
          );
        })
      )}
    </svg>
  );
}
