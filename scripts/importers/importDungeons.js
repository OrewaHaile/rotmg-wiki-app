import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.realmeye.com";
const SOURCE_URL = `${BASE_URL}/wiki/dungeons`;

const DUNGEONS_DIR = "src/data/dungeons";
const DUNGEON_IMAGES_DIR = "public/dungeons";

fs.mkdirSync(DUNGEONS_DIR, { recursive: true });
fs.mkdirSync(DUNGEON_IMAGES_DIR, { recursive: true });

function getArg(name, fallback = null) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

const batch = Number(getArg("--batch", "999"));

function slugify(text) {
  return String(text || "")
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

function cleanText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
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

async function fetchPage(url) {
  const response = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  return response.data;
}

function collectDungeonLinks($) {
  const links = new Map();

  $("a[href^='/wiki/']").each((_, anchor) => {
    const $a = $(anchor);
    const href = $a.attr("href");
    const name = cleanText($a.text());

    if (!href || !name) return;

    const blocked = [
      "/wiki/dungeons",
      "/wiki/equipment",
      "/wiki/items",
      "/wiki/realmeye",
      "/wiki/classes",
      "/wiki/pets"
    ];

    if (blocked.includes(href)) return;
    if (href.includes("#")) return;
    if (href.includes("?")) return;
    if (name.length < 2) return;

    const slug = href.split("/").pop();
    if (!slug) return;

    links.set(href, {
      name,
      href,
      url: absoluteUrl(href),
      slug
    });
  });

  return [...links.values()];
}

function extractFirstImage($) {
  const img =
    $("table img").first().attr("src") ||
    $(".wiki-content img").first().attr("src") ||
    $("img").first().attr("src") ||
    "";

  return absoluteUrl(img);
}

function extractDescription($) {
  const paragraphs = [];

  $("p").each((_, p) => {
    const text = cleanText($(p).text());
    if (text.length > 60) paragraphs.push(text);
  });

  return paragraphs[0] || "";
}

function extractListByKeywords($, keywords) {
  const found = new Set();

  $("a[href^='/wiki/']").each((_, a) => {
    const text = cleanText($(a).text());
    const href = $(a).attr("href") || "";

    if (!text || text.length < 2) return;

    const lower = href.toLowerCase() + " " + text.toLowerCase();

    if (keywords.some((keyword) => lower.includes(keyword))) {
      found.add(text);
    }
  });

  return [...found];
}

async function importDungeon(link) {
  const html = await fetchPage(link.url);
  const $ = cheerio.load(html);

  const pageTitle = cleanText($("h1").first().text()) || link.name;
  const slug = slugify(pageTitle || link.slug);

  const imageUrl = extractFirstImage($);
  const imagePath = `/dungeons/${slug}.png`;
  const localImagePath = path.join(DUNGEON_IMAGES_DIR, `${slug}.png`);

  if (imageUrl && !fs.existsSync(localImagePath)) {
    await downloadImage(imageUrl, localImagePath);
  }

  const description = extractDescription($);

  const bosses = extractListByKeywords($, ["boss", "oryx", "lord", "king", "queen"]);
  const drops = extractListByKeywords($, ["drop", "loot", "bag", "mark"]);

  const data = {
    id: slug,
    name: pageTitle,
    slug,
    category: "dungeons",
    sprite: imageUrl ? imagePath : "",
    difficulty: "",
    realmPortal: false,
    location: [],
    drops,
    bosses,
    description,
    notes: [],
    sourceUrl: link.url
  };

  fs.writeFileSync(
    path.join(DUNGEONS_DIR, `${slug}.json`),
    JSON.stringify(data, null, 2)
  );

  console.log(`Imported dungeon: ${pageTitle}`);
}

async function main() {
  console.log(`Fetching dungeon index: ${SOURCE_URL}`);

  const html = await fetchPage(SOURCE_URL);
  const $ = cheerio.load(html);

  const links = collectDungeonLinks($).slice(0, batch);

  console.log(`Found dungeon candidates: ${links.length}`);

  for (const link of links) {
    try {
      await importDungeon(link);
    } catch (error) {
      console.log(`Failed dungeon: ${link.name}`);
    }
  }

  console.log("Dungeon import complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
