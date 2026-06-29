-- Produtos / peças por organização (estoque)

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  sku text,
  name text not null,
  description text,
  category text,
  brand text,
  cost_price numeric(12, 2) not null default 0,
  sale_price numeric(12, 2) not null default 0,
  quantity integer not null default 0 check (quantity >= 0),
  min_quantity integer not null default 0 check (min_quantity >= 0),
  unit text not null default 'un',
  location text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_organization_id_idx on public.products (organization_id);
create index products_name_idx on public.products (organization_id, name);

create unique index products_org_sku_unique
  on public.products (organization_id, sku)
  where sku is not null and sku <> '';

alter table public.products enable row level security;

create policy "Members can view products"
  on public.products
  for select
  to authenticated
  using (organization_id in (select public.user_organization_ids()));

create policy "Members can insert products"
  on public.products
  for insert
  to authenticated
  with check (organization_id in (select public.user_organization_ids()));

create policy "Members can update products"
  on public.products
  for update
  to authenticated
  using (organization_id in (select public.user_organization_ids()));

create policy "Members can delete products"
  on public.products
  for delete
  to authenticated
  using (organization_id in (select public.user_organization_ids()));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();
