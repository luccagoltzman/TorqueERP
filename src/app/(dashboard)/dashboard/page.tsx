import Link from "next/link";
import { Package, AlertTriangle, ShoppingCart, Wrench } from "lucide-react";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PageTransition } from "@/components/motion/page-transition";
import { getSessionContext } from "@/lib/session/queries";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getSessionContext();
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("quantity, min_quantity, sale_price");

  const totalProducts = products?.length ?? 0;
  const lowStockCount =
    products?.filter((p) => p.quantity <= p.min_quantity).length ?? 0;
  const inventoryValue =
    products?.reduce(
      (sum, p) => sum + Number(p.sale_price) * p.quantity,
      0,
    ) ?? 0;

  const metrics = [
    {
      label: "Peças cadastradas",
      value: String(totalProducts),
      change: totalProducts === 0 ? "Cadastre no estoque" : "Atualizado agora",
      icon: Package,
    },
    {
      label: "Estoque crítico",
      value: String(lowStockCount),
      change: lowStockCount > 0 ? "Repor urgente" : "Tudo ok",
      icon: AlertTriangle,
      variant: lowStockCount > 0 ? ("destructive" as const) : ("secondary" as const),
    },
    {
      label: "Valor em estoque",
      value: formatCurrency(inventoryValue),
      change: "Preço de venda",
      icon: ShoppingCart,
    },
    {
      label: "Oficina",
      value: session?.organization?.name ?? "—",
      change: session?.role ?? "membro",
      icon: Wrench,
    },
  ];

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description={
          session?.organization
            ? `Visão geral — ${session.organization.name}`
            : "Visão geral da operação da sua oficina"
        }
      />
      <PageTransition className="p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="border-border/60 bg-card/70">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription>{metric.label}</CardDescription>
                    <Icon className="size-4 text-primary" />
                  </div>
                  <CardTitle className="truncate text-2xl">{metric.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={metric.variant ?? "secondary"}>
                    {metric.change}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Comece pelo estoque</CardTitle>
            <CardDescription>
              Cadastre peças e acompanhe níveis críticos em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button render={<Link href="/estoque" />}>
              Ir para Estoque
            </Button>
            {totalProducts === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma peça cadastrada ainda — adicione filtros, óleos e
                componentes da sua oficina.
              </p>
            )}
          </CardContent>
        </Card>
      </PageTransition>
    </>
  );
}
