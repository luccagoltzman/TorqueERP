"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getOrganizationId, getSessionContext } from "@/lib/session/queries";
import { createClient } from "@/lib/supabase/server";
import type {
  ProductFormPayload,
  ProductPriceRow,
  ProductSearchResult,
  VehicleCompatibility,
} from "@/types/product-catalog";

export type ProductSaveState = {
  error?: string;
  productId?: string;
};

function parseJsonField<T>(raw: FormDataEntryValue | null, fallback: T): T {
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function numOrNull(raw: FormDataEntryValue | null): number | null {
  if (raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

async function upsertSuppliers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  productId: string,
  rows: ProductFormPayload["suppliers"],
) {
  await supabase.from("product_suppliers").delete().eq("product_id", productId);

  for (const row of rows) {
    if (!row.supplier_name.trim()) continue;

    let supplierId = row.supplier_id;

    if (!supplierId) {
      const { data: supplier } = await supabase
        .from("suppliers")
        .insert({ organization_id: organizationId, name: row.supplier_name.trim() })
        .select("id")
        .single();
      supplierId = supplier?.id;
    }

    if (!supplierId) continue;

    await supabase.from("product_suppliers").insert({
      product_id: productId,
      supplier_id: supplierId,
      supplier_code: row.supplier_code,
      price: row.price,
      lead_time_days: row.lead_time_days,
      min_order_qty: row.min_order_qty,
      is_primary: row.is_primary ?? false,
    });
  }
}

async function upsertPrices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  prices: ProductPriceRow[],
) {
  await supabase.from("product_prices").delete().eq("product_id", productId);

  for (const row of prices) {
    if (!row.price_type_id) continue;
    await supabase.from("product_prices").insert({
      product_id: productId,
      price_type_id: row.price_type_id,
      value: row.value,
      margin_pct: row.margin_pct,
      max_discount_pct: row.max_discount_pct,
    });
  }
}

async function upsertCompatibilities(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  items: VehicleCompatibility[],
) {
  await supabase
    .from("product_vehicle_compatibilities")
    .delete()
    .eq("product_id", productId);

  const valid = items.filter((i) => i.make.trim() && i.model.trim());
  if (valid.length === 0) return;

  await supabase.from("product_vehicle_compatibilities").insert(
    valid.map((item) => ({
      product_id: productId,
      make: item.make.trim(),
      model: item.model.trim(),
      year_start: item.year_start ?? null,
      year_end: item.year_end ?? null,
      engine: item.engine?.trim() || null,
      fuel_type: item.fuel_type?.trim() || null,
      version: item.version?.trim() || null,
      notes: item.notes?.trim() || null,
    })),
  );
}

async function upsertSpecifications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  specs: ProductFormPayload["specifications"],
) {
  await supabase.from("product_specifications").delete().eq("product_id", productId);

  const valid = specs.filter((s) => s.spec_key.trim() && s.spec_value.trim());
  if (valid.length === 0) return;

  await supabase.from("product_specifications").insert(
    valid.map((s, index) => ({
      product_id: productId,
      spec_key: s.spec_key.trim(),
      spec_value: s.spec_value.trim(),
      sort_order: index,
    })),
  );
}

