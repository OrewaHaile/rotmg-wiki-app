import fs from "fs";
import path from "path";

const invalidDir = "src/data/invalid";

function getFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return getFiles(fullPath);
    if (entry.name.endsWith(".json")) return [fullPath];
    return [];
  });
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

const files = getFiles(invalidDir);

const report = files.map((file) => {
  const item = readJson(file);

  if (!item) {
    return {
      file,
      reason: ["invalid json"],
    };
  }

  const reasons = [];

  if (!item.name) reasons.push("missing name");
  if (!item.slug) reasons.push("missing slug");
  if (!item.sprite && !item.spriteUrl && !item.icon) reasons.push("missing sprite");
  if (!item.itemType) reasons.push("missing itemType");
  if (!item.tier) reasons.push("missing tier");

  const hasStats =
    item.stats &&
    typeof item.stats === "object" &&
    Object.keys(item.stats).length > 0;

  if (!hasStats) reasons.push("missing stats");

  return {
    file,
    name: item.name || "",
    slug: item.slug || "",
    category: item.category || "",
    itemType: item.itemType || "",
    tier: item.tier || "",
    sprite: item.sprite || item.spriteUrl || item.icon || "",
    reasons,
  };
});

fs.writeFileSync(
  "src/data/invalid-analysis.json",
  JSON.stringify(report, null, 2)
);

console.log(`Invalid files analyzed: ${report.length}`);
console.log("");

for (const item of report.slice(0, 30)) {
  console.log(`${item.name || "(no name)"} | ${item.category || "-"} | ${item.itemType || "-"} | ${item.tier || "-"} | ${item.reasons.join(", ")}`);
}

console.log("");
console.log("Full report saved to src/data/invalid-analysis.json");
