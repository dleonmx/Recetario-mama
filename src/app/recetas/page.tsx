"use client";

import { useEffect, useState } from "react";
import { MandalaSpinner } from "@/components/MandalaSpinner";
import { RetroNav } from "@/components/RetroNav";
import { listRecipes } from "@/lib/recipes";
import type { Recipe } from "@/lib/types";
import { RecipeForm } from "./RecipeForm";
import { RecipeGrid } from "./RecipeGrid";

export default function RecetasPage() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRecipes()
      .then(setRecipes)
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar recetas."));
  }, []);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <RetroNav active="recetas" />
      <main className="flex-1 px-4 pb-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-pixel text-retro-accent text-base">Recetario</h1>
          <button
            onClick={() => setShowForm(true)}
            className="pixel-btn font-pixel bg-retro-accent-3 px-3 py-2 text-[10px] text-retro-panel sm:text-xs"
          >
            + Agregar receta
          </button>
        </div>

        {error && <p className="text-retro-accent-2">{error}</p>}
        {!recipes && !error && (
          <div className="flex items-center gap-3">
            <MandalaSpinner size={36} />
            <p className="text-sm text-retro-accent-3">Cargando recetas...</p>
          </div>
        )}
        {recipes && (
          <RecipeGrid
            recipes={recipes}
            onDeleted={(id) => setRecipes((prev) => prev?.filter((r) => r.id !== id) ?? prev)}
            onUpdated={(updated) =>
              setRecipes((prev) => prev?.map((r) => (r.id === updated.id ? updated : r)) ?? prev)
            }
          />
        )}
      </main>

      {showForm && (
        <RecipeForm
          onClose={() => setShowForm(false)}
          onCreated={(recipe) => setRecipes((prev) => (prev ? [recipe, ...prev] : [recipe]))}
        />
      )}
    </div>
  );
}
