# Estado del proyecto — Recetario de Gaby

Notas de dónde se quedó el trabajo, para retomarlo sin perder contexto.
(Este archivo sí se sube a git a propósito, no tiene secretos.)

## Lo que ya funciona

- App Next.js completa: landing retro, `/recetas` (alta/baja de recetas con
  foto comprimida), `/menu` (generador de menú semanal con todas las reglas,
  lista de compras, PDF).
- Repo en GitHub: `github.com/dleonmx/Recetario-mama` (público), todo
  pusheado a `main`.
- Supabase configurado: proyecto `tstjdedbfpvqmqlnclyh`, tablas `recipes`,
  `menu_weeks`, `menu_week_items` creadas (`supabase/schema.sql`), bucket
  `recipe-photos` creado como público.
- `.env.local` ya tiene las claves (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY),
  también respaldadas en `NOTAS-CLAVES.md` (ninguno de los dos se sube a git).
- `scripts/seed.mjs` con las 30 recetas de "txt comida.txt" listas para
  sembrar (con imágenes placeholder pixel-art generadas en `scripts/png.mjs`
  y `scripts/icons.mjs`), pero **no se ha corrido con éxito todavía** por el
  bloqueo de abajo.

## Bloqueo pendiente (esto es lo primero que hay que resolver mañana)

Subir fotos al bucket `recipe-photos` falla con:
`StorageApiError: new row violates row-level security policy (403 AccessDenied)`

Ya se intentó (y NO funcionó):
```sql
create policy "recipe_photos_read" on storage.objects
  for select using (bucket_id = 'recipe-photos');
create policy "recipe_photos_insert" on storage.objects
  for insert with check (bucket_id = 'recipe-photos');
create policy "recipe_photos_delete" on storage.objects
  for delete using (bucket_id = 'recipe-photos');
```
Esto SÍ corrió sin error en el SQL Editor, pero el upload sigue fallando
igual. Se confirmó con una prueba directa que:
- Insertar filas en la tabla `recipes` SÍ funciona (RLS de tablas normales
  está bien).
- Solo Storage (`storage.objects`) sigue rechazando el insert.

**Próximo paso sugerido:** en vez de más SQL a ciegas, revisar directo en
el dashboard: `Storage > Policies` (`https://supabase.com/dashboard/project/tstjdedbfpvqmqlnclyh/storage/policies`)
para ver si las 3 políticas realmente aparecen ahí y a qué rol están
aplicando. Puede que haga falta crearlas desde la UI de Storage (que a
veces maneja algunos detalles distintos a una policy de SQL genérica), o
que el bucket necesite otro ajuste de "Public" adicional a las policies.

Una vez resuelto esto:
1. Correr `node scripts/seed.mjs` desde la raíz del proyecto (con
   `npm install` ya hecho) para sembrar las 30 recetas.
2. Probar `/recetas` y `/menu` con datos reales.
3. Conectar el repo a Vercel (Daniel ya tiene cuenta) y agregar las mismas
   env vars ahí.

## Otras notas de la sesión

- El servidor local se corrió con `npm run dev` (Turbopack, puerto 3000) y
  respondía bien (HTTP 200 en `/`, `/recetas`, `/menu`) antes de pausar.
  Si ya no está corriendo, solo hace falta `npm run dev` de nuevo.
- El formulario de agregar receta ya solo muestra el selector de proteína
  cuando la categoría es "Guisados" (es la única categoría donde el
  generador de menú la usa) — esto fue un ajuste pedido en la sesión.
- La zona de subir foto se rediseñó para ser más clara (botón grande,
  vista previa, opción de cambiar/quitar).
