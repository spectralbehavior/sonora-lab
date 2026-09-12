-- ═══════════════════════════════════════════════════════════════════════════
-- Sonora — Schema Supabase/PostgreSQL (espelho das tabelas de src/lib/db.ts)
-- RLS é OBRIGATÓRIA: dados de progresso/posts só do dono; admin via role.
-- Ativar: supabase db push (ou SQL editor). Depois defina no painel Auth:
--   Site URL + redirect para VERCEL_URL, e troque VITE_DATA_MODE=supabase.
-- ═══════════════════════════════════════════════════════════════════════════

-- helpers ─────────────────────────────────────────────────────────────────────
create schema if not exists app;

create or replace function app.is_admin() returns boolean language sql stable as
$$ select exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin') $$;

-- ── perfis (1:1 com auth.users) ──────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  username text unique check (username ~ '^[a-z0-9_.-]{3,24}$'),
  name text not null default '',
  bio text,
  artist_name text,
  level text check (level in ('iniciante','intermediario','avancado')),
  daw text check (daw in ('fl-studio','ableton','cubase','none')),
  genre text,
  goal text,
  mode text not null default 'beginner' check (mode in ('beginner','advanced')),
  public_portfolio boolean not null default false,
  locale text not null default 'pt-BR',
  weekly_goal_min int not null default 120,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

-- auto-create profile no signup
create or replace function app.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, user_id, name) values (new.id, new.id, coalesce(new.raw_user_meta_data->>'name', 'Produtor(a)'));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function app.handle_new_user();

