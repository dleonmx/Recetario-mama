import { createGoogle } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

const shoppingListSchema = z.object({
  groups: z
    .array(
      z.object({
        section: z
          .string()
          .describe(
            'Nombre de la sección del mercado en español, ej. "Verduras y frutas", "Carnes y pescados", "Lácteos y huevo", "Abarrotes y despensa", "Panadería", "Especias y condimentos", "Limpieza y hogar", "Otros".'
          ),
        items: z
          .array(z.string())
          .describe(
            "Ingredientes de esa sección, fusionando duplicados obvios (ej. combinar cantidades del mismo ingrediente cuando sea sencillo)."
          ),
      })
    )
    .describe("Lista de secciones del mercado con sus ingredientes."),
});

interface RecipeInput {
  name: string;
  ingredients: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Falta configurar GEMINI_API_KEY en el servidor." },
      { status: 500 }
    );
  }

  let recipes: RecipeInput[];
  try {
    const body = await request.json();
    recipes = Array.isArray(body?.recipes) ? body.recipes : [];
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (recipes.length === 0) {
    return Response.json({ groups: [] });
  }

  const ingredientBlock = recipes
    .map((r) => `- ${r.name}:\n${r.ingredients || "(sin ingredientes capturados)"}`)
    .join("\n\n");

  const google = createGoogle({ apiKey });

  try {
    const { output } = await generateText({
      model: google("gemini-2.5-flash"),
      output: Output.object({ schema: shoppingListSchema }),
      prompt: `Eres un asistente que organiza listas de compras para ir a un mercado o tienda en México.

Aquí están los ingredientes de las recetas del menú de la semana, tal como los escribió el usuario (pueden venir con cantidades, en cualquier orden, y con ingredientes repetidos entre recetas):

${ingredientBlock}

Junta todos los ingredientes de todas las recetas en una sola lista de compras, agrupada por sección del mercado (verduras y frutas, carnes y pescados, lácteos y huevo, abarrotes y despensa, panadería, especias y condimentos, limpieza y hogar, otros — usa solo las secciones que apliquen). Fusiona ingredientes duplicados o muy similares en una sola línea, sumando cantidades cuando sea sencillo y quede claro (ej. "2 jitomates" + "3 jitomates" -> "5 jitomates"); si no es sencillo sumarlos, solo evita listarlos dos veces exactamente igual. No inventes ingredientes que no estén en la lista.`,
    });

    return Response.json(output);
  } catch (err) {
    console.error("Error generando lista de compras con Gemini:", err);
    return Response.json(
      { error: "No se pudo organizar la lista con IA." },
      { status: 502 }
    );
  }
}
