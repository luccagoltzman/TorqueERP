const fs = require("fs");
const path = require("path");

const staleNextDir = path.join(__dirname, "..", ".next");

if (!fs.existsSync(staleNextDir)) {
  process.exit(0);
}

try {
  fs.rmSync(staleNextDir, { recursive: true, force: true });
  console.log("[torqueerp] Pasta .next obsoleta removida (cache agora em node_modules/.cache/next).");
} catch {
  console.warn(
    "[torqueerp] Não foi possível remover .next — encerre outros `npm run dev` e tente de novo.",
  );
}
