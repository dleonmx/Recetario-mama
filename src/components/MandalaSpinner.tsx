// Mandalita pixel-art usada como indicador de carga. Se genera por geometría
// (simetría radial de 8 puntas) en vez de dibujarse a mano, para garantizar
// que sea simétrica de verdad.

const SIZE = 13;
const CENTER = (SIZE - 1) / 2;
const SPOKES = 8;
const WEDGE = (Math.PI * 2) / SPOKES;

function cellColor(x: number, y: number): string | null {
  const dx = x - CENTER;
  const dy = y - CENTER;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r > CENTER + 0.4) return null;

  let angle = Math.atan2(dy, dx);
  if (angle < 0) angle += Math.PI * 2;
  const folded = angle % WEDGE;

  if (r < 0.9) return "#f6fff8"; // centro
  if (r < 2.1) return "#ffd23f"; // anillo interior
  if (r < 5.6 && folded < WEDGE * 0.55) return "#ff8552"; // aspas
  if (r < 6.4 && folded < WEDGE * 0.22) return "#7fe0c8"; // puntas
  return null;
}

const CELLS = (() => {
  const cells: { x: number; y: number; color: string }[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const color = cellColor(x, y);
      if (color) cells.push({ x, y, color });
    }
  }
  return cells;
})();

export function MandalaSpinner({
  size = 56,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Cargando"
      className={`animate-spin-pixel ${className ?? ""}`}
    >
      {CELLS.map(({ x, y, color }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
      ))}
    </svg>
  );
}
