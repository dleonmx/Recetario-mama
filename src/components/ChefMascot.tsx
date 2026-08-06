import { PixelArt } from "./PixelArt";

const CHEF_ROWS = [
  "....HHHH....",
  "..HHHHHHHH..",
  ".HHHHHHHHHH.",
  "HHHHHHHHHHHH",
  "hhhhhhhhhhhh",
  ".SSSSSSSSSS.",
  "SSESSSSSESSS",
  "SSSSmSSmSSSS",
  "SSSSSSSSSSSS",
  "ssssssssssss",
  "CCCCCCCCCCCC",
  "CCBCCCCCCBCC",
  "CCCCCCCCCCCC",
  "cccccccccccc",
];

const CHEF_PALETTE: Record<string, string> = {
  H: "#ffffff",
  h: "#d8d3e0",
  S: "#f2b380",
  s: "#d99a66",
  E: "#2b1b54",
  m: "#a5502e",
  C: "#ffffff",
  c: "#d8d3e0",
  B: "#ffce54",
};

const PIZZA_ROWS = [
  "pppppppppppp",
  "PYYYYYYYYYYP",
  "PYYYDYYDYYYP",
  ".PYYYYYYYYP.",
  ".PYYYYYYYYP.",
  "..PYYYYYYP..",
  "..PYYYYYYP..",
  "...PYYYYP...",
  "....PYYP....",
  ".....PP.....",
];

const PIZZA_PALETTE: Record<string, string> = {
  p: "#c9852a",
  P: "#e8a53d",
  Y: "#ffce54",
  D: "#ff5d8f",
};

export function ChefMascot({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <div className="animate-bob">
        <PixelArt rows={CHEF_ROWS} palette={CHEF_PALETTE} pixelSize={10} />
      </div>
      <div className="-mt-3">
        <PixelArt rows={PIZZA_ROWS} palette={PIZZA_PALETTE} pixelSize={9} />
      </div>
    </div>
  );
}
