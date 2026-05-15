import fs from "fs";
import path from "path";

const DATA_DIR = "src/data";

const categoryDirs = [
  "daggers",
  "swords",
  "bows",
  "wands",
  "staves",
  "katanas",
  "spellblades"
];

const duplicatesDir = path.join(DATA_DIR, "duplicates");
fs.mkdirSync(duplicatesDir, { recursive: true });

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function getJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.join(dir, file));
}

function normalizeSlug(item, filePath) {
  if (item?.slug) return item.slug;

  return path
    .basename(filePath)
    .replace(".json", "")
    .trim()
    .toLowerCase();
}

const seen = new Map();
const keptItems = [];
const movedDuplicates = [];

for (const category of categoryDirs) {
  const dir = path.join(DATA_DIR, category);
  const files = getJsonFiles(dir);

  for (const filePath of files) {
    const item = readJson(filePath);

    if (!item) {
      console.log(`Invalid JSON skipped: ${filePath}`);
      continue;
    }

    const slug = normalizeSlug(item, filePath);
    const existing = seen.get(slug);

    if (!existing) {
      item.slug = slug;
      item.category = item.category || category;
      seen.set(slug, { item, filePath, category });
      keptItems.push(item);
      continue;
    }

    const duplicateName = `${category}__${path.basename(filePath)}`;
    const duplicatePath = path.join(duplicatesDir, duplicateName);

    fs.renameSync(filePath, duplicatePath);

    movedDuplicates.push({
      slug,
      from: filePath,
      movedTo: duplicatePath,
      kept: existing.filePath
    });

    console.log(`Duplicate moved: ${filePath} -> ${duplicatePath}`);
  }
}

const indexItems = keptItems
  .map((item) => ({
    id: item.id || item.slug,
    name: item.name || item.slug,
    slug: item.slug,
    category: item.category || "",
    sprite: item.sprite || item.spriteUrl || item.icon || `/items/${item.slug}.png`,
    spriteUrl: item.spriteUrl,
    icon: item.icon,
    itemType: item.itemType || "",
    tier: item.tier || "",
    bagType: item.bagType || "",
    soulbound: item.soulbound ?? false,
    usableClasses: item.usableClasses || [],
    sourceUrl: item.sourceUrl || ""
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const categoryCounts = {};
for (const category of categoryDirs) {
  categoryCounts[category] = indexItems.filter((item) => item.category === category).length;
}

const invalidDir = path.join(DATA_DIR, "invalid");
const invalidCount = fs.existsSync(invalidDir)
  ? fs.readdirSync(invalidDir).filter((file) => file.endsWith(".json")).length
  : 0;

fs.writeFileSync(
  path.join(DATA_DIR, "index.json"),
  JSON.stringify(indexItems, null, 2)
);

fs.writeFileSync(
  path.join(DATA_DIR, "import-report.json"),
  JSON.stringify(
    {
      totalImported: indexItems.length,
      duplicates: movedDuplicates.length,
      invalid: invalidCount,
      categories: categoryCounts
    },
    null,
    2
  )
);

fs.writeFileSync(
  path.join(DATA_DIR, "duplicate-report.json"),
  JSON.stringify(movedDuplicates, null, 2)
);

console.log("");
console.log("Cleanup complete.");
console.log(`Total unique items: ${indexItems.length}`);
console.log(`Duplicates moved: ${movedDuplicates.length}`);
console.log("Duplicate report: src/data/duplicate-report.json");
console.log("Moved duplicates folder: src/data/duplicates/");
