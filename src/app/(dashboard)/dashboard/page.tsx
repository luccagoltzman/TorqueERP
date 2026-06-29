import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PageTransition } from "@/components/motion/page-transition";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const metrics = [
  { label: "OS abertas", value: "24", change: "+3 hoje" },
  { label: "Peças em estoque", value: "1.842", change: "12 críticas" },
  { label: "Vendas do mês", value: "R$ 128k", change: "+18%" },
  { label: "Ticket médio", value: "R$ 890", change: "+6%" },
];

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description="Visão geral da operação da sua oficina"
      />
      <PageTransition className="p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="border-border/60 bg-card/70">
              <CardHeader className="pb-2">
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-2xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{metric.change}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Próximos passos</CardTitle>
            <CardDescription>
              Configure sua organização e conecte o Supabase para ativar auth e
              dados multi-tenant.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Copie <code className="text-foreground">.env.example</code> para{" "}
            <code className="text-foreground">.env.local</code>, aplique a
            migration em <code className="text-foreground">supabase/migrations</code>{" "}
            e acesse as telas de Estoque, Vendas, OS e Financeiro pela sidebar.
          </CardContent>
        </Card>
      </PageTransition>
    </>
  );
}
