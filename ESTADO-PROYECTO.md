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
  `recipe-photos` público **con 4 policies activas** (SELECT/INSERT/UPDATE/
  DELETE, rol `public`, condición `bucket_id = 'recipe-photos'`) — creadas
  desde la UI del dashboard (`Storage > Policies`), no por SQL Editor.
- `.env.local` ya tiene las claves (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY),
  también respaldadas en `NOTAS-CLAVES.md` (ninguno de los dos se sube a git).
- `scripts/seed.mjs` corrido con éxito: **30 recetas sembradas** con foto
  cada una en el bucket `recipe-photos` (prefijo `seed/`).
- **Desplegado en Vercel:** proyecto `recetario-gaby`, conectado al repo de
  GitHub (auto-deploy en cada push a `main`). URL de producción:
  `https://recetario-gaby.vercel.app`. Env vars (`NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`) agregadas en Production/Preview/
  Development vía `vercel env add`.

## Bloqueo resuelto (para referencia futura)

El bloqueo de Storage (`403 AccessDenied` al subir fotos) NO se resolvía
con policies creadas por SQL Editor sobre `storage.objects` — aunque
corrían sin error, el dashboard mostraba "No policies created yet" para el
bucket. La solución fue crear las policies **desde la UI de Storage**
(`Storage > Policies > recipe-photos > New policy > For full customization`),
marcando las 4 operaciones y dejando "Target roles" vacío (aplica a
`public`). Si este problema vuelve a aparecer con otro bucket, ir directo
a la UI en vez de SQL genérico.

## Próximos pasos posibles

- Probar `/recetas` y `/menu` en producción con Gaby (usuaria final).
- Si se agregan más recetas o se ajusta el algoritmo de menú, solo hace
  falta `git push` a `main` — Vercel despliega solo.
- Revisar si se quiere dominio propio en vez de `.vercel.app`.

## Otras notas de sesiones pasadas

- El servidor local se corre con `npm run dev` (Turbopack, puerto 3000).
- El formulario de agregar receta ya solo muestra el selector de proteína
  cuando la categoría es "Guisados" (es la única categoría donde el
  generador de menú la usa).
- La zona de subir foto se rediseñó para ser más clara (botón grande,
  vista previa, opción de cambiar/quitar).
