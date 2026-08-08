import imageCompression from "browser-image-compression";
import { RECIPE_PHOTOS_BUCKET, supabase } from "./supabase";
import type { Category, NewRecipe, Recipe } from "./types";

export async function listRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Recipe[];
}

export async function listRecipesByCategory(
  category: Category
): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Recipe[];
}

// Comprime la foto en el navegador antes de subirla, para no explotar el
// almacenamiento ni el ancho de banda del servidor.
export async function compressAndUploadPhoto(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: "image/webp",
  });

  const fileName = `${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(RECIPE_PHOTOS_BUCKET)
    .upload(fileName, compressed, {
      contentType: "image/webp",
      cacheControl: "31536000",
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(RECIPE_PHOTOS_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function createRecipe(recipe: NewRecipe): Promise<Recipe> {
  const { data, error } = await supabase
    .from("recipes")
    .insert(recipe)
    .select()
    .single();

  if (error) throw error;
  return data as Recipe;
}

export async function updateRecipe(
  id: string,
  patch: Partial<NewRecipe>
): Promise<Recipe> {
  const { data, error } = await supabase
    .from("recipes")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Recipe;
}

// Borra el archivo de una foto vieja del bucket, sin tronar si ya no existe.
export async function deletePhotoFile(photoUrl: string): Promise<void> {
  const fileName = photoUrl.split("/").pop();
  if (fileName) {
    await supabase.storage.from(RECIPE_PHOTOS_BUCKET).remove([fileName]);
  }
}

export async function deleteRecipe(recipe: Recipe): Promise<void> {
  const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);
  if (error) throw error;

  if (recipe.photo_url) {
    await deletePhotoFile(recipe.photo_url);
  }
}
