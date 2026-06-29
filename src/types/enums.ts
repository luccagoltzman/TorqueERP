export type ProductStatus = "active" | "inactive";

export type StockMovementType =
  | "entry"
  | "exit"
  | "transfer"
  | "adjustment"
  | "loss"
  | "return";

export type ProductRelationType =
  | "similar"
  | "equivalent"
  | "original"
  | "parallel"
  | "kit"
  | "complementary";

export const ORIGIN_OPTIONS = [
  { value: 0, label: "0 — Nacional" },
  { value: 1, label: "1 — Estrangeira (importação direta)" },
  { value: 2, label: "2 — Estrangeira (mercado interno)" },
  { value: 3, label: "3 — Nacional (> 40% conteúdo importado)" },
  { value: 4, label: "4 — Nacional (conforme processos produtivos)" },
  { value: 5, label: "5 — Nacional (< 40% conteúdo importado)" },
  { value: 6, label: "6 — Estrangeira (importação direta, sem similar)" },
  { value: 7, label: "7 — Estrangeira (mercado interno, sem similar)" },
  { value: 8, label: "8 — Nacional (> 70% conteúdo importado)" },
] as const;

export const UNIT_OPTIONS = [
  "un",
  "pc",
  "par",
  "cx",
  "kit",
  "l",
  "ml",
  "kg",
  "g",
  "m",
  "cm",
] as const;
