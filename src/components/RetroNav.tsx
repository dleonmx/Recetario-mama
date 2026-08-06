import Link from "next/link";

export function RetroNav({ active }: { active?: "recetas" | "menu" }) {
  return (
    <header className="pixel-border bg-retro-panel m-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <Link href="/" className="font-pixel text-retro-accent text-xs sm:text-sm">
        🍕 Recetario de Gaby
      </Link>
      <nav className="flex gap-3 font-pixel text-[10px] sm:text-xs">
        <Link
          href="/recetas"
          className={
            active === "recetas"
              ? "text-retro-accent-2"
              : "text-foreground hover:text-retro-accent"
          }
        >
          Recetas
        </Link>
        <Link
          href="/menu"
          className={
            active === "menu"
              ? "text-retro-accent-2"
              : "text-foreground hover:text-retro-accent"
          }
        >
          Menú semanal
        </Link>
      </nav>
    </header>
  );
}
