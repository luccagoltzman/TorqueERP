import Link from "next/link";
import { Gauge } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_oklch(0.55_0.18_45_/_0.25),_transparent_60%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Gauge className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-white">TorqueERP</p>
            <p className="text-xs text-zinc-400">Gestão automotiva</p>
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Controle total da sua operação automotiva
          </h2>
          <p className="mt-4 text-zinc-400">
            Estoque, vendas, ordens de serviço e financeiro em um único painel.
          </p>
        </div>
        <p className="relative text-xs text-zinc-500">
          © {new Date().getFullYear()} TorqueERP
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Gauge className="size-4" />
              </div>
              <span className="font-semibold">TorqueERP</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
