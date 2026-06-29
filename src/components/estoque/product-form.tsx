"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

import { saveProduct, type ProductSaveState } from "@/lib/estoque/actions";
import { cn } from "@/lib/utils";
import type {
  ProductPriceRow,
  ProductSpecificationRow,
  ProductSupplierRow,
  VehicleCompatibility,
} from "@/types/product-catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PriceType = { id: string; slug: string; name: string };
type EditorProduct = Record<string, unknown>;

type ProductFormProps = {
  mode: "create" | "edit";
  product?: EditorProduct;
  priceTypes: PriceType[];
  initialCompatibilities?: VehicleCompatibility[];
  initialPrices?: ProductPriceRow[];
  initialSuppliers?: ProductSupplierRow[];
  initialSpecs?: ProductSpecificationRow[];
  initialMovements?: Array<{
    id: string;
    movement_type: string;
    quantity: number;
    reason: string | null;
    created_at: string;
  }>;
};

const initialSaveState: ProductSaveState = {};

function emptyCompatibility(): VehicleCompatibility {
  return {
    make: "",
    model: "",
    year_start: null,
    year_end: null,
    engine: "",
    fuel_type: "",
    version: "",
  };
}

export function ProductForm({
  mode,
  product,
  priceTypes,
  initialCompatibilities = [],
  initialPrices = [],
  initialSuppliers = [],
  initialSpecs = [],
  initialMovements = [],
}: ProductFormProps) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(mode === "edit");
  const [showCompatibility, setShowCompatibility] = useState(
    initialCompatibilities.length > 0,
  );
  const [state, formAction, pending] = useActionState(saveProduct, initialSaveState);

  const [compatibilities, setCompatibilities] = useState<VehicleCompatibility[]>(
    initialCompatibilities.length > 0 ? initialCompatibilities : [emptyCompatibility()],
  );

  const [prices, setPrices] = useState<ProductPriceRow[]>(() => {
    if (initialPrices.length > 0) return initialPrices;
    return priceTypes.map((pt) => ({
      price_type_id: pt.id,
      slug: pt.slug,
      name: pt.name,
      value: pt.slug === "balcao" ? Number(product?.sale_price ?? 0) : 0,
    }));
  });

  const [suppliers, setSuppliers] = useState<ProductSupplierRow[]>(initialSuppliers);
  const [specifications, setSpecifications] = useState<ProductSpecificationRow[]>(
    initialSpecs.length > 0 ? initialSpecs : [],
  );

  const balcaoPrice = prices.find((p) => p.slug === "balcao")?.value ?? 0;

  function updateBalcaoPrice(value: number) {
    setPrices((prev) =>
      prev.map((p) => (p.slug === "balcao" ? { ...p, value } : p)),
    );
  }

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-6">
      {product?.id != null && (
        <input type="hidden" name="id" value={String(product.id)} />
      )}
      <input type="hidden" name="status" value="active" />
      <input type="hidden" name="unit" value={String(product?.unit ?? "un")} />
      <input type="hidden" name="origin" value={String(product?.origin ?? 0)} />
      <input type="hidden" name="max_quantity" value={String(product?.max_quantity ?? 0)} />
      <input type="hidden" name="quantity_reserved" value={String(product?.quantity_reserved ?? 0)} />
      <input type="hidden" name="quantity_in_transit" value={String(product?.quantity_in_transit ?? 0)} />
      <input
        type="hidden"
        name="compatibilities_json"
        value={JSON.stringify(compatibilities.filter((c) => c.make && c.model))}
      />
      <input type="hidden" name="prices_json" value={JSON.stringify(prices)} />
      <input
        type="hidden"
        name="suppliers_json"
        value={JSON.stringify(suppliers.filter((s) => s.supplier_name.trim()))}
      />
      <input
        type="hidden"
        name="specifications_json"
        value={JSON.stringify(specifications.filter((s) => s.spec_key && s.spec_value))}
      />

      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle>Cadastro essencial</CardTitle>
          <CardDescription>
            Campos mínimos para começar. Detalhes fiscais e extras ficam em opções avançadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nome da peça *"
            name="name"
            defaultValue={String(product?.name ?? "")}
            required
            className="sm:col-span-2"
            placeholder="Pastilha de freio dianteira"
          />
          <Field label="SKU" name="sku" defaultValue={String(product?.sku ?? "")} placeholder="PF-001" />
          <Field label="Código OEM" name="oem_code" defaultValue={String(product?.oem_code ?? "")} placeholder="04465-0D010" />
          <Field label="Marca" name="brand" defaultValue={String(product?.brand ?? "")} placeholder="Bosch" />
          <Field label="Categoria" name="category" defaultValue={String(product?.category ?? "")} placeholder="Freios" />
          <Field
            label="Quantidade"
            name="quantity"
            type="number"
            min={0}
            defaultValue={String(product?.quantity ?? 0)}
          />
          <Field
            label="Estoque mínimo"
            name="min_quantity"
            type="number"
            min={0}
            defaultValue={String(product?.min_quantity ?? 5)}
          />
          <Field
            label="Preço de custo (R$)"
            name="cost_price"
            type="number"
            step="0.01"
            min={0}
            defaultValue={String(product?.cost_price ?? 0)}
          />
          <div className="grid gap-2">
            <Label htmlFor="sale_price">Preço de venda (R$)</Label>
            <Input
              id="sale_price"
              name="sale_price"
              type="number"
              step="0.01"
              min={0}
              value={balcaoPrice}
              onChange={(e) => updateBalcaoPrice(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Compatibilidade veicular</CardTitle>
            <CardDescription>Opcional — ajuda na busca por veículo.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCompatibility((v) => !v)}
          >
            {showCompatibility ? "Ocultar" : "Adicionar"}
          </Button>
        </CardHeader>
        {showCompatibility && (
          <CardContent className="space-y-3">
            {compatibilities.map((row, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border border-border/60 p-3 sm:grid-cols-2 lg:grid-cols-4"
              >
                <Input
                  placeholder="Montadora (VW)"
                  value={row.make}
                  onChange={(e) => updateCompat(setCompatibilities, index, "make", e.target.value)}
                />
                <Input
                  placeholder="Modelo (Gol)"
                  value={row.model}
                  onChange={(e) => updateCompat(setCompatibilities, index, "model", e.target.value)}
                />
                <Input
                  placeholder="Ano de"
                  type="number"
                  value={row.year_start ?? ""}
                  onChange={(e) =>
                    updateCompat(
                      setCompatibilities,
                      index,
                      "year_start",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                />
                <Input
                  placeholder="Ano até"
                  type="number"
                  value={row.year_end ?? ""}
                  onChange={(e) =>
                    updateCompat(
                      setCompatibilities,
                      index,
                      "year_end",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                />
                {compatibilities.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="sm:col-span-2 lg:col-span-4"
                    onClick={() =>
                      setCompatibilities((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCompatibilities((prev) => [...prev, emptyCompatibility()])}
            >
              <Plus data-icon="inline-start" /> Outro veículo
            </Button>
          </CardContent>
        )}
      </Card>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm font-medium hover:bg-muted/40"
      >
        Opções avançadas
        <ChevronDown className={cn("size-4 transition-transform", showAdvanced && "rotate-180")} />
      </button>

      {showAdvanced && (
        <div className="space-y-6">
          <Card className="border-border/60 bg-card/70">
            <CardHeader>
              <CardTitle>Identificação extra</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="EAN / Código de barras" name="barcode_ean" defaultValue={String(product?.barcode_ean ?? "")} />
              <Field label="Código fabricante" name="manufacturer_code" defaultValue={String(product?.manufacturer_code ?? "")} />
              <Field label="Fabricante" name="manufacturer" defaultValue={String(product?.manufacturer ?? "")} />
              <Field label="Subcategoria" name="subcategory" defaultValue={String(product?.subcategory ?? "")} />
              <Field label="NCM" name="ncm" defaultValue={String(product?.ncm ?? "")} />
              <Field label="CEST" name="cest" defaultValue={String(product?.cest ?? "")} />
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="short_description">Descrição</Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  defaultValue={String(product?.short_description ?? product?.description ?? "")}
                />
              </div>
              <Field label="Prateleira" name="location_shelf" defaultValue={String(product?.location_shelf ?? product?.location ?? "")} />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70">
            <CardHeader>
              <CardTitle>Outros preços</CardTitle>
              <CardDescription>Além do balcão — oficina, atacado, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {prices
                .filter((p) => p.slug !== "balcao")
                .map((row, index) => (
                  <div key={row.price_type_id} className="flex items-center gap-3">
                    <span className="w-28 text-sm text-muted-foreground">{row.name}</span>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={row.value}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setPrices((prev) =>
                          prev.map((p) =>
                            p.price_type_id === row.price_type_id ? { ...p, value } : p,
                          ),
                        );
                      }}
                    />
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70">
            <CardHeader>
              <CardTitle>Fornecedor</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {suppliers.length === 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSuppliers([
                      { supplier_name: "", price: 0, lead_time_days: 0, min_order_qty: 1 },
                    ])
                  }
                >
                  Adicionar fornecedor
                </Button>
              ) : (
                suppliers.map((row, index) => (
                  <div key={index} className="contents">
                    <Input
                      placeholder="Nome do fornecedor"
                      value={row.supplier_name}
                      onChange={(e) =>
                        updateSupplier(setSuppliers, index, "supplier_name", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Preço (R$)"
                      type="number"
                      step="0.01"
                      value={row.price}
                      onChange={(e) =>
                        updateSupplier(setSuppliers, index, "price", Number(e.target.value))
                      }
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {mode === "edit" && initialMovements.length > 0 && (
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Últimas movimentações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {initialMovements.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <Badge variant="secondary">{m.movement_type}</Badge>
                <span>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 pb-8">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : mode === "create" ? "Cadastrar" : "Salvar"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/estoque")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  step,
  min,
  className,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  step?: string;
  min?: number;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        min={min}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

function updateCompat(
  setter: React.Dispatch<React.SetStateAction<VehicleCompatibility[]>>,
  index: number,
  key: keyof VehicleCompatibility,
  value: string | number | null,
) {
  setter((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
}

function updateSupplier(
  setter: React.Dispatch<React.SetStateAction<ProductSupplierRow[]>>,
  index: number,
  key: keyof ProductSupplierRow,
  value: string | number,
) {
  setter((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
}
