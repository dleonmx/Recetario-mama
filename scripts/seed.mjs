// Siembra las 30 recetas de ejemplo en Supabase con una imagen placeholder
// pixel-art por receta. Uso: node scripts/seed.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { renderPixelArtPng } from "./png.mjs";
import { ICONS } from "./icons.mjs";
import { SEED_RECIPES } from "./seed-data.mjs";

function loadEnvLocal() {
  const content = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
  return env;
}

const env = loadEnvLocal();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const { data: existing, error: existingError } = await supabase
    .from("recipes")
    .select("name");
  if (existingError) throw existingError;
  const existingNames = new Set((existing ?? []).map((r) => r.name));

  let created = 0;
  let skipped = 0;

  for (const recipe of SEED_RECIPES) {
    if (existingNames.has(recipe.name)) {
      skipped++;
      continue;
    }

    const icon = ICONS[recipe.icon];
    const png = renderPixelArtPng({
      rows: icon.rows,
      palette: icon.palette,
      background: icon.background,
      pixelSize: 18,
    });

    const fileName = `seed/${slugify(recipe.name)}.png`;
    const { error: uploadError } = await supabase.storage
      .from("recipe-photos")
      .upload(fileName, png, { contentType: "image/png", upsert: true });
    if (uploadError) throw new Error(`Subiendo foto de "${recipe.name}": ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from("recipe-photos").getPublicUrl(fileName);

    const { error: insertError } = await supabase.from("recipes").insert({
      name: recipe.name,
      category: recipe.category,
      protein: recipe.protein,
      photo_url: urlData.publicUrl,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
    });
    if (insertError) throw new Error(`Insertando "${recipe.name}": ${insertError.message}`);

    created++;
    console.log(`OK: ${recipe.name}`);
  }

  console.log(`\nListo. Creadas: ${created}, ya existían: ${skipped}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
