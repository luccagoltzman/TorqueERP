import type { ProductRelationType, StockMovementType } from "./enums";

export type {
  ProductRelationType,
  ProductStatus,
  StockMovementType,
} from "./enums";

export const PRODUCT_FORM_MODULES = [
  { id: "essential", label: "Essencial", phase: 1 },
  { id: "compatibility", label: "Compatibilidade", phase: 1 },
  { id: "advanced", label: "Avançado", phase: 2 },
] as const;

export type ProductFormModuleId = (typeof PRODUCT_FORM_MODULES)[number]["id"];

export type VehicleCompatibility = {
  id?: string;
  make: string;
  model: string;
  year_start?: number | null;
  year_end?: number | null;
  engine?: string | null;
  fuel_type?: string | null;
  version?: string | null;
  notes?: string | null;
};

export type ProductPriceRow = {
  price_type_id: string;
  slug: string;
  name: string;
  value: number;
  margin_pct?: number | null;
  max_discount_pct?: number | null;
};

export type ProductSupplierRow = {
  id?: string;
  supplier_id?: string;
  supplier_name: string;
  supplier_code?: string | null;
  price: number;
  lead_time_days: number;
  min_order_qty: number;
  is_primary?: boolean;
};

export type ProductSpecificationRow = {
  spec_key: string;
  spec_value: string;
};

export type ProductFormPayload = {
  id?: string;
  sku?: string | null;
  barcode_ean?: string | null;
  manufacturer_code?: string | null;
  oem_code?: string | null;
  name: string;
  short_description?: string | null;
  technical_description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  manufacturer?: string | null;
  unit: string;
  ncm?: string | null;
  cest?: string | null;
  origin: number;
  status: "active" | "inactive";
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  quantity_reserved: number;
  quantity_in_transit: number;
  location_aisle?: string | null;
  location_shelf?: string | null;
  location_column?: string | null;
  location_level?: string | null;
  cost_price: number;
  sale_price: number;
  compatibilities: VehicleCompatibility[];
  prices: ProductPriceRow[];
  suppliers: ProductSupplierRow[];
  specifications: ProductSpecificationRow[];
  commercial?: {
    on_promotion?: boolean;
    featured?: boolean;
    is_launch?: boolean;
    discontinued?: boolean;
    accepts_preorder?: boolean;
    fractional_sale?: boolean;
  };
  workshop?: {
    avg_install_minutes?: number | null;
    difficulty_level?: number | null;
    part_warranty_days?: number | null;
    install_warranty_days?: number | null;
    suggested_labor_price?: number | null;
  };
};

export type ProductSearchResult = {
  id: string;
  name: string;
  sku: string | null;
  oem_code: string | null;
  barcode_ean: string | null;
  brand: string | null;
  stock_available: number;
  sale_price: number;
};

export type StockMovementRecord = {
  id: string;
  movement_type: StockMovementType;
  quantity: number;
  reason: string | null;
  created_at: string;
  created_by: string | null;
};
