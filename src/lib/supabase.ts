import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa NOTAS-CLAVES.md y crea .env.local."
  );
}

export const supabase = createClient(url, anonKey);

export const RECIPE_PHOTOS_BUCKET = "recipe-photos";
