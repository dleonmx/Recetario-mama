"use client";

import { useEffect, useState } from "react";
import {
  buildOrganizedShoppingListText,
  buildShoppingListText,
  generateWeeklyMenu,
  getLatestMenu,
  organizeShoppingList,
  regenerateMenuItem,
  type ShoppingListGroup,
} from "@/lib/menu";
import {
  CATEGORY_LABELS,
  MENU_CATEGORIES,
  PROTEIN_LABELS,
  type GeneratedMenu,
  type MenuWeekItemWithRecipe,
} from "@/lib/types";

export function MenuView() {
  const [menu, setMenu] = useState<GeneratedMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [shoppingGroups, setShoppingGroups] = useState<ShoppingListGroup[] | null>(null);
  const [organizingList, setOrganizingList] = useState(false);
  const [organizeError, setOrganizeError] = useState<string | null>(null);

  useEffect(() => {
    getLatestMenu()
      .then(setMenu)
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar el menú."))
      .finally(() => setLoadingInitial(false));
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const result = await generateWeeklyMenu();
      setMenu(result);
      setShowShoppingList(false);
      setShoppingGroups(null);
      setOrganizeError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el menú.");
    } finally {
      setLoading(false);
    }
  }

  async function handleChange(item: MenuWeekItemWithRecipe) {
    if (!menu) return;
    setChangingId(item.id);
    try {
      const { item: updated, warning } = await regenerateMenuItem(menu.week.id, item);
      setMenu({
        ...menu,
        items: menu.items.map((i) => (i.id === updated.id ? updated : i)),
        warnings: warning ? [...menu.warnings, warning] : menu.warnings,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la receta.");
    } finally {
      setChangingId(null);
    }
  }

  async function handleDownloadPdf() {
    if (!menu) return;
    setGeneratingPdf(true);
    try {
      const [{ pdf }, { CookingPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/pdf/CookingPdf"),
      ]);
      const blob = await pdf(<CookingPdf items={menu.items} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `menu-semana-${menu.week.week_start}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleToggleShoppingList() {
    if (showShoppingList) {
      setShowShoppingList(false);
      return;
    }
    setShowShoppingList(true);
    if (!menu || shoppingGroups || organizingList) return;
    setOrganizingList(true);
    setOrganizeError(null);
    try {
      const groups = await organizeShoppingList(menu.items);
      setShoppingGroups(groups);
    } catch (err) {
      setOrganizeError(
        err instanceof Error ? err.message : "No se pudo organizar la lista con IA."
      );
    } finally {
      setOrganizingList(false);
    }
  }

  function shoppingListText(): string {
    if (!menu) return "";
    if (shoppingGroups) return buildOrganizedShoppingListText(shoppingGroups);
    return buildShoppingListText(menu.items);
  }

  function copyShoppingList() {
    navigator.clipboard.writeText(shoppingListText());
  }

  if (loadingInitial) {
    return <p className="text-sm text-retro-accent-3">Cargando...</p>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="pixel-btn font-pixel bg-retro-accent px-4 py-3 text-xs text-retro-panel disabled:opacity-60"
      >
        {loading ? "Generando..." : menu ? "Generar de nuevo" : "Generar menú de la semana"}
      </button>

      {error && <p className="text-retro-accent-2 text-sm">{error}</p>}

      {menu && menu.warnings.length > 0 && (
        <div className="pixel-border bg-retro-panel-2 space-y-1 p-3 text-xs text-retro-accent">
          {menu.warnings.map((w, i) => (
            <p key={i}>⚠️ {w}</p>
          ))}
        </div>
      )}

      {menu && menu.items.length === 0 && (
        <p className="text-sm">No hay recetas suficientes todavía. Agrega recetas primero.</p>
      )}

      {menu && menu.items.length > 0 && (
        <>
          {MENU_CATEGORIES.map((category) => {
            const inCategory = menu.items.filter((i) => i.slot_type === category);
            if (inCategory.length === 0) return null;
            return (
              <section key={category}>
                <h2 className="font-pixel mb-3 text-sm text-retro-accent">
                  {CATEGORY_LABELS[category]}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {inCategory.map((item) => {
                    const expanded = expandedId === item.id;
                    return (
                      <div key={item.id} className="pixel-border bg-retro-panel p-3">
                        <div
                          className="flex cursor-pointer gap-3"
                          onClick={() => setExpandedId(expanded ? null : item.id)}
                        >
                          {item.recipe.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.recipe.photo_url}
                              alt={item.recipe.name}
                              style={{ imageRendering: "pixelated" }}
                              className="h-16 w-16 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded bg-retro-panel-2 text-2xl">
                              🍽️
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold">{item.recipe.name}</p>
                            {item.recipe.protein !== "ninguno" && (
                              <p className="text-xs text-retro-accent-3">
                                {PROTEIN_LABELS[item.recipe.protein]}
                              </p>
                            )}
                          </div>
                        </div>

                        {expanded && (
                          <div className="mt-3 space-y-2 text-xs" onClick={(e) => e.stopPropagation()}>
                            {item.recipe.ingredients && (
                              <p className="whitespace-pre-line">
                                <span className="text-retro-accent-2">Ingredientes:</span>{" "}
                                {item.recipe.ingredients}
                              </p>
                            )}
                            {item.recipe.instructions && (
                              <p className="whitespace-pre-line">
                                <span className="text-retro-accent-2">Preparación:</span>{" "}
                                {item.recipe.instructions}
                              </p>
                            )}
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChange(item);
                          }}
                          disabled={changingId === item.id}
                          className="pixel-btn font-pixel mt-3 w-full bg-retro-accent-3 px-2 py-2 text-[10px] text-retro-panel disabled:opacity-60"
                        >
                          {changingId === item.id ? "Cambiando..." : "🔄 Cambiar"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <div className="flex flex-wrap gap-3 pt-4">
            <button
              onClick={handleToggleShoppingList}
              className="pixel-btn font-pixel bg-retro-panel-2 px-3 py-2 text-[10px] text-foreground sm:text-xs"
            >
              🛒 {showShoppingList ? "Ocultar" : "Ver"} lista de compras
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              className="pixel-btn font-pixel bg-retro-panel-2 px-3 py-2 text-[10px] text-foreground disabled:opacity-60 sm:text-xs"
            >
              {generatingPdf ? "Generando PDF..." : "📄 Descargar PDF de recetas"}
            </button>
          </div>

          {showShoppingList && (
            <div className="pixel-border bg-retro-panel-2 space-y-3 p-4">
              {organizingList && (
                <p className="text-sm text-retro-accent-3">
                  🤖 Organizando la lista por tipo de producto...
                </p>
              )}
              {organizeError && (
                <p className="text-xs text-retro-accent-2">
                  🤖 En este momento no se pudo organizar la lista con inteligencia
                  artificial. Aquí tienes los ingredientes de todas formas:
                </p>
              )}
              {!organizingList && (
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {shoppingListText()}
                </pre>
              )}
              <button
                onClick={copyShoppingList}
                disabled={organizingList}
                className="pixel-btn font-pixel bg-retro-accent px-3 py-2 text-[10px] text-retro-panel disabled:opacity-60"
              >
                Copiar para WhatsApp
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
