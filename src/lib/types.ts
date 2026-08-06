export type Category =
  | "guisados"
  | "sopas"
  | "salsas"
  | "guarniciones"
  | "limpieza";

export type Protein = "pollo" | "carne" | "pescado" | "ninguno";

// Categorías que participan en el generador de menú semanal.
export type MenuCategory = Exclude<Category, "limpieza">;

export const CATEGORIES: Category[] = [
  "guisados",
  "sopas",
  "salsas",
  "guarniciones",
  "limpieza",
];

export const MENU_CATEGORIES: MenuCategory[] = [
  "guisados",
  "sopas",
  "salsas",
  "guarniciones",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  guisados: "Guisados",
  sopas: "Sopas",
  salsas: "Salsas",
  guarniciones: "Guarniciones",
  limpieza: "Limpieza de la casa",
};

export const PROTEIN_LABELS: Record<Protein, string> = {
  pollo: "Pollo",
  carne: "Carne",
  pescado: "Pescado",
  ninguno: "-",
};

// Cuántas recetas de cada categoría se eligen al generar la semana.
export const MENU_SLOT_COUNTS: Record<MenuCategory, number> = {
  guisados: 3,
  guarniciones: 2,
  sopas: 2,
  salsas: 2,
};

export interface Recipe {
  id: string;
  name: string;
  category: Category;
  protein: Protein;
  photo_url: string | null;
  ingredients: string | null;
  instructions: string | null;
  created_at: string;
}

export type NewRecipe = Omit<Recipe, "id" | "created_at">;

export interface MenuWeek {
  id: string;
  week_start: string;
  created_at: string;
}

export interface MenuWeekItem {
  id: string;
  menu_week_id: string;
  recipe_id: string;
  slot_type: MenuCategory;
  slot_position: number;
}

export interface MenuWeekItemWithRecipe extends MenuWeekItem {
  recipe: Recipe;
}

export interface GeneratedMenu {
  week: MenuWeek;
  items: MenuWeekItemWithRecipe[];
  warnings: string[];
}
