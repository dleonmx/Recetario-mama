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
  h: "#d7ece7",
  S: "#f2b380",
  s: "#d99a66",
  E: "#0d3b3e",
  m: "#a5502e",
  C: "#ffffff",
  c: "#d7ece7",
  B: "#ffd23f",
};

export function ChefMascot({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <div className="animate-bob">
        <PixelArt rows={CHEF_ROWS} palette={CHEF_PALETTE} pixelSize={10} />
      </div>
    </div>
  );
}
