import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VendasPage() {
  return (
    <>
      <DashboardHeader
        title="Vendas"
        description="Pedidos, orçamentos e faturamento"
      />
      <PageTransition className="p-4 md:p-6">
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Pedidos recentes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Módulo em construção — estrutura pronta para integração com Supabase.
          </CardContent>
        </Card>
      </PageTransition>
    </>
  );
}
