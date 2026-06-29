-- Catálogo de produtos — schema escalável para autopeças
-- Evolução da tabela products + módulos relacionados

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.stock_movement_type as enum (
    'entry', 'exit', 'transfer', 'adjustment', 'loss', 'return'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.product_relation_type as enum (
    'similar', 'equivalent', 'original', 'parallel', 'kit', 'complementary'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Filiais (multi-unidade)
-- ---------------------------------------------------------------------------
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  is_main boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create index if not exists branches_organization_id_idx on public.branches (organization_id);

-- ---------------------------------------------------------------------------
-- Categorias hierárquicas
-- ---------------------------------------------------------------------------
create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  parent_id uuid references public.product_categories (id) on delete set null,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create index if not exists product_categories_org_idx on public.product_categories (organization_id);

-- ---------------------------------------------------------------------------
-- Expandir products (informações básicas + estoque principal)
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists barcode_ean text,
  add column if not exists manufacturer_code text,
  add column if not exists oem_code text,
  add column if not exists short_description text,
  add column if not exists technical_description text,
  add column if not exists subcategory text,
  add column if not exists category_id uuid references public.product_categories (id) on delete set null,
  add column if not exists manufacturer text,
  add column if not exists ncm text,
  add column if not exists cest text,
  add column if not exists origin smallint not null default 0,
  add column if not exists status text not null default 'active'
    check (status in ('active', 'inactive')),
  add column if not exists max_quantity integer not null default 0 check (max_quantity >= 0),
  add column if not exists quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  add column if not exists quantity_in_transit integer not null default 0 check (quantity_in_transit >= 0),
  add column if not exists location_aisle text,
  add column if not exists location_shelf text,
  add column if not exists location_column text,
  add column if not exists location_level text,
  add column if not exists last_movement_at timestamptz,
  add column if not exists search_vector tsvector,
  add column if not exists created_by uuid references auth.users (id) on delete set null,
  add column if not exists updated_by uuid references auth.users (id) on delete set null;

update public.products
set short_description = description
where short_description is null and description is not null;

update public.products
set location_shelf = location
where location_shelf is null and location is not null;

create index if not exists products_barcode_idx on public.products (organization_id, barcode_ean);
create index if not exists products_oem_idx on public.products (organization_id, oem_code);
create index if not exists products_manufacturer_code_idx on public.products (organization_id, manufacturer_code);
create index if not exists products_status_idx on public.products (organization_id, status);
create index if not exists products_search_idx on public.products using gin (search_vector);

-- ---------------------------------------------------------------------------
-- Estoque por filial
-- ---------------------------------------------------------------------------
create table if not exists public.product_stock (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  branch_id uuid not null references public.branches (id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  min_quantity integer not null default 0 check (min_quantity >= 0),
  max_quantity integer not null default 0 check (max_quantity >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  quantity_in_transit integer not null default 0 check (quantity_in_transit >= 0),
  location_aisle text,
  location_shelf text,
  location_column text,
  location_level text,
  last_movement_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (product_id, branch_id)
);

create index if not exists product_stock_branch_idx on public.product_stock (branch_id);

-- ---------------------------------------------------------------------------
-- Compatibilidade veicular (diferencial autopeças)
-- ---------------------------------------------------------------------------
create table if not exists public.product_vehicle_compatibilities (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  make text not null,
  model text not null,
  year_start smallint,
  year_end smallint,
  engine text,
  fuel_type text,
  version text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists product_compat_product_idx
  on public.product_vehicle_compatibilities (product_id);
create index if not exists product_compat_vehicle_idx
  on public.product_vehicle_compatibilities (make, model, year_start, year_end);

-- ---------------------------------------------------------------------------
-- Custos
-- ---------------------------------------------------------------------------
create table if not exists public.product_costs (
  product_id uuid primary key references public.products (id) on delete cascade,
  last_cost numeric(14, 4) not null default 0,
  average_cost numeric(14, 4) not null default 0,
  current_cost numeric(14, 4) not null default 0,
  freight numeric(14, 4) not null default 0,
  taxes numeric(14, 4) not null default 0,
  final_cost numeric(14, 4) not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tipos de preço + tabela de preços
-- ---------------------------------------------------------------------------
create table if not exists public.price_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order smallint not null default 0,
  active boolean not null default true,
  unique (organization_id, slug)
);

create table if not exists public.product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  price_type_id uuid not null references public.price_types (id) on delete cascade,
  value numeric(14, 4) not null default 0,
  margin_pct numeric(8, 4),
  profit_value numeric(14, 4),
  max_discount_pct numeric(8, 4),
  updated_at timestamptz not null default now(),
  unique (product_id, price_type_id)
);

-- ---------------------------------------------------------------------------
-- Fornecedores
-- ---------------------------------------------------------------------------
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  document text,
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists suppliers_org_idx on public.suppliers (organization_id);

create table if not exists public.product_suppliers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  supplier_code text,
  price numeric(14, 4) not null default 0,
  lead_time_days integer not null default 0,
  min_order_qty integer not null default 1,
  is_primary boolean not null default false,
  unique (product_id, supplier_id)
);

-- ---------------------------------------------------------------------------
-- Fotos, specs, tributação, comercial, oficina
-- ---------------------------------------------------------------------------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  storage_path text,
  is_primary boolean not null default false,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  spec_key text not null,
  spec_value text not null,
  sort_order smallint not null default 0,
  unique (product_id, spec_key)
);

create table if not exists public.product_tax (
  product_id uuid primary key references public.products (id) on delete cascade,
  cfop text,
  cst text,
  csosn text,
  ncm text,
  cest text,
  icms_pct numeric(8, 4),
  ipi_pct numeric(8, 4),
  pis_pct numeric(8, 4),
  cofins_pct numeric(8, 4),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_commercial (
  product_id uuid primary key references public.products (id) on delete cascade,
  on_promotion boolean not null default false,
  featured boolean not null default false,
  is_launch boolean not null default false,
  discontinued boolean not null default false,
  accepts_preorder boolean not null default false,
  fractional_sale boolean not null default false,
  max_discount_pct numeric(8, 4)
);

create table if not exists public.product_workshop (
  product_id uuid primary key references public.products (id) on delete cascade,
  avg_install_minutes integer,
  difficulty_level smallint check (difficulty_level between 1 and 5),
  part_warranty_days integer,
  install_warranty_days integer,
  suggested_labor_price numeric(14, 4)
);

-- ---------------------------------------------------------------------------
-- Movimentações + auditoria
-- ---------------------------------------------------------------------------
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  branch_id uuid references public.branches (id) on delete set null,
  movement_type public.stock_movement_type not null,
  quantity integer not null,
  quantity_before integer,
  quantity_after integer,
  reason text,
  reference_type text,
  reference_id uuid,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_idx on public.stock_movements (product_id, created_at desc);

create table if not exists public.product_audit_log (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  field_name text not null,
  old_value text,
  new_value text,
  changed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Relacionamentos + kits
-- ---------------------------------------------------------------------------
create table if not exists public.product_relationships (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  related_product_id uuid not null references public.products (id) on delete cascade,
  relation_type public.product_relation_type not null,
  unique (product_id, related_product_id, relation_type)
);

create table if not exists public.product_kit_items (
  id uuid primary key default gen_random_uuid(),
  kit_product_id uuid not null references public.products (id) on delete cascade,
  component_product_id uuid not null references public.products (id) on delete cascade,
  quantity numeric(12, 4) not null default 1 check (quantity > 0),
  unique (kit_product_id, component_product_id)
);

-- ---------------------------------------------------------------------------
-- Funções auxiliares
-- ---------------------------------------------------------------------------
create or replace function public.product_org_id(p_product_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.products where id = p_product_id;
$$;

revoke all on function public.product_org_id(uuid) from public;
grant execute on function public.product_org_id(uuid) to authenticated;

create or replace function public.seed_organization_catalog(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.branches (organization_id, name, slug, is_main)
  values (p_org_id, 'Matriz', 'matriz', true)
  on conflict (organization_id, slug) do nothing;

  insert into public.price_types (organization_id, slug, name, sort_order) values
    (p_org_id, 'balcao', 'Balcão', 1),
    (p_org_id, 'oficina', 'Oficina', 2),
    (p_org_id, 'atacado', 'Atacado', 3),
    (p_org_id, 'marketplace', 'Marketplace', 4),
    (p_org_id, 'promocao', 'Promoção', 5)
  on conflict (organization_id, slug) do nothing;
end;
$$;

-- Seed para organizações existentes
do $$
declare r record;
begin
  for r in select id from public.organizations loop
    perform public.seed_organization_catalog(r.id);
  end loop;
end $$;

create or replace function public.products_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('portuguese', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.sku, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.barcode_ean, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.oem_code, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.manufacturer_code, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(new.short_description, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(new.brand, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(new.category, '')), 'C');
  return new;
end;
$$;

drop trigger if exists products_search_vector_trigger on public.products;
create trigger products_search_vector_trigger
  before insert or update on public.products
  for each row execute function public.products_search_vector_update();

update public.products set name = name where search_vector is null;

-- ---------------------------------------------------------------------------
-- RLS (padrão: organization_id via product ou direto)
-- ---------------------------------------------------------------------------
alter table public.branches enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_stock enable row level security;
alter table public.product_vehicle_compatibilities enable row level security;
alter table public.product_costs enable row level security;
alter table public.price_types enable row level security;
alter table public.product_prices enable row level security;
alter table public.suppliers enable row level security;
alter table public.product_suppliers enable row level security;
alter table public.product_images enable row level security;
alter table public.product_specifications enable row level security;
alter table public.product_tax enable row level security;
alter table public.product_commercial enable row level security;
alter table public.product_workshop enable row level security;
alter table public.stock_movements enable row level security;
alter table public.product_audit_log enable row level security;
alter table public.product_relationships enable row level security;
alter table public.product_kit_items enable row level security;

-- branches
create policy "Members manage branches" on public.branches for all to authenticated
  using (organization_id in (select public.user_organization_ids()))
  with check (organization_id in (select public.user_organization_ids()));

-- product_categories
create policy "Members manage categories" on public.product_categories for all to authenticated
  using (organization_id in (select public.user_organization_ids()))
  with check (organization_id in (select public.user_organization_ids()));

-- price_types
create policy "Members manage price types" on public.price_types for all to authenticated
  using (organization_id in (select public.user_organization_ids()))
  with check (organization_id in (select public.user_organization_ids()));

-- suppliers
create policy "Members manage suppliers" on public.suppliers for all to authenticated
  using (organization_id in (select public.user_organization_ids()))
  with check (organization_id in (select public.user_organization_ids()));

-- stock_movements
create policy "Members manage movements" on public.stock_movements for all to authenticated
  using (organization_id in (select public.user_organization_ids()))
  with check (organization_id in (select public.user_organization_ids()));

-- product-scoped tables (via product_org_id)
do $$
declare t text;
begin
  foreach t in array array[
    'product_stock', 'product_vehicle_compatibilities', 'product_costs',
    'product_prices', 'product_suppliers', 'product_images', 'product_specifications',
    'product_tax', 'product_commercial', 'product_workshop', 'product_audit_log',
    'product_relationships'
  ] loop
    execute format(
      'create policy "Members manage %1$s" on public.%1$s for all to authenticated
         using (public.product_org_id(product_id) in (select public.user_organization_ids()))
         with check (public.product_org_id(product_id) in (select public.user_organization_ids()))',
      t
    );
  end loop;
end $$;

-- product_kit_items uses kit_product_id
drop policy if exists "Members manage product_kit_items" on public.product_kit_items;
create policy "Members manage product_kit_items" on public.product_kit_items for all to authenticated
  using (public.product_org_id(kit_product_id) in (select public.user_organization_ids()))
  with check (public.product_org_id(kit_product_id) in (select public.user_organization_ids()));

-- View: estoque disponível
create or replace view public.product_inventory_view
with (security_invoker = true)
as
select
  p.id,
  p.organization_id,
  p.sku,
  p.name,
  p.brand,
  p.status,
  p.quantity as stock_current,
  p.min_quantity as stock_min,
  p.max_quantity as stock_max,
  p.quantity_reserved as stock_reserved,
  p.quantity_in_transit as stock_in_transit,
  greatest(p.quantity - p.quantity_reserved, 0) as stock_available,
  p.sale_price,
  p.search_vector
from public.products p;

grant select on public.product_inventory_view to authenticated;
