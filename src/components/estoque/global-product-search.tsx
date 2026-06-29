"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { searchProducts } from "@/lib/estoque/actions";
import { formatCurrency } from "@/lib/format";
import type { ProductSearchResult } from "@/types/product-catalog";
import { Input } from "@/components/ui/input";

export function GlobalProductSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchProducts(query);
        setResults(data);
        setOpen(true);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative hidden max-w-sm flex-1 md:flex">
      <Search className="absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Código, OEM, EAN, nome, veículo…"
        className="pl-9"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && results.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {isPending && (
            <p className="px-3 py-2 text-xs text-muted-foreground">Buscando…</p>
          )}
          {results.map((item) => (
            <Link
              key={item.id}
              href={`/estoque/${item.id}`}
              className="block border-b border-border/60 px-3 py-2 text-sm last:border-0 hover:bg-muted"
            >
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {[item.sku, item.oem_code, item.barcode_ean].filter(Boolean).join(" · ") || "Sem código"}
                {" · "}
                {item.stock_available} disp. · {formatCurrency(item.sale_price)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
