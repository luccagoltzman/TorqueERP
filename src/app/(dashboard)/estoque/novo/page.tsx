import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PageTransition } from "@/components/motion/page-transition";
import { ProductForm } from "@/components/estoque/product-form";
import { getNewProductDefaults } from "@/lib/estoque/actions";

export default async function NovoProdutoPage() {
  const defaults = await getNewProductDefaults();

  return (
    <>
      <DashboardHeader
        title="Novo produto"
        description="Cadastro rápido — expanda opções avançadas se precisar"
      />
      <PageTransition className="p-4 md:p-6">
        <ProductForm mode="create" priceTypes={defaults?.priceTypes ?? []} />
      </PageTransition>
    </>
  );
}
