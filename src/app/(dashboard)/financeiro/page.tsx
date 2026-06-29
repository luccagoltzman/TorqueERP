import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinanceiroPage() {
  return (
    <>
      <DashboardHeader
        title="Financeiro"
        description="Contas, fluxo de caixa e relatórios"
      />
      <PageTransition className="p-4 md:p-6">
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Resumo financeiro</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Gráficos e lançamentos serão conectados ao banco multi-tenant.
          </CardContent>
        </Card>
      </PageTransition>
    </>
  );
}
