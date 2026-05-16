import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.realmeye.com";
const OUTPUT_JSON = "src/data/class-skins.json";
const SKINS_DIR = "public/skins";

fs.mkdirSync(SKINS_DIR, { recursive: true });
fs.mkdirSync("debug", { recursive: true });

const classes = [
  { className: "Rogue", slug: "rogue" },
  { className: "Archer", slug: "archer" },
  { className: "Wizard", slug: "wizard" },
  { className: "Priest", slug: "priest" },
  { className: "Warrior", slug: "warrior" },
  { className: "Knight", slug: "knight" },
  { className: "Paladin", slug: "paladin" },
  { className: "Assassin", slug: "assassin" },
  { className: "Necromancer", slug: "necromancer" },
  { className: "Huntress", slug: "huntress" },
  { className: "Mystic", slug: "mystic" },
  { className: "Trickster", slug: "trickster" },
  { className: "Sorcerer", slug: "sorcerer" },
  { className: "Ninja", slug: "ninja" },
  { className: "Samurai", slug: "samurai" },
  { className: "Bard", slug: "bard" },
  { className: "Summoner", slug: "summoner" },
  { className: "Kensei", slug: "kensei" }
];

function getArg(name, fallback = null) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

const batch = Number(getArg("--batch", "99999"));
const debug = process.argv.includes("--debug");

function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function cleanText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function absoluteUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
}

async function fetchPage(url) {
  const response = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  return response.data;
}

async function downloadImage(url, outputPath) {
  if (!url) return false;

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    fs.writeFileSync(outputPath, response.data);
    return true;
  } catch {
    return false;
  }
}

function inferRarity(name) {
  const lower = name.toLowerCase();

  if (lower.includes("set skin")) return "Set Tier";
  if (lower.includes("classic")) return "Classic";
  if (lower.includes("legacy")) return "Legacy";
  if (lower.includes("platinum")) return "Platinum";
  if (lower.includes("golden")) return "Golden";
  if (lower.includes("mystery")) return "Mystery";

  return "";
}

function shouldSkipImage(name, src, className) {
  const lowerName = name.toLowerCase();
  const lowerSrc = src.toLowerCase();

  if (!name) return true;
  if (name.length < 2) return true;
  if (lowerName === "eye") return true;
  if (lowerName === className.toLowerCase()) return true;
  if (lowerSrc.includes("/s/hl/img/")) return true;
  if (!lowerSrc.includes("/s/a/img/wiki/")) return true;

  return false;
}

function collectSkinsFromPage($, className, pageUrl) {
  const skins = new Map();

  $("img").each((_, img) => {
    const $img = $(img);

    const src =
      $img.attr("src") ||
      $img.attr("data-src") ||
      $img.attr("data-original") ||
      "";

    const name =
      cleanText($img.attr("title")) ||
      cleanText($img.attr("alt"));

    if (shouldSkipImage(name, src, className)) return;

    const slug = slugify(`${className}-${name}`);
    if (!slug) return;

    const parentLink = $img.closest("a[href^='/wiki/']").attr("href") || "";

    skins.set(slug, {
      id: slug,
      name,
      slug,
      class: className,
      sprite: `/skins/${slug}.png`,
      imageUrl: absoluteUrl(src),
      rarity: inferRarity(name),
      sourceUrl: parentLink ? absoluteUrl(parentLink) : pageUrl,
      notes: []
    });
  });

  return [...skins.values()];
}

async function importClassSkins(classInfo) {
  const pageUrl = `${BASE_URL}/wiki/${classInfo.slug}-skins`;

  console.log(`Fetching ${classInfo.className}: ${pageUrl}`);

  try {
    const html = await fetchPage(pageUrl);

    if (debug) {
      fs.writeFileSync(`debug/${classInfo.slug}-skins.html`, html);
    }

    const $ = cheerio.load(html);
    const skins = collectSkinsFromPage($, classInfo.className, pageUrl);

    console.log(`Found ${skins.length} skins for ${classInfo.className}`);

    return skins;
  } catch {
    console.log(`Failed ${classInfo.className}`);
    return [];
  }
}

async function main() {
  const allSkins = [];

  for (const classInfo of classes) {
    const skins = await importClassSkins(classInfo);

    for (const skin of skins) {
      allSkins.push(skin);

      if (allSkins.length >= batch) break;
    }

    if (allSkins.length >= batch) break;
  }

  const unique = new Map();

  for (const skin of allSkins) {
    unique.set(skin.slug, skin);
  }

  const output = [];

  for (const skin of unique.values()) {
    const imagePath = path.join(SKINS_DIR, `${skin.slug}.png`);
    const ok = await downloadImage(skin.imageUrl, imagePath);

    if (!ok) {
      console.log(`Image failed: ${skin.name}`);
      continue;
    }

    delete skin.imageUrl;
    output.push(skin);

    console.log(`Imported skin: ${skin.class} - ${skin.name}`);
  }

  output.sort((a, b) => {
    if (a.class !== b.class) return a.class.localeCompare(b.class);
    return a.name.localeCompare(b.name);
  });

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));

  console.log("");
  console.log(`Class skins saved: ${output.length}`);
  console.log(`File: ${OUTPUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
