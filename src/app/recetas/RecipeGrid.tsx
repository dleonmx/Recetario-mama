"use client";

import { useState } from "react";
import { deleteRecipe } from "@/lib/recipes";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PROTEIN_LABELS,
  type Recipe,
} from "@/lib/types";

export function RecipeGrid({
  recipes,
  onDeleted,
}: {
  recipes: Recipe[];
  onDeleted: (id: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(recipe: Recipe) {
    if (!confirm(`¿Tirar a la basura "${recipe.name}"? No se puede deshacer.`)) return;
    setDeletingId(recipe.id);
    try {
      await deleteRecipe(recipe);
      onDeleted(recipe.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo borrar la receta.");
    } finally {
      setDeletingId(null);
    }
  }

  if (recipes.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-retro-accent-3">
        Todavía no hay recetas. ¡Agrega la primera!
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {CATEGORIES.map((category) => {
        const items = recipes.filter((r) => r.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category}>
            <h2 className="font-pixel mb-3 text-sm text-retro-accent">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((recipe) => {
                const expanded = expandedId === recipe.id;
                return (
                  <div
                    key={recipe.id}
                    className={`pixel-border bg-retro-panel cursor-pointer p-2 transition-all ${
                      expanded ? "col-span-2 row-span-2 sm:col-span-3 md:col-span-4" : ""
                    }`}
                    onClick={() => setExpandedId(expanded ? null : recipe.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {recipe.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={recipe.photo_url}
                          alt={recipe.name}
                          className={`rounded object-cover ${
                            expanded ? "h-40 w-40" : "h-20 w-20"
                          }`}
                        />
                      ) : (
                        <div
                          className={`flex items-center justify-center rounded bg-retro-panel-2 text-2xl ${
                            expanded ? "h-40 w-40" : "h-20 w-20"
                          }`}
                        >
                          🍽️
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(recipe);
                        }}
                        disabled={deletingId === recipe.id}
                        className="text-lg leading-none hover:scale-110"
                        title="Borrar receta"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="mt-2 text-sm font-semibold">{recipe.name}</p>
                    {recipe.protein !== "ninguno" && (
                      <p className="text-xs text-retro-accent-3">
                        {PROTEIN_LABELS[recipe.protein]}
                      </p>
                    )}

                    {expanded && (
                      <div className="mt-3 space-y-3 text-sm" onClick={(e) => e.stopPropagation()}>
                        {recipe.ingredients && (
                          <div>
                            <p className="font-pixel text-retro-accent-2 text-[10px]">Ingredientes</p>
                            <p className="whitespace-pre-line">{recipe.ingredients}</p>
                          </div>
                        )}
                        {recipe.instructions && (
                          <div>
                            <p className="font-pixel text-retro-accent-2 text-[10px]">Preparación</p>
                            <p className="whitespace-pre-line">{recipe.instructions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
