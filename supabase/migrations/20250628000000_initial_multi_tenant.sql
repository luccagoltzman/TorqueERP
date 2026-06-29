-- TorqueERP — schema multi-tenant inicial

-- Organizações (tenants)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Perfis vinculados ao auth.users
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Membros por organização
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index organization_members_user_id_idx on public.organization_members (user_id);
create index organization_members_organization_id_idx on public.organization_members (organization_id);

-- Helper: IDs das organizações do usuário autenticado
create or replace function public.user_organization_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.organization_members
  where user_id = auth.uid();
$$;

revoke all on function public.user_organization_ids() from public;
grant execute on function public.user_organization_ids() to authenticated;

-- RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;

-- organizations: membros leem a própria org
create policy "Members can view their organizations"
  on public.organizations
  for select
  to authenticated
  using (id in (select public.user_organization_ids()));

create policy "Authenticated users can create organizations"
  on public.organizations
  for insert
  to authenticated
  with check (true);

create policy "Owners and admins can update organizations"
  on public.organizations
  for update
  to authenticated
  using (
    id in (
      select organization_id
      from public.organization_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- profiles
create policy "Users can view profiles in their organizations"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or id in (
      select om.user_id
      from public.organization_members om
      where om.organization_id in (select public.user_organization_ids())
    )
  );

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid());

-- organization_members
create policy "Members can view memberships in their organizations"
  on public.organization_members
  for select
  to authenticated
  using (organization_id in (select public.user_organization_ids()));

create policy "Users can create their own membership"
  on public.organization_members
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Owners and admins can manage memberships"
  on public.organization_members
  for update
  to authenticated
  using (
    organization_id in (
      select organization_id
      from public.organization_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

create policy "Owners and admins can remove memberships"
  on public.organization_members
  for delete
  to authenticated
  using (
    organization_id in (
      select organization_id
      from public.organization_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- Trigger: perfil ao registrar usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
