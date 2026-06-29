import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wrench,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const dashboardNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Visão geral do negócio",
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Package,
    description: "Peças e inventário",
  },
  {
    title: "Vendas",
    href: "/vendas",
    icon: ShoppingCart,
    description: "Pedidos e faturamento",
  },
  {
    title: "Ordens de Serviço",
    href: "/ordens-servico",
    icon: Wrench,
    description: "Oficina e atendimento",
  },
  {
    title: "Financeiro",
    href: "/financeiro",
    icon: Wallet,
    description: "Contas e fluxo de caixa",
  },
];