-- ── catálogo educacional (público p/ leitura; escrita só admin) ─────────────
create table if not exists public.courses (
  id text primary key, slug text unique not null, title text not null, subtitle text, description text,
  track text not null, daw_id text, level text not null, "order" int not null,
  est_hours numeric not null, published boolean not null default false,
  objectives jsonb not null default '[]', tags jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
create table if not exists public.modules (
  id text primary key, course_id text not null references public.courses (id) on delete cascade,
  title text not null, summary text, "order" int not null default 1
);
create table if not exists public.lessons (
  id text primary key, course_id text not null references public.courses (id) on delete cascade,
  module_id text not null references public.modules (id) on delete cascade,
  title text not null, "order" int not null, duration_min int not null, level text not null,
  objective text not null default '', body text not null default '', demo text, practice jsonb, challenge text,
  checklist jsonb not null default '[]', files jsonb not null default '[]', video_url text,
  tags jsonb not null default '[]', daw_id text, daw_steps jsonb, is_sample boolean not null default false,
  verified jsonb, -- { daw, version, date } — carimbo anti-invenção (obrigatório p/ daw_steps)
  updated_at timestamptz not null default now()
);
create table if not exists public.quizzes (
  id text primary key, lesson_id text not null references public.lessons (id) on delete cascade,
  questions jsonb not null -- [{q, options[], correct}]
);
create table if not exists public.projects (
  id text primary key, slug text unique not null, title text not null, tagline text, brief text,
  criteria jsonb not null default '[]', checklist jsonb not null default '[]',
  files jsonb not null default '[]', linked_course_id text
);
create table if not exists public.genres (
  id text primary key, name text unique not null, color text, bpm int8range not null default '[120,130]',
  structure text, drums text, bass text, melodic text, sound_design text, arrangement text,
  mixing text, references jsonb not null default '[]', published boolean not null default true
);
create table if not exists public.daw_versions (
  id text primary key, daw_id text not null, version text not null, os text not null default 'Windows/macOS',
  content_version text not null default 'r1', updated_at date not null default current_date, notes text
);
create table if not exists public.resources (
  id text primary key, name text not null, kind text not null, category text, note text,
  licensed boolean not null default true, file_path text -- storage: /library/*
);
create table if not exists public.plugins (
  id text primary key, name text not null, vendor text, category text, daws jsonb not null default '[]',
  free_tier boolean, blurb text, docs_url text
);
create table if not exists public.challenges (
  id text primary key, week_type text not null default 'fixed', "offset" int not null default 0,
  title text not null, brief text not null, xp int not null default 250, tags jsonb not null default '[]'
);
create table if not exists public.achievements (
  id text primary key, codename text unique not null, title text not null, description text, icon text,
  xp int not null default 0, criteria jsonb not null -- { metric, value }
);

-- ── dados do aluno (RLS: só o dono) ──────────────────────────────────────────
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null, module_id text, course_id text not null,
  started_at timestamptz, completed_at timestamptz, seconds int not null default 0,
  exercise_done boolean not null default false, checks jsonb not null default '[]',
  quiz_score int,
  unique (user_id, lesson_id)
);
create table if not exists public.project_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id text not null, status text not null default 'andamento',
  checks jsonb not null default '[]', started_at timestamptz, completed_at timestamptz,
  submission_url text, submission_note text,
  unique (user_id, project_id)
);
create table if not exists public.challenge_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_key text not null, challenge_id text, done boolean not null default true,
  submitted_url text, unique (user_id, week_key, challenge_id)
);
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null, earned_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);
create table if not exists public.studio_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null, minutes int not null check (minutes between 1 and 1440), note text
);
create table if not exists public.finish_track (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day int not null check (day between 1 and 7), done boolean not null default false,
  note text, track_id text, unique (user_id, day)
);
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null, genre_id text, bpm int, notes text, linked_project text,
  created_at timestamptz not null default now()
);
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null, genre_id text, bpm int, musical_key text,
  status text not null default 'ideia' check (status in ('ideia','producao','mix','master','finalizada','publicada')),
  audio_path text, -- storage bucket: track-audio (private, signed URLs)
  cover_path text, notes text, public boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.track_feedback (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null, kind text not null check (kind in ('tecnica','musical')),
  ts_seconds int, -- comentário com timestamp (arquitetura de audit)
  text text not null, created_at timestamptz not null default now()
);

-- ── comunidade ───────────────────────────────────────────────────────────────
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete set null,
  author_name text not null, category text not null, title text not null, body text not null,
  tags jsonb not null default '[]', likes jsonb not null default '[]', favorites jsonb not null default '[]',
  reports jsonb not null default '[]', -- [{by, reason, resolved}]
  linked_track uuid references public.tracks (id), pinned boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz
);
create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete set null,
  author_name text not null, body text not null, ts_seconds int, likes jsonb not null default '[]',
  parent_id uuid references public.community_comments (id),
  created_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null, href text, icon text, read boolean not null default false, ts timestamptz not null default now()
);

-- ── negócios ─────────────────────────────────────────────────────────────────
create table if not exists public.plans (
  id text primary key, name text not null, price_monthly numeric(10,2) not null default 0,
  price_annual numeric(10,2) not null default 0, currency text not null default 'BRL',
  features jsonb not null default '[]', highlight boolean not null default false, badge text,
  stripe_ids jsonb, mp_ids jsonb, asaas_ids jsonb -- preços/preços-id por PSP (editável via admin)
);
create table if not exists public.coupons (
  id text primary key, code text unique not null, percent int not null check (percent between 1 and 90),
  active boolean not null default true, expires_at date, max_uses int, uses int not null default 0
);
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null references public.plans (id), status text not null default 'active',
  period text not null default 'monthly', provider text, external_id text unique,
  started_at timestamptz not null default now(), renews_at timestamptz
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text, amount numeric(10,2) not null, coupon_code text, provider text,
  external_id text, status text not null, ts timestamptz not null default now(), raw jsonb
);
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code text unique not null, course_id text not null, course_title text not null,
  user_name text not null, hours numeric, issued_at timestamptz not null default now(),
  verify_token text not null default md5(random()::text || clock_timestamp()::text)
);
create table if not exists public.consent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  essential boolean not null default true, analytics boolean not null default false,
  marketing boolean not null default false, updated_at timestamptz not null default now()
);
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  event text not null, props jsonb not null default '{}', ts timestamptz not null default now()
);
-- marketplace futuro (Fase 8): seller listings/orders/commissions — criar quando o feature nascer.

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.courses           enable row level security;
alter table public.modules           enable row level security;
alter table public.lessons           enable row level security;
alter table public.quizzes           enable row level security;
alter table public.projects          enable row level security;
alter table public.genres            enable row level security;
alter table public.daw_versions      enable row level security;
alter table public.resources         enable row level security;
alter table public.plugins           enable row level security;
alter table public.challenges        enable row level security;
alter table public.achievements      enable row level security;
alter table public.lesson_progress   enable row level security;
alter table public.project_progress  enable row level security;
alter table public.challenge_claims  enable row level security;
alter table public.user_achievements enable row level security;
alter table public.studio_sessions   enable row level security;
alter table public.finish_track      enable row level security;
alter table public.ideas             enable row level security;
alter table public.tracks            enable row level security;
alter table public.track_feedback    enable row level security;
alter table public.community_posts   enable row level security;
alter table public.community_comments enable row level security;
alter table public.notifications     enable row level security;
alter table public.plans             enable row level security;
alter table public.coupons           enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.payments          enable row level security;
alter table public.certificates      enable row level security;
alter table public.consent           enable row level security;
alter table public.analytics_events  enable row level security;

-- catálogo: leitura autenticada+anônima do que está publicado; escrita admin
drop policy if exists "catalog read" on public.courses;
create policy "catalog read" on public.courses for select using (published or app.is_admin());
drop policy if exists "catalog write admin" on public.courses;
create policy "catalog write admin" on public.courses for all using (app.is_admin()) with check (app.is_admin());
-- demais tabelas de catálogo seguem o mesmo padrão (read select true / write admin):
-- modules, lessons (com filtro de acesso pago aplicado na API, ver docs), quizzes, projects, genres, daw_versions, resources, plugins, challenges, achievements, plans, coupons(read).
create policy "modules read"  on public.modules  for select using (true);
create policy "modules write" on public.modules  for all using (app.is_admin()) with check (app.is_admin());
create policy "lessons read"  on public.lessons  for select using (true);
create policy "lessons write" on public.lessons  for all using (app.is_admin()) with check (app.is_admin());
create policy "quizzes read"  on public.quizzes  for select using (true);
create policy "quizzes write" on public.quizzes  for all using (app.is_admin()) with check (app.is_admin());
create policy "projects read" on public.projects for select using (true);
create policy "projects write" on public.projects for all using (app.is_admin()) with check (app.is_admin());
create policy "genres read"   on public.genres   for select using (true);
create policy "genres write"  on public.genres   for all using (app.is_admin()) with check (app.is_admin());
create policy "dawver read"   on public.daw_versions for select using (true);
create policy "dawver write"  on public.daw_versions for all using (app.is_admin()) with check (app.is_admin());
create policy "res read"      on public.resources for select using (true);
create policy "res write"     on public.resources for all using (app.is_admin()) with check (app.is_admin());
create policy "plg read"      on public.plugins  for select using (true);
create policy "plg write"     on public.plugins  for all using (app.is_admin()) with check (app.is_admin());
create policy "chal read"     on public.challenges for select using (true);
create policy "chal write"    on public.challenges for all using (app.is_admin()) with check (app.is_admin());
create policy "ach read"      on public.achievements for select using (true);
create policy "ach write"     on public.achievements for all using (app.is_admin()) with check (app.is_admin());
create policy "plans read"    on public.plans    for select using (true);
create policy "plans write"    on public.plans   for all using (app.is_admin()) with check (app.is_admin());
create policy "coupons read"  on public.coupons  for select using (active);
create policy "coupons write" on public.coupons  for all using (app.is_admin()) with check (app.is_admin());

-- aluno: dados próprios, CRUD completo
create policy "own lesson_progress"   on public.lesson_progress   for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own project_progress"  on public.project_progress  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own challenge_claims"  on public.challenge_claims  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own achievements"      on public.user_achievements for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own sessions"          on public.studio_sessions   for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own finish"            on public.finish_track      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own ideas"             on public.ideas             for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own notifications"     on public.notifications     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own consent"           on public.consent           for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own subs"              on public.subscriptions     for select using (user_id = auth.uid());
create policy "own payments"          on public.payments          for select using (user_id = auth.uid());
create policy "own certs"             on public.certificates      for select using (user_id = auth.uid());
-- certificados: verificação pública via RPC (abaixo) — sem select amplo.

-- tracks: dono edita; públicas visíveis a logados (perfis /produtor)
create policy "own tracks"   on public.tracks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "public tracks read" on public.tracks for select using (public = true);
create policy "feedback on public" on public.track_feedback for insert with check (
  exists (select 1 from public.tracks t where t.id = track_id and t.public) and user_id = auth.uid()
);
create policy "feedback read" on public.track_feedback for select using (
  exists (select 1 from public.tracks t where t.id = track_id and (t.public or t.user_id = auth.uid()))
);

-- comunidade: leitura para autenticados; autor cria/edita o seu; admin resolve denúncias
create policy "posts read"    on public.community_posts for select using (auth.uid() is not null);
create policy "posts insert"  on public.community_posts for insert with check (user_id = auth.uid());
create policy "posts update own" on public.community_posts for update using (user_id = auth.uid() or app.is_admin());
create policy "posts delete own" on public.community_posts for delete using (user_id = auth.uid() or app.is_admin());
create policy "comments read"   on public.community_comments for select using (auth.uid() is not null);
create policy "comments insert" on public.community_comments for insert with check (user_id = auth.uid());
create policy "comments delete" on public.community_comments for delete using (user_id = auth.uid() or app.is_admin());

-- perfis: públicos legíveis se owner opt-in (public_portfolio), dono edita
create policy "profiles read"  on public.profiles for select using (public_portfolio or user_id = auth.uid() or app.is_admin());
create policy "profiles write" on public.profiles for update using (user_id = auth.uid());
-- NINGUÉM altera role por API pública (evita self-promotion a admin; admin via painel server):
revoke update (role) on public.profiles from authenticated;

-- analytics: cliente só insere com consentimento; admin lê
create policy "events insert" on public.analytics_events for insert with check (user_id is null or user_id = auth.uid());
create policy "events read"   on public.analytics_events for select using (app.is_admin());

-- ── RPCs (security definer) ──────────────────────────────────────────────────
-- Verificação pública de certificado: retorna APENAS campos não sensíveis.
create or replace function public.verify_certificate(code text)
returns table (holder text, course text, hours numeric, issued_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.user_name, c.course_title, c.hours, c.issued_at from certificates c
  where c.code = upper(code) or c.id::text = code
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- Emissão (valida plano pago + curso 100% no servidor — não confiar no front)
create or replace function public.issue_certificate(course_id text)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); cert uuid; course public.courses%rowtype; done boolean;
begin
  if uid is null then raise exception 'auth required'; end if;
  select * into course from courses where id = course_id;
  if not found then raise exception 'curso inexistente'; end if;
  select (count(*) filter (where lp.completed_at is not null) = count(l.id) and count(l.id) > 0) into done
    from lessons l left join lesson_progress lp on lp.lesson_id = l.id and lp.user_id = uid
    where l.course_id = course.id;
  if not done then raise exception 'curso incompleto'; end if;
  if not exists (select 1 from subscriptions s where s.user_id = uid and s.status = 'active' and s.renews_at > now()) then
    raise exception 'requer plano ativo';
  end if;
  insert into certificates (user_id, code, course_id, course_title, user_name, hours)
  select uid, 'SNR-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4)),
         course.id, course.title, p.name, course.est_hours
  from profiles p where p.user_id = uid
  on conflict do nothing
  returning id into cert;
  return cert;
end $$;

-- XP/level: função derivada (espelho de src/lib/gamify.ts) — valores em settings.
create table if not exists public.settings (key text primary key, value jsonb not null, updated_at timestamptz default now());
create policy "settings read" on public.settings for select using (true); -- público: planos/níveis exibidos
alter table public.settings enable row level security;

-- ── Storage ──────────────────────────────────────────────────────────────────
-- Buckets (criar via painel ou API):
--   library      → público leitura (resources/presets da casa, licenciados)
--   track-audio  → privado; leitura por signed URL; upload tamanho máx 80 MB,
--                  content-type: audio/*; verificação de magic bytes via Edge Function
--   avatars      → público leitura, máx 2 MB, image/*
-- Exemplo de policy de upload (track-audio):
--   create policy "own audio" on storage.objects for insert to authenticated
--     with check (bucket_id='track-audio' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── Rate limiting (no Edge/DB) ───────────────────────────────────────────────
create table if not exists public.rate_buckets (
  key text primary key, count int not null default 1, window_start timestamptz not null default now()
);
alter table public.rate_buckets enable row level security; -- sem policies: só service role toca
-- Mentor: increment (user, 'mentor', dia) com cap por plano checado na Edge Function.

-- ── Índices ──────────────────────────────────────────────────────────────────
create index if not exists lp_user_idx  on public.lesson_progress (user_id, course_id);
create index if not exists posts_cat_idx on public.community_posts (category, created_at desc);
create index if not exists tracks_pub_idx on public.tracks (public, user_id);
create index if not exists events_idx   on public.analytics_events (event, ts desc);
create index if not exists certs_code_idx on public.certificates (code);

-- Logs de auditoria administrativa (quem mudou o quê no CMS)
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid not null, action text not null, table_name text not null, row_id text,
  patch jsonb, ts timestamptz not null default now()
);
alter table public.audit_log enable row level security;
create policy "admin audit read" on public.audit_log for select using (app.is_admin());
-- INSERT via trigger admin-only (service role escreve nos fluxos do painel).
