import { notFound } from "next/navigation";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PageTransition } from "@/components/motion/page-transition";
import { ProductForm } from "@/components/estoque/product-form";
import { getProductEditorData } from "@/lib/estoque/actions";
import type { ProductPriceRow, ProductSupplierRow } from "@/types/product-catalog";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditarProdutoPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const data = await getProductEditorData(id);

  if (!data) notFound();

  const prices: ProductPriceRow[] = data.priceTypes.map((pt) => {
    const existing = data.productPrices.find((p) => p.price_type_id === pt.id);
    return {
      price_type_id: pt.id,
      slug: pt.slug,
      name: pt.name,
      value: Number(existing?.value ?? (pt.slug === "balcao" ? data.product.sale_price : 0)),
      margin_pct: existing?.margin_pct ? Number(existing.margin_pct) : null,
      max_discount_pct: existing?.max_discount_pct ? Number(existing.max_discount_pct) : null,
    };
  });

  const suppliers: ProductSupplierRow[] = data.productSuppliers.map((ps) => {
    const supplier = ps.suppliers as { name?: string } | null;
    return {
      supplier_id: ps.supplier_id,
      supplier_name: supplier?.name ?? "",
      supplier_code: ps.supplier_code,
      price: Number(ps.price),
      lead_time_days: ps.lead_time_days,
      min_order_qty: ps.min_order_qty,
      is_primary: ps.is_primary,
    };
  });

  return (
    <>
      <DashboardHeader
        title={String(data.product.name)}
        description={`SKU ${data.product.sku ?? "—"} · OEM ${data.product.oem_code ?? "—"}`}
      />
      <PageTransition className="p-4 md:p-6">
        {saved === "1" && (
          <Badge className="mb-4" variant="secondary">
            Produto salvo com sucesso
          </Badge>
        )}
        <ProductForm
          mode="edit"
          product={data.product}
          priceTypes={data.priceTypes}
          initialCompatibilities={data.compatibilities}
          initialPrices={prices}
          initialSuppliers={suppliers}
          initialSpecs={data.specifications.map((s) => ({
            spec_key: s.spec_key,
            spec_value: s.spec_value,
          }))}
          initialMovements={data.movements}
        />
      </PageTransition>
    </>
  );
}
