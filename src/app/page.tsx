import Link from "next/link";
import { ChefMascot } from "@/components/ChefMascot";
import { TypewriterText } from "@/components/TypewriterText";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
      <ChefMascot />

      <div className="pixel-border bg-retro-panel w-full max-w-md p-5">
        <TypewriterText
          text="¡Hola Gaby! Elige la comida de esta semana o agrega recetas nuevas."
          className="font-pixel text-xs leading-relaxed sm:text-sm"
        />
      </div>

      <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
        <Link
          href="/menu"
          className="pixel-btn font-pixel flex-1 bg-retro-accent px-4 py-4 text-center text-[10px] text-retro-panel sm:text-xs"
        >
          🍲 Elegir comida
          <br />
          de la semana
        </Link>
        <Link
          href="/recetas"
          className="pixel-btn font-pixel flex-1 bg-retro-accent-3 px-4 py-4 text-center text-[10px] text-retro-panel sm:text-xs"
        >
          📖 Agregar
          <br />
          recetas
        </Link>
      </div>
    </main>
  );
}
