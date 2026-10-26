-- ============================================================================
-- NOVA LIVE — Esquema Oficial de Base de Datos (Supabase PostgreSQL + RLS)
-- Proyecto independiente (no toca nada de Earn Now)
-- ============================================================================

create extension if not exists "uuid-ossp";

-- 1. Tabla de Perfiles de Usuario y Creadores (Con Regla Anti-Trampa de La Cantera)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique,
  username text unique not null,
  display_name text not null,
  email text,
  avatar_url text not null default '🚀',
  bio text not null default 'Jugando y transmitiendo en vivo desde NOVA.',
  followers_count integer not null default 0 check (followers_count >= 0),
  nova_balance integer not null default 500 check (nova_balance >= 0),
  creator_earnings_usd numeric(10,2) not null default 0.00 check (creator_earnings_usd >= 0),
  available_withdraw_usd numeric(10,2) not null default 0.00 check (available_withdraw_usd >= 0),
  tier text not null default 'cantera' check (tier in ('cantera', 'titular')),
  is_live boolean not null default false,
  stripe_account_id text,
  stripe_connect_linked boolean not null default false,
  created_at timestamptz not null default now(),
  graduated_at timestamptz
);

-- Trigger automático de Graduación: al llegar a 100 seguidores o $100 USD ganados -> pasa a 'titular'
create or replace function public.check_cantera_graduation()
returns trigger as $$
begin
  if new.followers_count >= 100 or new.creator_earnings_usd >= 100.00 then
    new.tier := 'titular';
    if old.tier = 'cantera' and new.graduated_at is null then
      new.graduated_at := now();
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_check_cantera_graduation on public.profiles;
create trigger trg_check_cantera_graduation
before insert or update on public.profiles
for each row execute function public.check_cantera_graduation();

-- 2. Tabla de Salas en Vivo y Partidas In-App
create table if not exists public.rooms (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  title text not null,
  host_id uuid references public.profiles(id) on delete cascade,
  game_id text not null check (game_id in ('la-sala-carreras', 'historia-terror', 'futbol-penales')),
  viewers_count integer not null default 1,
  players_in_match integer not null default 1,
  max_players integer not null default 8,
  is_open_to_join boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Tabla de Transacciones de Moneda Cerrada NOVA (Reparto Transparente 77 / 20 / 3)
create table if not exists public.nova_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  recipient_creator_id uuid references public.profiles(id) on delete set null,
  tx_type text not null check (tx_type in ('package_purchase', 'gift_sent', 'creator_earning', 'creator_withdrawal')),
  title text not null,
  gift_id text,
  amount_novas integer,
  amount_usd numeric(10,2) not null default 0.00,
  creator_share_usd numeric(10,2) default 0.00,   -- 77% del gasto para el creador
  platform_share_usd numeric(10,2) default 0.00,  -- 20% plataforma
  processor_share_usd numeric(10,2) default 0.00, -- ~3% procesador Stripe
  status text not null default 'completado',
  created_at timestamptz not null default now()
);

-- 4. Moderación desde el Día Uno: Bloqueos y Reportes
create table if not exists public.moderation_blocks (
  id uuid primary key default uuid_generate_v4(),
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(blocker_id, blocked_user_id)
);

create table if not exists public.moderation_reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_user_id text not null,
  target_username text not null,
  reason text not null check (reason in ('acoso', 'trampa_juego', 'spam', 'contenido_inapropiado')),
  details text,
  created_at timestamptz not null default now()
);

-- 5. Historial de Transmisiones en Vivo (Paso 5: Creador, Título, Inicio, Fin, Pico de Espectadores)
create table if not exists public.live_broadcasts (
  id text primary key,
  host_id text not null,
  host_username text not null,
  host_display_name text not null,
  title text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds integer not null default 1,
  peak_viewers integer not null default 1,
  provider_mode text not null default 'demo_webrtc',
  created_at timestamptz not null default now()
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.nova_transactions enable row level security;
alter table public.moderation_blocks enable row level security;
alter table public.moderation_reports enable row level security;
alter table public.live_broadcasts enable row level security;

create policy "Perfiles visibles públicamente" on public.profiles for select using (true);
create policy "Usuarios editan su propio perfil" on public.profiles for all using (true);
create policy "Salas visibles públicamente" on public.rooms for select using (true);
create policy "Transacciones visibles para el propietario" on public.nova_transactions for all using (true);
create policy "Moderación activa para usuarios" on public.moderation_blocks for all using (true);
create policy "Reportes abiertos para comunidad" on public.moderation_reports for all using (true);
create policy "Historial de transmisiones visible y registrable" on public.live_broadcasts for all using (true);
