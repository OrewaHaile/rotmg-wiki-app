/**
 * Import queue helper.
 * Runs one safe batch per category. Use it only when the single-category importer is stable.
 *
 * Usage:
 *   node scripts/import-weapons-queue.js
 */
import { spawnSync } from "child_process";

const categories = [
  "/wiki/daggers",
  "/wiki/swords",
  "/wiki/bows",
  "/wiki/staves",
  "/wiki/wands",
  "/wiki/katanas",
  "/wiki/spellblades",
  "/wiki/rings",
];

const batch = process.argv.includes("--batch")
  ? process.argv[process.argv.indexOf("--batch") + 1]
  : "25";

for (const url of categories) {
  console.log(`\n=== Importando lote: ${url} ===`);
  const result = spawnSync("node", ["services/realmeyeImporter.js", "--url", url, "--batch", batch], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    console.error(`Falhou em ${url}. Parando fila para evitar dados quebrados.`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nFila concluída.");