export async function saveProduct(
  _prev: ProductSaveState | null,
  formData: FormData,
): Promise<ProductSaveState> {
  const organizationId = await getOrganizationId();
  const session = await getSessionContext();

  if (!organizationId || !session) {
    return { error: "Sessão ou organização inválida." };
  }

  const productId = (formData.get("id") as string) || undefined;
  const name = (formData.get("name") as string)?.trim();

  if (!name) {
    return { error: "Nome do produto é obrigatório." };
  }

  const payload: ProductFormPayload = {
    id: productId,
    sku: (formData.get("sku") as string)?.trim() || null,
    barcode_ean: (formData.get("barcode_ean") as string)?.trim() || null,
    manufacturer_code: (formData.get("manufacturer_code") as string)?.trim() || null,
    oem_code: (formData.get("oem_code") as string)?.trim() || null,
    name,
    short_description: (formData.get("short_description") as string)?.trim() || null,
    technical_description:
      (formData.get("technical_description") as string)?.trim() || null,
    category: (formData.get("category") as string)?.trim() || null,
    subcategory: (formData.get("subcategory") as string)?.trim() || null,
    brand: (formData.get("brand") as string)?.trim() || null,
    manufacturer: (formData.get("manufacturer") as string)?.trim() || null,
    unit: (formData.get("unit") as string)?.trim() || "un",
    ncm: (formData.get("ncm") as string)?.trim() || null,
    cest: (formData.get("cest") as string)?.trim() || null,
    origin: Number(formData.get("origin") ?? 0),
    status: (formData.get("status") as "active" | "inactive") || "active",
    quantity: Number(formData.get("quantity") ?? 0),
    min_quantity: Number(formData.get("min_quantity") ?? 0),
    max_quantity: Number(formData.get("max_quantity") ?? 0),
    quantity_reserved: Number(formData.get("quantity_reserved") ?? 0),
    quantity_in_transit: Number(formData.get("quantity_in_transit") ?? 0),
    location_aisle: (formData.get("location_aisle") as string)?.trim() || null,
    location_shelf: (formData.get("location_shelf") as string)?.trim() || null,
    location_column: (formData.get("location_column") as string)?.trim() || null,
    location_level: (formData.get("location_level") as string)?.trim() || null,
    cost_price: Number(formData.get("cost_price") ?? 0),
    sale_price: Number(formData.get("sale_price") ?? 0),
    compatibilities: parseJsonField(formData.get("compatibilities_json"), []),
    prices: parseJsonField(formData.get("prices_json"), []),
    suppliers: parseJsonField(formData.get("suppliers_json"), []),
    specifications: parseJsonField(formData.get("specifications_json"), []),
    commercial: {},
    workshop: {
      avg_install_minutes: numOrNull(formData.get("workshop_avg_install")),
      difficulty_level: numOrNull(formData.get("workshop_difficulty")),
      part_warranty_days: numOrNull(formData.get("workshop_part_warranty")),
      install_warranty_days: numOrNull(formData.get("workshop_install_warranty")),
      suggested_labor_price: numOrNull(formData.get("workshop_labor_price")),
    },
  };

  const balcaoPrice =
    payload.prices.find((p) => p.slug === "balcao")?.value ?? payload.sale_price;

  const supabase = await createClient();

  const productRow = {
    organization_id: organizationId,
    sku: payload.sku,
    barcode_ean: payload.barcode_ean,
    manufacturer_code: payload.manufacturer_code,
    oem_code: payload.oem_code,
    name: payload.name,
    short_description: payload.short_description,
    technical_description: payload.technical_description,
    description: payload.short_description,
    category: payload.category,
    subcategory: payload.subcategory,
    brand: payload.brand,
    manufacturer: payload.manufacturer,
    unit: payload.unit,
    ncm: payload.ncm,
    cest: payload.cest,
    origin: payload.origin,
    status: payload.status,
    active: payload.status === "active",
    quantity: payload.quantity,
    min_quantity: payload.min_quantity,
    max_quantity: payload.max_quantity,
    quantity_reserved: payload.quantity_reserved,
    quantity_in_transit: payload.quantity_in_transit,
    location_aisle: payload.location_aisle,
    location_shelf: payload.location_shelf,
    location_column: payload.location_column,
    location_level: payload.location_level,
    location: payload.location_shelf,
    cost_price: payload.cost_price,
    sale_price: balcaoPrice,
    updated_by: session.user.id,
  };

  let savedId = productId;

  if (productId) {
    const { error } = await supabase
      .from("products")
      .update(productRow)
      .eq("id", productId);

    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...productRow, created_by: session.user.id })
      .select("id")
      .single();

    if (error) return { error: error.message };
    savedId = data.id;
  }

  if (!savedId) return { error: "Falha ao salvar produto." };

  await Promise.all([
    upsertCompatibilities(supabase, savedId, payload.compatibilities),
    upsertPrices(supabase, savedId, payload.prices),
    upsertSuppliers(supabase, organizationId, savedId, payload.suppliers),
    upsertSpecifications(supabase, savedId, payload.specifications),
    supabase.from("product_costs").upsert({
      product_id: savedId,
      last_cost: payload.cost_price,
      current_cost: payload.cost_price,
      final_cost: payload.cost_price,
    }),
    supabase.from("product_commercial").upsert({
      product_id: savedId,
      on_promotion: payload.commercial?.on_promotion ?? false,
      featured: payload.commercial?.featured ?? false,
      is_launch: payload.commercial?.is_launch ?? false,
      discontinued: payload.commercial?.discontinued ?? false,
      accepts_preorder: payload.commercial?.accepts_preorder ?? false,
      fractional_sale: payload.commercial?.fractional_sale ?? false,
    }),
    supabase.from("product_workshop").upsert({
      product_id: savedId,
      avg_install_minutes: payload.workshop?.avg_install_minutes ?? null,
      difficulty_level: payload.workshop?.difficulty_level ?? null,
      part_warranty_days: payload.workshop?.part_warranty_days ?? null,
      install_warranty_days: payload.workshop?.install_warranty_days ?? null,
      suggested_labor_price: payload.workshop?.suggested_labor_price ?? null,
    }),
  ]);

  if (!productId) {
    await supabase.from("stock_movements").insert({
      organization_id: organizationId,
      product_id: savedId,
      movement_type: "entry",
      quantity: payload.quantity,
      quantity_before: 0,
      quantity_after: payload.quantity,
      reason: "Cadastro inicial",
      created_by: session.user.id,
    });
  }

  revalidatePath("/estoque");
  revalidatePath("/dashboard");
  revalidatePath(`/estoque/${savedId}`);

  redirect(`/estoque/${savedId}?saved=1`);
}

