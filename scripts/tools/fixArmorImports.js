import fs from "fs";
import path from "path";

const DATA_DIR = "src/data";
const ARMOR_DIR = path.join(DATA_DIR, "armors");

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
  "rings"
];

const possibleArmorDirs = [
  "robes",
  "robe",
  "leather-armors",
  "leather-armor",
  "hide-armors",
  "hide-armor",
  "heavy-armors",
  "heavy-armor",
  "armors",
  "invalid"
];

fs.mkdirSync(ARMOR_DIR, { recursive: true });

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function getJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) return getJsonFiles(fullPath);
    if (entry.name.endsWith(".json")) return [fullPath];

    return [];
  });
}

function slugFromFile(file) {
  return path.basename(file).replace(".json", "");
}

function detectSubCategory(item, file) {
  const text = [
    file,
    item.name,
    item.category,
    item.subCategory,
    item.itemType
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("robe")) return "robes";
  if (text.includes("heavy")) return "heavy-armors";
  if (text.includes("leather") || text.includes("hide")) return "leather-armors";

  return "armors";
}

function isArmorLike(item, file) {
  if (!item) return false;

  const text = [
    file,
    item.name,
    item.category,
    item.subCategory,
    item.itemType
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("robe") ||
    text.includes("armor") ||
    text.includes("armour") ||
    text.includes("leather") ||
    text.includes("hide") ||
    text.includes("heavy")
  );
}

let moved = 0;
let fixed = 0;

for (const dirName of possibleArmorDirs) {
  const dir = path.join(DATA_DIR, dirName);
  const files = getJsonFiles(dir);

  for (const file of files) {
    const item = readJson(file);
    if (!isArmorLike(item, file)) continue;

    const slug = item.slug || slugFromFile(file);
    const subCategory = detectSubCategory(item, file);

    item.id = item.id || slug;
    item.slug = slug;
    item.category = "armors";
    item.subCategory = subCategory;
    item.sprite = item.sprite || item.spriteUrl || item.icon || `/items/${slug}.png`;

    if (!item.itemType || item.itemType === "Unknown") {
      if (subCategory === "robes") item.itemType = "Robe";
      else if (subCategory === "heavy-armors") item.itemType = "Heavy Armor";
      else if (subCategory === "leather-armors") item.itemType = "Leather Armor";
      else item.itemType = "Armor";
    }

    const target = path.join(ARMOR_DIR, `${slug}.json`);

    if (!fs.existsSync(target) || file === target) {
      fs.writeFileSync(target, JSON.stringify(item, null, 2));

      if (file !== target) {
        fs.unlinkSync(file);
        moved++;
      } else {
        fixed++;
      }

      console.log(`Armor fixed: ${item.name} -> ${target}`);
    }
  }
}

function rebuildIndexAndReport() {
  const allItems = [];

  for (const category of categoryDirs) {
    const dir = path.join(DATA_DIR, category);
    const files = getJsonFiles(dir);

    for (const file of files) {
      const item = readJson(file);
      if (!item) continue;

      const slug = item.slug || slugFromFile(file);

      allItems.push({
        id: item.id || slug,
        name: item.name || slug,
        slug,
        category: item.category || category,
        subCategory: item.subCategory || "",
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
    if (!unique.has(item.slug)) unique.set(item.slug, item);
  }

  const indexItems = [...unique.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const counts = {};
  for (const category of categoryDirs) {
    counts[category] = indexItems.filter((item) => item.category === category).length;
  }

  const invalidDir = path.join(DATA_DIR, "invalid");
  const invalid = getJsonFiles(invalidDir).length;

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
        invalid,
        categories: counts
      },
      null,
      2
    )
  );

  console.log("");
  console.log(`Index rebuilt: ${indexItems.length} items`);
  console.log(`Armors count: ${counts.armors}`);
  console.log(`Moved armor files: ${moved}`);
  console.log(`Fixed existing armor files: ${fixed}`);
}

rebuildIndexAndReport();
