import fs from "fs";
import path from "path";

const DATA_DIR = "src/data";
const OUTPUT_FILE = path.join(DATA_DIR, "all-items.json");

const categoryDirs = [
  "daggers",
  "swords",
  "bows",
  "wands",
  "staves",
  "katanas",
  "spellblades",
  "abilities",
  "armors",
  "rings",
  "pets"
];

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.log(`Skipped invalid JSON: ${filePath}`);
    return null;
  }
}

function slugFromFile(filePath) {
  return path.basename(filePath).replace(".json", "");
}

function getFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.join(dir, file));
}

function normalizeItem(item, filePath, category) {
  const slug = item.slug || slugFromFile(filePath);

  return {
    ...item,
    id: item.id || slug,
    name: item.name || slug,
    slug,
    category: item.category || category,
    subCategory: item.subCategory || "",
    sprite: item.sprite || item.spriteUrl || item.icon || `/items/${slug}.png`,
    spriteUrl: item.spriteUrl || "",
    icon: item.icon || "",
    itemType: item.itemType || "",
    tier: item.tier || "",
    bagType: item.bagType || "",
    soulbound: item.soulbound ?? false,
    usableClasses: item.usableClasses || [],
    dropsFrom: item.dropsFrom || [],
    effects: item.effects || [],
    notes: item.notes || [],
    stats: item.stats || {},
    sourceUrl: item.sourceUrl || ""
  };
}

const unique = new Map();

for (const category of categoryDirs) {
  const dir = path.join(DATA_DIR, category);
  const files = getFiles(dir);

  for (const filePath of files) {
    const item = readJson(filePath);
    if (!item) continue;

    const normalized = normalizeItem(item, filePath, category);

    if (!unique.has(normalized.slug)) {
      unique.set(normalized.slug, normalized);
    }
  }
}

const items = [...unique.values()].sort((a, b) =>
  String(a.name).localeCompare(String(b.name))
);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2));

console.log(`Generated ${OUTPUT_FILE}`);
console.log(`Total items: ${items.length}`);
