import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EstoquePage() {
  return (
    <>
      <DashboardHeader
        title="Estoque"
        description="Peças, fornecedores e movimentações"
      />
      <PageTransition className="p-4 md:p-6">
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Inventário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </PageTransition>
    </>
  );
}
