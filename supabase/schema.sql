-- =============================================================================
-- ESQUEMA SUPABASE POSTGRES + ROW LEVEL SECURITY (RLS) · CUADRA IMPERIAL LOY
-- Listo para ejecutar en el SQL Editor de Supabase cuando se conecte la base.
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1. TABLA DE CABALLOS (Datos públicos + separados de precios internos)
create table if not exists public.horses (
  id text primary key,
  name text not null,
  slug text not null unique,
  code text not null unique,
  sex text check (sex in ('semental', 'entero', 'castrado', 'yegua', 'potro')),
  type text not null check (type in ('sale', 'stud')),
  origin text not null check (origin in ('Holanda', 'Nacional')),
  birth_date date,
  height_m numeric(4,2),
  registration_number text,
  microchip text,
  full_paper boolean default true,
  sire text,
  damsire text,
  dam text,
  show_dam boolean default false,
  awards text[] default '{}',
  level text check (level in ('potro', 'iniciando_rienda', 'con_rienda', 'alta_escuela')),
  bloodline_es text not null default '',
  bloodline_en text not null default '',
  description_es text not null default '',
  description_en text not null default '',
  vet_summary_es text not null default '',
  vet_summary_en text not null default '',
  cover_photo text not null,
  hover_photo text,
  gallery jsonb not null default '[]'::jsonb,
  main_video text,
  video_poster text,
  available_document_types text[] default '{}',
  status text not null default 'draft' check (status in ('draft', 'available', 'en_route', 'reserved', 'sold', 'archived')),
  estimated_arrival_date date,
  published boolean not null default false,
  sort_order integer not null default 1,
  updated_at timestamptz not null default now()
);

-- 2. TABLA PRIVADA DE PRECIOS INTERNOS Y DOCUMENTOS (NUNCA ACCESIBLE POR ANON)
create table if not exists public.horse_private_data (
  horse_id text primary key references public.horses(id) on delete cascade,
  internal_price_mxn numeric(12,2),
  internal_price_usd numeric(12,2),
  private_documents jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3. TABLA DE LEADS (RLS estricta: solo lectura para usuarios autenticados del CMS)
create table if not exists public.leads (
  id text primary key,
  folio text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  intent text not null,
  horse_codes text[] default '{}',
  horse_names text[] default '{}',
  page text not null,
  cta_position text not null,
  lang text not null default 'es',
  device text not null default 'desktop',
  country_approx text default 'MX',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  name text,
  whatsapp text,
  city_country text,
  preferred_day text,
  party_size integer,
  bringing_vet_or_trainer boolean default false,
  purpose text,
  mare_info text,
  consent_accepted boolean not null default false,
  consent_timestamp timestamptz,
  consent_version text not null default '2026.11',
  consent_ip_hash text,
  stage text not null default 'nuevo',
  loss_reason text,
  assigned_to text not null default 'Ventas',
  appointment_date date,
  appointment_time text,
  deposit_mxn numeric(12,2),
  final_horse_code text,
  first_response_at timestamptz,
  interactions jsonb not null default '[]'::jsonb,
  anonymized_at timestamptz
);

-- 4. BITÁCORA DE AUDITORÍA
create table if not exists public.audit_logs (
  id text primary key,
  timestamp timestamptz not null default now(),
  actor text not null,
  role text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  summary text not null
);

-- HABILITAR ROW LEVEL SECURITY (RLS)
alter table public.horses enable row level security;
alter table public.horse_private_data enable row level security;
alter table public.leads enable row level security;
alter table public.audit_logs enable row level security;

-- Políticas públicas: solo lectura de caballos publicados (sin precios internos)
create policy "Public read published horses"
  on public.horses for select
  to anon, authenticated
  using (published = true and status not in ('draft', 'archived'));

-- Precios internos y leads: NUNCA expuestos a anon
create policy "Authenticated staff manage private horse data"
  on public.horse_private_data for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated staff manage leads"
  on public.leads for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated staff read audit logs"
  on public.audit_logs for select
  to authenticated
  using (true);

