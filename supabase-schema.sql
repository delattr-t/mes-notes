-- ============================================================
--  Carnet — schéma Supabase
--  À coller tel quel dans Supabase → SQL Editor → Run.
--  Aucun compte : chaque appareil envoie son « code de carnet »
--  dans l'en-tête x-carnet-code, et la RLS ne laisse voir que
--  les lignes portant ce code.
-- ============================================================

-- Le code du carnet, lu dans l'en-tête de la requête.
create or replace function public.current_carnet() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.headers', true)::json ->> 'x-carnet-code', ''),
    '--aucun--'
  )
$$;

-- ---------- tables ----------

create table if not exists public.projects (
  id            text primary key,
  carnet_code   text not null,
  name          text        default '',
  description   text        default '',
  status        text        default 'En cours',
  progress      integer     default 0,
  progress_mode text        default 'auto',
  next_action   text        default '',
  deadline      bigint,
  deleted       boolean     default false,
  created_at    bigint      default 0,
  updated_at    bigint      default 0
);

create table if not exists public.notes (
  id          text primary key,
  carnet_code text not null,
  title       text    default '',
  content     text    default '',
  project_id  text,
  favorite    boolean default false,
  archived    boolean default false,
  deleted     boolean default false,
  created_at  bigint  default 0,
  updated_at  bigint  default 0
);

create table if not exists public.tasks (
  id           text primary key,
  carnet_code  text not null,
  project_id   text,
  title        text    default '',
  completed    boolean default false,
  sort_order   integer default 0,
  completed_at bigint,
  deleted      boolean default false,
  created_at   bigint  default 0,
  updated_at   bigint  default 0
);

create table if not exists public.ideas (
  id                text primary key,
  carnet_code       text not null,
  project_id        text,
  content           text    default '',
  converted_to_task boolean default false,
  deleted           boolean default false,
  created_at        bigint  default 0,
  updated_at        bigint  default 0
);

create table if not exists public.project_progress (
  id          text primary key,
  carnet_code text not null,
  project_id  text,
  progress    integer default 0,
  deleted     boolean default false,
  created_at  bigint  default 0,
  updated_at  bigint  default 0
);

create table if not exists public.shopping_items (
  id          text primary key,
  carnet_code text not null,
  name        text    default '',
  quantity    text    default '',
  category    text    default '',
  completed   boolean default false,
  sort_order  integer default 0,
  deleted     boolean default false,
  created_at  bigint  default 0,
  updated_at  bigint  default 0
);

-- ---------- index sur le code ----------

create index if not exists projects_carnet_idx         on public.projects (carnet_code);
create index if not exists notes_carnet_idx            on public.notes (carnet_code);
create index if not exists tasks_carnet_idx            on public.tasks (carnet_code);
create index if not exists ideas_carnet_idx            on public.ideas (carnet_code);
create index if not exists project_progress_carnet_idx on public.project_progress (carnet_code);
create index if not exists shopping_items_carnet_idx   on public.shopping_items (carnet_code);

-- ---------- RLS : une ligne n'est visible que pour son code ----------
-- Le code doit faire au moins 6 caractères, sinon l'écriture est refusée.

do $$
declare t text;
begin
  foreach t in array array['projects','notes','tasks','ideas','project_progress','shopping_items']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_carnet', t);
    execute format(
      'create policy %I on public.%I for all to anon
         using (carnet_code = public.current_carnet())
         with check (carnet_code = public.current_carnet() and length(carnet_code) >= 6)',
      t || '_carnet', t);
  end loop;
end $$;
