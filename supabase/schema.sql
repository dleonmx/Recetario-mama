-- Recetario de Gaby - esquema inicial
-- Corre esto completo en el SQL editor de tu proyecto de Supabase (Database > SQL Editor > New query)

create extension if not exists "pgcrypto";

create type categoria as enum ('guisados','sopas','salsas','guarniciones','limpieza');
create type proteina as enum ('pollo','carne','pescado','ninguno');

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category categoria not null,
  protein proteina not null default 'ninguno',
  photo_url text,
  ingredients text,      -- un ingrediente por línea
  instructions text,     -- preparación
  created_at timestamptz not null default now()
);

create table if not exists menu_weeks (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  created_at timestamptz not null default now()
);

create table if not exists menu_week_items (
  id uuid primary key default gen_random_uuid(),
  menu_week_id uuid not null references menu_weeks(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  slot_type categoria not null,   -- guisados / sopas / salsas / guarniciones
  slot_position int not null      -- 1..3 dentro del slot_type de esa semana
);

create index if not exists idx_recipes_category on recipes(category);
create index if not exists idx_menu_week_items_week on menu_week_items(menu_week_id);
create index if not exists idx_menu_week_items_recipe on menu_week_items(recipe_id);

-- Sin login en la app: se usa la clave "anon" con RLS abierto de lectura/escritura.
-- La seguridad real es que la URL de la app no se comparte públicamente.
alter table recipes enable row level security;
alter table menu_weeks enable row level security;
alter table menu_week_items enable row level security;

create policy "recipes_all" on recipes for all using (true) with check (true);
create policy "menu_weeks_all" on menu_weeks for all using (true) with check (true);
create policy "menu_week_items_all" on menu_week_items for all using (true) with check (true);

-- Después de correr esto:
-- 1. Ve a Storage > Create a new bucket
--    - Nombre: recipe-photos
--    - Public bucket: SI (activado)
-- 2. Ya puedes pegar tus claves en NOTAS-CLAVES.md en la raíz del proyecto.
