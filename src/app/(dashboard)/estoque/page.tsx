import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PageTransition } from "@/components/motion/page-transition";
import { ProductsTable } from "@/components/estoque/products-table";
import { createClient } from "@/lib/supabase/server";

export default async function EstoquePage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, sku, oem_code, barcode_ean, brand, category, unit, status, active, quantity, min_quantity, quantity_reserved, sale_price",
    )
    .order("name");

  return (
    <>
      <DashboardHeader
        title="Estoque"
        description="Peças, fornecedores e movimentações"
      />
      <PageTransition className="p-4 md:p-6">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Erro ao carregar estoque: {error.message}. Aplique as migrations{" "}
            <code className="text-foreground">20250629000000_products.sql</code> e{" "}
            <code className="text-foreground">20250629100000_product_catalog_schema.sql</code>{" "}
            no Supabase.
          </p>
        ) : (
          <ProductsTable products={products ?? []} />
        )}
      </PageTransition>
    </>
  );
}
