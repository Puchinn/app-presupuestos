-- Migración: Creación de tablas de entidades principales para app-presupuestos
-- Ejecutar en Supabase local (vía Supabase Studio o CLI)

-- 1. Tabla de Clientes
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.clients enable row level security;

create policy "Usuarios pueden ver sus propios clientes"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "Usuarios pueden crear sus propios clientes"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "Usuarios pueden actualizar sus propios clientes"
  on public.clients for update
  using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus propios clientes"
  on public.clients for delete
  using (auth.uid() = user_id);


-- 2. Tabla de Servicios
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  price numeric not null default 0,
  quantity numeric not null default 1,
  details text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.services enable row level security;

create policy "Usuarios pueden ver sus propios servicios"
  on public.services for select
  using (auth.uid() = user_id);

create policy "Usuarios pueden crear sus propios servicios"
  on public.services for insert
  with check (auth.uid() = user_id);

create policy "Usuarios pueden actualizar sus propios servicios"
  on public.services for update
  using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus propios servicios"
  on public.services for delete
  using (auth.uid() = user_id);


-- 3. Tabla de Categorías de Ítems (budget_items)
create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now() not null
);

alter table public.budget_items enable row level security;

create policy "Usuarios pueden ver categorías de items"
  on public.budget_items for select
  using (auth.uid() = user_id or user_id is null);

create policy "Usuarios pueden crear sus categorías de items"
  on public.budget_items for insert
  with check (auth.uid() = user_id);


-- 4. Tabla de Textos Frecuentes / Cláusulas (text_items)
create table if not exists public.text_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  budget_item_id uuid references public.budget_items(id) on delete cascade,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.text_items enable row level security;

create policy "Usuarios pueden ver sus propios text_items"
  on public.text_items for select
  using (auth.uid() = user_id);

create policy "Usuarios pueden crear sus propios text_items"
  on public.text_items for insert
  with check (auth.uid() = user_id);

create policy "Usuarios pueden actualizar sus propios text_items"
  on public.text_items for update
  using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus propios text_items"
  on public.text_items for delete
  using (auth.uid() = user_id);


-- 5. Tabla de Presupuestos (budgets)
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  public_code text not null default 'BORRADOR#',
  status text not null default 'draft' check (status in ('draft', 'issued')),
  dates jsonb not null default '{"sent":"","estimated":""}',
  client_name text default '',
  logo_url text default '',
  services jsonb not null default '[]',
  conditions text default '',
  budget_details text default '',
  participants jsonb not null default '[]',
  website text default '',
  contact_number text default '',
  footer_img_url text default '',
  total_price_services numeric default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.budgets enable row level security;

create policy "Usuarios pueden ver sus propios presupuestos"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Usuarios pueden crear sus propios presupuestos"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Usuarios pueden actualizar sus propios presupuestos"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus propios presupuestos"
  on public.budgets for delete
  using (auth.uid() = user_id);
