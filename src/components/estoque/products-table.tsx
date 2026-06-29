"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { deleteProduct } from "@/lib/estoque/actions";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  oem_code?: string | null;
  barcode_ean?: string | null;
  brand: string | null;
  unit: string;
  status?: string;
  active?: boolean;
  quantity: number;
  min_quantity: number;
  quantity_reserved?: number;
  sale_price: number;
};

type ProductsTableProps = {
  products: Product[];
};

export function ProductsTable({ products }: ProductsTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Remover este produto do catálogo?")) return;
    startTransition(async () => {
      await deleteProduct(id);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {products.length === 1
            ? "1 produto no catálogo"
            : `${products.length} produtos no catálogo`}
        </p>
        <Button render={<Link href="/estoque/novo" />}>
          <Plus data-icon="inline-start" />
          Novo produto
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center">
          <p className="font-medium">Catálogo vazio</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Cadastre peças com compatibilidade veicular, múltiplos preços e
            controle de estoque — pronto para lojas pequenas e distribuidoras.
          </p>
          <Button className="mt-4" render={<Link href="/estoque/novo" />}>
            Cadastrar primeiro produto
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="hidden md:table-cell">SKU</TableHead>
                <TableHead className="hidden lg:table-cell">OEM</TableHead>
                <TableHead className="text-right">Disp.</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Balcão</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const reserved = product.quantity_reserved ?? 0;
                const available = Math.max(product.quantity - reserved, 0);
                const isLowStock = product.quantity <= product.min_quantity;
                const isInactive = product.status === "inactive" || !product.active;

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link
                        href={`/estoque/${product.id}`}
                        className="flex flex-col gap-1 hover:text-primary"
                      >
                        <span className="font-medium">{product.name}</span>
                        {product.brand && (
                          <span className="text-xs text-muted-foreground">{product.brand}</span>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {isLowStock && (
                            <Badge variant="destructive" className="w-fit">
                              Estoque baixo
                            </Badge>
                          )}
                          {isInactive && (
                            <Badge variant="secondary" className="w-fit">
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {product.sku ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {product.oem_code ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {available} {product.unit}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right">
                      {formatCurrency(Number(product.sale_price))}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          render={<Link href={`/estoque/${product.id}`} />}
                          aria-label="Editar"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={isPending}
                          onClick={() => handleDelete(product.id)}
                          aria-label="Excluir"
                        >
                          <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
