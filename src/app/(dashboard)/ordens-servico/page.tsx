import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrdensServicoPage() {
  return (
    <>
      <DashboardHeader
        title="Ordens de Serviço"
        description="Atendimento, diagnóstico e execução na oficina"
      />
      <PageTransition className="p-4 md:p-6">
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>OS em andamento</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Kanban e timeline de status serão implementados neste módulo.
          </CardContent>
        </Card>
      </PageTransition>
    </>
  );
}
