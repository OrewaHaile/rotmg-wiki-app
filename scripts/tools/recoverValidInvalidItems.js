import fs from "fs";
import path from "path";

const DATA_DIR = "src/data";
const INVALID_DIR = path.join(DATA_DIR, "invalid");

const categoryDirs = [
  "daggers",
  "swords",
  "bows",
  "wands",
  "staves",
  "katanas",
  "spellblades"
];

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

function slugFromFile(file) {
  return path.basename(file).replace(".json", "");
}

function hasUsefulStats(item) {
  return (
    item.stats &&
    typeof item.stats === "object" &&
    Object.keys(item.stats).length > 0
  );
}

function isValidRecoverableWeapon(item, file) {
  if (!item) return false;

  const slug = item.slug || slugFromFile(file);
  const category = item.category;

  if (!item.name) return false;
  if (!slug) return false;
  if (!categoryDirs.includes(category)) return false;
  if (!item.itemType) return false;
  if (!item.sprite && !item.spriteUrl && !item.icon) return false;
  if (!hasUsefulStats(item)) return false;

  const tier = String(item.tier || "").trim().toLowerCase();

  if (!tier) return false;
  if (tier === "unknown") return false;
  if (tier === "items") return false;

  return true;
}

function rebuildIndexAndReport() {
  const allItems = [];

  for (const category of categoryDirs) {
    const dir = path.join(DATA_DIR, category);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(dir, file);
      const item = readJson(filePath);
      if (!item) continue;

      const slug = item.slug || file.replace(".json", "");

      allItems.push({
        id: item.id || slug,
        name: item.name || slug,
        slug,
        category: item.category || category,
        sprite: item.sprite || item.spriteUrl || item.icon || `/items/${slug}.png`,
        spriteUrl: item.spriteUrl,
        icon: item.icon,
        itemType: item.itemType || "",
        tier: item.tier || "",
        bagType: item.bagType || "",
        soulbound: item.soulbound ?? false,
        usableClasses: item.usableClasses || [],
        sourceUrl: item.sourceUrl || ""
      });
    }
  }

  const unique = new Map();

  for (const item of allItems) {
    if (!unique.has(item.slug)) {
      unique.set(item.slug, item);
    }
  }

  const indexItems = [...unique.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const categoryCounts = {};
  for (const category of categoryDirs) {
    categoryCounts[category] = indexItems.filter(
      (item) => item.category === category
    ).length;
  }

  const invalidCount = getFiles(INVALID_DIR).length;

  fs.writeFileSync(
    path.join(DATA_DIR, "index.json"),
    JSON.stringify(indexItems, null, 2)
  );

  fs.writeFileSync(
    path.join(DATA_DIR, "import-report.json"),
    JSON.stringify(
      {
        totalImported: indexItems.length,
        duplicates: 0,
        invalid: invalidCount,
        categories: categoryCounts
      },
      null,
      2
    )
  );

  console.log(`Index rebuilt: ${indexItems.length} items`);
  console.log(`Invalid remaining: ${invalidCount}`);
}

const invalidFiles = getFiles(INVALID_DIR);

let recovered = 0;
let skipped = 0;

for (const file of invalidFiles) {
  const item = readJson(file);

  if (!isValidRecoverableWeapon(item, file)) {
    skipped++;
    continue;
  }

  const slug = item.slug || slugFromFile(file);
  const category = item.category;
  const targetDir = path.join(DATA_DIR, category);
  const targetFile = path.join(targetDir, `${slug}.json`);

  fs.mkdirSync(targetDir, { recursive: true });

  if (fs.existsSync(targetFile)) {
    skipped++;
    continue;
  }

  item.slug = slug;
  item.category = category;

  fs.writeFileSync(targetFile, JSON.stringify(item, null, 2));
  fs.unlinkSync(file);

  recovered++;
  console.log(`Recovered: ${item.name} -> ${targetFile}`);
}

rebuildIndexAndReport();

console.log("");
console.log(`Recovered valid items: ${recovered}`);
console.log(`Skipped/kept invalid: ${skipped}`);
