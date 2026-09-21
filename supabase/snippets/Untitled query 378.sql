create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  role text,
  avatar_url text,
  contact_number text,
  website text,
  logo_url text,
  footer_image_url text,
  counters jsonb default '{"budget_sequence":0}'
);

-- Habilitar seguridad (Row Level Security)
alter table public.profiles enable row level security;

-- Política simple para que cada usuario lea y edite solo su propio perfil
create policy "Los usuarios pueden ver su propio perfil." on public.profiles
  for select using (auth.uid() = id);

create policy "Los usuarios pueden actualizar su propio perfil." on public.profiles
  for update using (auth.uid() = id);