import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.realmeye.com";
const SOURCE_URL = `${BASE_URL}/wiki/pet-skins`;

const PETS_DIR = "src/data/pets";
const ITEMS_DIR = "public/items";
const INDEX_FILE = "src/data/index.json";
const REPORT_FILE = "src/data/import-report.json";

fs.mkdirSync(PETS_DIR, { recursive: true });
fs.mkdirSync(ITEMS_DIR, { recursive: true });

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function absoluteUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
}

function getImageUrl($img) {
  return (
    $img.attr("src") ||
    $img.attr("data-src") ||
    $img.attr("data-original") ||
    ""
  );
}

function cleanName(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/Pet Skin$/i, "")
    .trim();
}

async function downloadSprite(url, outputPath) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  fs.writeFileSync(outputPath, response.data);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function rebuildIndexAndReport() {
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

  const allItems = [];

  for (const category of categoryDirs) {
    const dir = `src/data/${category}`;
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json"));

    for (const file of files) {
      const item = readJson(path.join(dir, file));
      if (!item) continue;

      const slug = item.slug || file.replace(".json", "");

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

  const categories = {};

  for (const category of categoryDirs) {
    categories[category] = indexItems.filter((item) => item.category === category).length;
  }

  const invalidDir = "src/data/invalid";
  const invalid = fs.existsSync(invalidDir)
    ? fs.readdirSync(invalidDir).filter((file) => file.endsWith(".json")).length
    : 0;

  fs.writeFileSync(INDEX_FILE, JSON.stringify(indexItems, null, 2));

  fs.writeFileSync(
    REPORT_FILE,
    JSON.stringify(
      {
        totalImported: indexItems.length,
        duplicates: 0,
        invalid,
        categories
      },
      null,
      2
    )
  );
}

async function main() {
  console.log(`Fetching ${SOURCE_URL}`);

  const html = await axios.get(SOURCE_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  }).then((res) => res.data);

  const $ = cheerio.load(html);
  const pets = new Map();

  $("table tr").each((_, row) => {
    const $row = $(row);
    const $img = $row.find("img").first();

    if (!$img.length) return;

    const rawImgUrl = getImageUrl($img);
    if (!rawImgUrl) return;

    let name =
      cleanName($img.attr("alt")) ||
      cleanName($img.attr("title")) ||
      cleanName($row.find("a").first().text()) ||
      cleanName($row.children("td").first().text());

    if (!name) {
      const href = $row.find("a[href^='/wiki/']").first().attr("href");
      if (href) name = cleanName(href.split("/").pop()?.replace(/-/g, " "));
    }

    if (!name) return;

    const slug = slugify(name);
    if (!slug) return;

    const imgUrl = absoluteUrl(rawImgUrl);

    pets.set(slug, {
      name,
      slug,
      imgUrl
    });
  });

  if (pets.size === 0) {
    console.log("No pet skins found in table rows. Trying fallback image collector...");

    $("img").each((_, img) => {
      const $img = $(img);
      const rawImgUrl = getImageUrl($img);
      if (!rawImgUrl) return;

      const name =
        cleanName($img.attr("alt")) ||
        cleanName($img.attr("title"));

      if (!name) return;
      if (name.length < 2) return;

      const slug = slugify(name);
      if (!slug) return;

      pets.set(slug, {
        name,
        slug,
        imgUrl: absoluteUrl(rawImgUrl)
      });
    });
  }

  console.log(`Found pet skin candidates: ${pets.size}`);

  let imported = 0;
  let skipped = 0;

  for (const pet of pets.values()) {
    const jsonPath = path.join(PETS_DIR, `${pet.slug}.json`);
    const spritePath = path.join(ITEMS_DIR, `${pet.slug}.png`);

    if (!fs.existsSync(spritePath)) {
      try {
        await downloadSprite(pet.imgUrl, spritePath);
      } catch (error) {
        console.log(`Sprite failed: ${pet.name} | ${pet.imgUrl}`);
        skipped++;
        continue;
      }
    }

    const data = {
      id: pet.slug,
      name: pet.name,
      slug: pet.slug,
      category: "pets",
      subCategory: "pet-skins",
      sprite: `/items/${pet.slug}.png`,
      itemType: "Pet Skin",
      tier: "",
      bagType: "",
      soulbound: false,
      feedPower: null,
      fameBonus: null,
      description: "",
      stats: {},
      effects: [],
      usableClasses: [],
      dropsFrom: [],
      notes: [],
      sourceUrl: SOURCE_URL
    };

    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    imported++;

    console.log(`Imported pet skin: ${pet.name}`);
  }

  rebuildIndexAndReport();

  console.log("");
  console.log(`Pet skins imported: ${imported}`);
  console.log(`Pet skins skipped: ${skipped}`);
  console.log("Report updated: src/data/import-report.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
