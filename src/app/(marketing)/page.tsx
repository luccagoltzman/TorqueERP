"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gauge, Sparkles, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Estoque inteligente",
    description: "Controle peças, fornecedores e alertas de reposição em tempo real.",
    icon: Sparkles,
  },
  {
    title: "Oficina conectada",
    description: "Ordens de serviço, histórico do veículo e status para o cliente.",
    icon: Wrench,
  },
  {
    title: "Financeiro integrado",
    description: "Vendas, contas a pagar/receber e fluxo de caixa no mesmo painel.",
    icon: Gauge,
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.55_0.18_45_/_0.18),_transparent_55%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Gauge className="size-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">TorqueERP</p>
            <p className="text-xs text-muted-foreground">Gestão automotiva</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" render={<Link href="/login" />}>
            Entrar
          </Button>
          <Button render={<Link href="/register" />}>
            Começar grátis
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <section className="py-16 text-center md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6">
              SaaS para autopeças e oficinas
            </Badge>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
              Potência total para a gestão da sua{" "}
              <span className="text-primary">oficina</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Estoque, vendas, ordens de serviço e financeiro em uma plataforma
              moderna, rápida e pensada para o dia a dia do setor automotivo.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" render={<Link href="/dashboard" />}>
                Ver demonstração
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/register" />}>
                Criar conta
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.1, duration: 0.45 }}
              >
                <Card className="h-full border-border/60 bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${55 + index * 15}%` }}
                        transition={{ delay: 0.5 + index * 0.15, duration: 0.8 }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
