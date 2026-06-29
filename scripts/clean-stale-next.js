const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const nextDir = path.join(projectRoot, ".next");
const legacyCacheLink = path.join(projectRoot, "node_modules", ".cache", "next");

function killDevPorts() {
  try {
    execSync(
      'powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"',
      { stdio: "ignore" },
    );
  } catch {
    // Ignorado
  }
}

function isJunction(targetPath) {
  try {
    const stat = fs.lstatSync(targetPath);
    return stat.isSymbolicLink() || (typeof stat.isJunction === "function" && stat.isJunction());
  } catch {
    return false;
  }
}

function removeBrokenLinks() {
  for (const target of [nextDir, legacyCacheLink]) {
    if (fs.existsSync(target) && isJunction(target)) {
      try {
        fs.rmSync(target, { recursive: true, force: true });
        console.log(`[torqueerp] Junction removida: ${path.basename(target)}`);
      } catch {
        console.warn(`[torqueerp] Não foi possível remover junction ${target}`);
      }
    }
  }
}

function removeCorruptedNextCache() {
  if (!fs.existsSync(nextDir)) return;

  const routesManifest = path.join(nextDir, "routes-manifest.json");
  if (fs.existsSync(routesManifest)) return;

  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log("[torqueerp] Cache .next corrompido removido (routes-manifest ausente)");
  } catch {
    console.warn("[torqueerp] Não foi possível remover cache .next corrompido");
  }
}

killDevPorts();
removeBrokenLinks();
removeCorruptedNextCache();
