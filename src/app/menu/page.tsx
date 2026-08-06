import { RetroNav } from "@/components/RetroNav";
import { MenuView } from "./MenuView";

export default function MenuPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <RetroNav active="menu" />
      <main className="flex-1 px-4 pb-10">
        <h1 className="font-pixel text-retro-accent mb-6 text-base">
          Elige la comida de la semana
        </h1>
        <MenuView />
      </main>
    </div>
  );
}
