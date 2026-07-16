-- Whimsical clone: core schema
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner','editor','viewer')),
  primary key (workspace_id, user_id)
);

create table public.folders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  type text not null check (type in ('board','doc','mindmap')),
  title text not null default 'Untitled',
  content jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index files_workspace_updated_idx on public.files (workspace_id, updated_at desc);
create index files_folder_idx on public.files (folder_id);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  file_id uuid not null references public.files(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, file_id)
);

-- updated_at maintenance
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
create trigger files_updated_at before update on public.files
  for each row execute function public.set_updated_at();

-- membership check without recursive RLS
create or replace function public.is_workspace_member(ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

-- onboarding: profile + personal workspace on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ws_id uuid;
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));

  insert into public.workspaces (name, owner_id)
  values (coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)) || '''s Workspace', new.id)
  returning id into ws_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws_id, new.id, 'owner');

  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.folders enable row level security;
alter table public.files enable row level security;
alter table public.favorites enable row level security;

create policy "profiles self read" on public.profiles for select using (id = auth.uid());
create policy "profiles self update" on public.profiles for update using (id = auth.uid());

create policy "workspaces member read" on public.workspaces for select
  using (public.is_workspace_member(id));
create policy "workspaces owner update" on public.workspaces for update
  using (owner_id = auth.uid());

create policy "members read own workspaces" on public.workspace_members for select
  using (user_id = auth.uid() or public.is_workspace_member(workspace_id));

create policy "folders member all" on public.folders for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "files member all" on public.files for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "favorites self all" on public.favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
