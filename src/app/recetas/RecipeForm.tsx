"use client";

import { useState } from "react";
import { compressAndUploadPhoto, createRecipe } from "@/lib/recipes";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PROTEIN_LABELS,
  type Category,
  type Protein,
  type Recipe,
} from "@/lib/types";

const PROTEINS: Protein[] = ["ninguno", "pollo", "carne", "pescado"];

export function RecipeForm({
  onCreated,
  onClose,
}: {
  onCreated: (recipe: Recipe) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<Category>("guisados");
  const [protein, setProtein] = useState<Protein>("ninguno");
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ponle un nombre a la receta.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const photo_url = photoFile ? await compressAndUploadPhoto(photoFile) : null;
      const recipe = await createRecipe({
        name: name.trim(),
        category,
        protein,
        photo_url,
        ingredients,
        instructions,
      });
      onCreated(recipe);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la receta.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
      <form
        onSubmit={handleSubmit}
        className="pixel-border bg-retro-panel my-8 w-full max-w-lg space-y-4 p-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-pixel text-retro-accent text-sm">Nueva receta</h2>
          <button
            type="button"
            onClick={onClose}
            className="font-pixel text-retro-accent-2 text-xs"
          >
            X
          </button>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-retro-accent-3">Categoría</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded border-2 border-retro-border bg-retro-panel-2 p-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-retro-accent-3">Nombre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border-2 border-retro-border bg-retro-panel-2 p-2"
            placeholder="Ej. Pollo a la mexicana"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-retro-accent-3">Proteína</span>
          <select
            value={protein}
            onChange={(e) => setProtein(e.target.value as Protein)}
            className="w-full rounded border-2 border-retro-border bg-retro-panel-2 p-2"
          >
            {PROTEINS.map((p) => (
              <option key={p} value={p}>
                {PROTEIN_LABELS[p]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-retro-accent-3">Foto</span>
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full text-sm" />
          {photoPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Vista previa" className="mt-2 h-32 w-32 rounded object-cover" />
          )}
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-retro-accent-3">
            Ingredientes (uno por línea, para la lista de compras)
          </span>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={4}
            className="w-full rounded border-2 border-retro-border bg-retro-panel-2 p-2"
            placeholder={"1 kg de pollo\n2 jitomates\n1 cebolla"}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-retro-accent-3">Preparación</span>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={5}
            className="w-full rounded border-2 border-retro-border bg-retro-panel-2 p-2"
          />
        </label>

        {error && <p className="text-retro-accent-2 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="pixel-btn font-pixel w-full bg-retro-accent px-4 py-3 text-xs text-retro-panel disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar receta"}
        </button>
      </form>
    </div>
  );
}
