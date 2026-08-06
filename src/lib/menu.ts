import { supabase } from "./supabase";
import {
  CATEGORY_LABELS,
  MENU_CATEGORIES,
  MENU_SLOT_COUNTS,
  type GeneratedMenu,
  type MenuCategory,
  type MenuWeek,
  type MenuWeekItemWithRecipe,
  type Recipe,
} from "./types";

const PESCADO_CHANCE = 0.07;
// Cuántas "semanas generadas" recientes cuentan para la regla de no-repetir.
const HISTORY_WINDOW: Record<MenuCategory, number> = {
  guisados: 2,
  guarniciones: 2,
  sopas: 2,
  salsas: 1,
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function withoutIds<T extends { id: string }>(
  pool: T[],
  excluded: Set<string>
): T[] {
  return pool.filter((r) => !excluded.has(r.id));
}

function mondayOfCurrentWeek(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = domingo
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

interface RecentWeek {
  id: string;
  created_at: string;
  menu_week_items: { recipe_id: string; slot_type: MenuCategory }[];
}

async function fetchRecentWeeks(limit: number): Promise<RecentWeek[]> {
  const { data, error } = await supabase
    .from("menu_weeks")
    .select("id, created_at, menu_week_items(recipe_id, slot_type)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as RecentWeek[];
}

function excludedIdsForCategory(
  recentWeeks: RecentWeek[],
  category: MenuCategory
): Set<string> {
  const windowSize = HISTORY_WINDOW[category];
  const relevantWeeks = recentWeeks.slice(0, windowSize);
  const ids = new Set<string>();
  for (const week of relevantWeeks) {
    for (const item of week.menu_week_items) {
      if (item.slot_type === category) ids.add(item.recipe_id);
    }
  }
  return ids;
}

async function fetchRecipesByCategory(
  category: MenuCategory
): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("category", category);
  if (error) throw error;
  return data as Recipe[];
}

type GuisadoProtein = "pollo" | "carne" | "pescado";

/** Decide la proteína de cada uno de los 3 guisados de la semana. */
function assignGuisadoProteins(available: {
  pollo: number;
  carne: number;
  pescado: number;
}): GuisadoProtein[] {
  const canPescado = available.pescado > 0 && Math.random() < PESCADO_CHANCE;

  if (canPescado) {
    const slots: GuisadoProtein[] = ["pescado"];
    for (let i = 0; i < 2; i++) {
      slots.push(Math.random() < 0.5 ? "pollo" : "carne");
    }
    return slots;
  }

  // Sin pescado: reparto 2-1 entre pollo y carne (nunca 3-0).
  const mayoria: GuisadoProtein = Math.random() < 0.5 ? "pollo" : "carne";
  const minoria: GuisadoProtein = mayoria === "pollo" ? "carne" : "pollo";
  const slots: GuisadoProtein[] = [mayoria, mayoria, minoria];
  // Revolver el orden para que la minoría no siempre caiga en la misma posición.
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return slots;
}

function selectGuisados(
  pool: Recipe[],
  excludedHistory: Set<string>,
  warnings: string[]
): Recipe[] {
  const byProtein = {
    pollo: pool.filter((r) => r.protein === "pollo"),
    carne: pool.filter((r) => r.protein === "carne"),
    pescado: pool.filter((r) => r.protein === "pescado"),
  };

  const freshByProtein = {
    pollo: withoutIds(byProtein.pollo, excludedHistory),
    carne: withoutIds(byProtein.carne, excludedHistory),
    pescado: withoutIds(byProtein.pescado, excludedHistory),
  };

  const proteins = assignGuisadoProteins({
    pollo: freshByProtein.pollo.length,
    carne: freshByProtein.carne.length,
    pescado: freshByProtein.pescado.length,
  });

  const chosen: Recipe[] = [];
  const usedThisWeek = new Set<string>();

  for (const protein of proteins) {
    let candidates = withoutIds(freshByProtein[protein], usedThisWeek);
    if (candidates.length === 0) {
      // No hay variedad suficiente sin repetir historial: se relaja esa regla.
      candidates = withoutIds(byProtein[protein], usedThisWeek);
      if (candidates.length > 0) {
        warnings.push(
          `No había suficientes guisados de ${protein} sin repetir semanas anteriores; se repitió una receta.`
        );
      }
    }
    if (candidates.length === 0) {
      // Ni siquiera hay recetas de esa proteína: se toma cualquier guisado disponible.
      candidates = withoutIds(pool, usedThisWeek);
      if (candidates.length > 0) {
        warnings.push(
          `No hay recetas de guisado de ${protein} disponibles; se usó otra proteína.`
        );
      }
    }
    if (candidates.length === 0) break; // no hay más guisados disponibles en absoluto
    const recipe = pickRandom(candidates);
    chosen.push(recipe);
    usedThisWeek.add(recipe.id);
  }

  if (chosen.length < proteins.length) {
    warnings.push(
      `Solo hay ${chosen.length} de ${proteins.length} guisados disponibles. Sube más recetas de guisados.`
    );
  }

  return chosen;
}

function selectDistinct(
  pool: Recipe[],
  count: number,
  excludedHistory: Set<string>,
  category: string,
  warnings: string[]
): Recipe[] {
  const fresh = withoutIds(pool, excludedHistory);
  const chosen: Recipe[] = [];
  const usedThisWeek = new Set<string>();

  let source = fresh;
  for (let i = 0; i < count; i++) {
    let candidates = withoutIds(source, usedThisWeek);
    if (candidates.length === 0 && source !== pool) {
      source = pool; // se acabó la variedad sin repetir historial: se relaja
      candidates = withoutIds(source, usedThisWeek);
      if (candidates.length > 0) {
        warnings.push(
          `No había suficiente variedad de ${category} sin repetir semanas anteriores; se repitió alguna receta.`
        );
      }
    }
    if (candidates.length === 0) break;
    const recipe = pickRandom(candidates);
    chosen.push(recipe);
    usedThisWeek.add(recipe.id);
  }

  if (chosen.length < count) {
    warnings.push(
      `Solo hay ${chosen.length} de ${count} recetas de ${category} disponibles. Sube más recetas de ${category}.`
    );
  }

  return chosen;
}

async function buildSelection(): Promise<{
  selection: Record<MenuCategory, Recipe[]>;
  warnings: string[];
}> {
  const warnings: string[] = [];
  const recentWeeks = await fetchRecentWeeks(2);

  const pools: Record<MenuCategory, Recipe[]> = {
    guisados: await fetchRecipesByCategory("guisados"),
    guarniciones: await fetchRecipesByCategory("guarniciones"),
    sopas: await fetchRecipesByCategory("sopas"),
    salsas: await fetchRecipesByCategory("salsas"),
  };

  const selection: Record<MenuCategory, Recipe[]> = {
    guisados: [],
    guarniciones: [],
    sopas: [],
    salsas: [],
  };

  for (const category of MENU_CATEGORIES) {
    if (pools[category].length === 0) {
      warnings.push(
        `No hay recetas suficientes en ${CATEGORY_LABELS[category]}.`
      );
      continue;
    }
    const excluded = excludedIdsForCategory(recentWeeks, category);
    if (category === "guisados") {
      selection.guisados = selectGuisados(pools.guisados, excluded, warnings);
    } else {
      selection[category] = selectDistinct(
        pools[category],
        MENU_SLOT_COUNTS[category],
        excluded,
        CATEGORY_LABELS[category],
        warnings
      );
    }
  }

  return { selection, warnings };
}

export async function generateWeeklyMenu(): Promise<GeneratedMenu> {
  const { selection, warnings } = await buildSelection();

  const { data: week, error: weekError } = await supabase
    .from("menu_weeks")
    .insert({ week_start: mondayOfCurrentWeek() })
    .select()
    .single();
  if (weekError) throw weekError;

  const rows: {
    menu_week_id: string;
    recipe_id: string;
    slot_type: MenuCategory;
    slot_position: number;
  }[] = [];

  for (const category of MENU_CATEGORIES) {
    selection[category].forEach((recipe, index) => {
      rows.push({
        menu_week_id: week.id,
        recipe_id: recipe.id,
        slot_type: category,
        slot_position: index + 1,
      });
    });
  }

  const { data: insertedItems, error: itemsError } = await supabase
    .from("menu_week_items")
    .insert(rows)
    .select();
  if (itemsError) throw itemsError;

  const recipesById = new Map<string, Recipe>();
  for (const category of MENU_CATEGORIES) {
    for (const recipe of selection[category]) recipesById.set(recipe.id, recipe);
  }

  const items: MenuWeekItemWithRecipe[] = (insertedItems as MenuWeekItemWithRecipe[])
    .map((item) => ({ ...item, recipe: recipesById.get(item.recipe_id)! }))
    .sort((a, b) => a.slot_type.localeCompare(b.slot_type) || a.slot_position - b.slot_position);

  return { week: week as MenuWeek, items, warnings };
}

export async function regenerateMenuItem(
  menuWeekId: string,
  item: MenuWeekItemWithRecipe
): Promise<{ item: MenuWeekItemWithRecipe; warning?: string }> {
  const category = item.slot_type;
  const recentWeeks = await fetchRecentWeeks(2);
  const excludedHistory = excludedIdsForCategory(recentWeeks, category);

  const { data: currentItems, error: currentError } = await supabase
    .from("menu_week_items")
    .select("recipe_id")
    .eq("menu_week_id", menuWeekId)
    .eq("slot_type", category);
  if (currentError) throw currentError;

  const usedThisWeek = new Set(
    (currentItems ?? []).map((r) => r.recipe_id as string)
  );
  usedThisWeek.delete(item.recipe_id); // el propio slot que se va a reemplazar

  const pool = await fetchRecipesByCategory(category);
  let scoped = category === "guisados"
    ? pool.filter((r) => r.protein === item.recipe.protein)
    : pool;

  let warning: string | undefined;
  let candidates = withoutIds(withoutIds(scoped, excludedHistory), usedThisWeek);

  if (candidates.length === 0) {
    candidates = withoutIds(scoped, usedThisWeek);
    if (candidates.length > 0) {
      warning = "No había otra opción sin repetir semanas anteriores; se repitió una receta.";
    }
  }
  if (candidates.length === 0 && category === "guisados") {
    scoped = pool;
    candidates = withoutIds(withoutIds(scoped, excludedHistory), usedThisWeek);
    if (candidates.length === 0) candidates = withoutIds(scoped, usedThisWeek);
    if (candidates.length > 0) {
      warning = "No había más guisados de esa proteína disponibles; se cambió de proteína.";
    }
  }
  if (candidates.length === 0) {
    return { item, warning: "No hay otra receta disponible para cambiar." };
  }

  const newRecipe = pickRandom(candidates);

  const { data: updated, error: updateError } = await supabase
    .from("menu_week_items")
    .update({ recipe_id: newRecipe.id })
    .eq("id", item.id)
    .select()
    .single();
  if (updateError) throw updateError;

  return {
    item: { ...(updated as MenuWeekItemWithRecipe), recipe: newRecipe },
    warning,
  };
}

export async function getLatestMenu(): Promise<GeneratedMenu | null> {
  const { data: week, error: weekError } = await supabase
    .from("menu_weeks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (weekError) throw weekError;
  if (!week) return null;

  const { data: items, error: itemsError } = await supabase
    .from("menu_week_items")
    .select("*, recipe:recipes(*)")
    .eq("menu_week_id", week.id)
    .order("slot_type")
    .order("slot_position");
  if (itemsError) throw itemsError;

  return {
    week: week as MenuWeek,
    items: items as unknown as MenuWeekItemWithRecipe[],
    warnings: [],
  };
}

export function buildShoppingListText(items: MenuWeekItemWithRecipe[]): string {
  const lines: string[] = ["🛒 Lista de compras de la semana", ""];

  for (const category of MENU_CATEGORIES) {
    const inCategory = items.filter((i) => i.slot_type === category);
    if (inCategory.length === 0) continue;
    lines.push(`*${CATEGORY_LABELS[category]}*`);
    for (const item of inCategory) {
      lines.push(`- ${item.recipe.name}`);
      const ingredientLines = (item.recipe.ingredients ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      for (const ing of ingredientLines) lines.push(`   • ${ing}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
