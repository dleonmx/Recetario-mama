"use client";

import { useState } from "react";
import { deleteRecipe } from "@/lib/recipes";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PROTEIN_LABELS,
  type Recipe,
} from "@/lib/types";
import { RecipeForm } from "./RecipeForm";

export function RecipeGrid({
  recipes,
  onDeleted,
  onUpdated,
}: {
  recipes: Recipe[];
  onDeleted: (id: string) => void;
  onUpdated: (recipe: Recipe) => void;
}) {
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
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
              {items.map((recipe) => (
                <div
                  key={recipe.id}
                  className="pixel-border bg-retro-panel cursor-pointer p-2 transition-all hover:brightness-110"
                  onClick={() => setEditingRecipe(recipe)}
                >
                  <div className="flex items-start justify-between gap-2">
                    {recipe.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={recipe.photo_url}
                        alt={recipe.name}
                        style={{ imageRendering: "pixelated" }}
                        className="h-20 w-20 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded bg-retro-panel-2 text-2xl">
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
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {editingRecipe && (
        <RecipeForm
          recipe={editingRecipe}
          onClose={() => setEditingRecipe(null)}
          onUpdated={(updated) => {
            onUpdated(updated);
            setEditingRecipe(null);
          }}
        />
      )}
    </div>
  );
}