export async function searchProducts(query: string): Promise<ProductSearchResult[]> {
  if (!query.trim()) return [];

  const organizationId = await getOrganizationId();
  if (!organizationId) return [];

  const supabase = await createClient();
  const term = query.trim();

  const { data: fts } = await supabase
    .from("products")
    .select("id, name, sku, oem_code, barcode_ean, brand, quantity, quantity_reserved, sale_price, search_vector")
    .eq("organization_id", organizationId)
    .textSearch("search_vector", term, { type: "websearch", config: "portuguese" })
    .limit(20);

  if (fts && fts.length > 0) {
    return mapSearchResults(fts);
  }

  const like = `%${term}%`;
  const { data } = await supabase
    .from("products")
    .select("id, name, sku, oem_code, barcode_ean, brand, quantity, quantity_reserved, sale_price")
    .eq("organization_id", organizationId)
    .or(
      `name.ilike.${like},sku.ilike.${like},oem_code.ilike.${like},barcode_ean.ilike.${like},manufacturer_code.ilike.${like},brand.ilike.${like}`,
    )
    .limit(20);

  if (data && data.length > 0) {
    return mapSearchResults(data);
  }

  const { data: byVehicle } = await supabase
    .from("product_vehicle_compatibilities")
    .select(
      "product_id, products!inner(id, name, sku, oem_code, barcode_ean, brand, quantity, quantity_reserved, sale_price, organization_id)",
    )
    .eq("products.organization_id", organizationId)
    .or(`make.ilike.${like},model.ilike.${like},engine.ilike.${like},version.ilike.${like}`)
    .limit(20);

  type SearchRow = Parameters<typeof mapSearchResults>[0][number];

  const vehicleProducts: SearchRow[] = (byVehicle ?? []).flatMap((row) => {
    const p = row.products;
    const item = Array.isArray(p) ? p[0] : p;
    return item ? [item as SearchRow] : [];
  });

  return mapSearchResults(vehicleProducts);
}

function mapSearchResults(
  rows: Array<{
    id: string;
    name: string;
    sku: string | null;
    oem_code: string | null;
    barcode_ean: string | null;
    brand: string | null;
    quantity: number;
    quantity_reserved: number;
    sale_price: number;
  }>,
): ProductSearchResult[] {
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    oem_code: p.oem_code,
    barcode_ean: p.barcode_ean,
    brand: p.brand,
    stock_available: Math.max((p.quantity ?? 0) - (p.quantity_reserved ?? 0), 0),
    sale_price: Number(p.sale_price),
  }));
}

export async function getProductEditorData(productId: string) {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (!product) return null;

  const [
    { data: compatibilities },
    { data: priceTypes },
    { data: productPrices },
    { data: productSuppliers },
    { data: specifications },
    { data: commercial },
    { data: workshop },
    { data: costs },
    { data: movements },
  ] = await Promise.all([
    supabase.from("product_vehicle_compatibilities").select("*").eq("product_id", productId),
    supabase
      .from("price_types")
      .select("*")
      .eq("organization_id", product.organization_id)
      .eq("active", true)
      .order("sort_order"),
    supabase.from("product_prices").select("*").eq("product_id", productId),
    supabase
      .from("product_suppliers")
      .select("*, suppliers(name)")
      .eq("product_id", productId),
    supabase.from("product_specifications").select("*").eq("product_id", productId).order("sort_order"),
    supabase.from("product_commercial").select("*").eq("product_id", productId).maybeSingle(),
    supabase.from("product_workshop").select("*").eq("product_id", productId).maybeSingle(),
    supabase.from("product_costs").select("*").eq("product_id", productId).maybeSingle(),
    supabase
      .from("stock_movements")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return {
    product,
    compatibilities: compatibilities ?? [],
    priceTypes: priceTypes ?? [],
    productPrices: productPrices ?? [],
    productSuppliers: productSuppliers ?? [],
    specifications: specifications ?? [],
    commercial,
    workshop,
    costs,
    movements: movements ?? [],
  };
}

export async function getNewProductDefaults() {
  const organizationId = await getOrganizationId();
  if (!organizationId) return null;

  const supabase = await createClient();
  const { data: priceTypes } = await supabase
    .from("price_types")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("active", true)
    .order("sort_order");

  return { priceTypes: priceTypes ?? [] };
}

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/estoque");
  revalidatePath("/dashboard");
  return {};
}
