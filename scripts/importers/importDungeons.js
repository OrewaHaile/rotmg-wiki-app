import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.realmeye.com";
const SOURCE_URL = `${BASE_URL}/wiki/dungeons`;

const DUNGEONS_DIR = "src/data/dungeons";
const DUNGEON_IMAGES_DIR = "public/dungeons";

fs.mkdirSync(DUNGEONS_DIR, { recursive: true });
fs.mkdirSync(DUNGEON_IMAGES_DIR, { recursive: true });
fs.mkdirSync("debug", { recursive: true });

function getArg(name, fallback = null) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

const batch = Number(getArg("--batch", "999"));

function slugify(text) {
  return String(text || "")
    .normalize("NFD")
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

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

async function downloadImage(url, outputPath) {
  if (!url) return false;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      }
    });

    if (!response.ok) return false;
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    return true;
  } catch {
    return false;
  }
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Connection": "keep-alive"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  return await response.text();
}

function collectDungeonLinks($) {
  const links = new Map();
  const blockedNames = new Set([
    "contents",
    "table of contents",
    "realm dungeons",
    "realm event dungeons",
    "advanced dungeons",
    "oryx's castle",
    "wormholes",
    "heroic dungeons",
    "special event dungeons",
    "other dungeons",
    "history",
    "dungeon overview",
    "dungeon list",
    "hidden dungeons",
    "bonus dungeons"
  ]);

  $("a[href^='/wiki/']").each((_, anchor) => {
    const $a = $(anchor);
    const href = $a.attr("href");
    const name = cleanText($a.text());
    if (!href || !name) return;
    const lower = name.toLowerCase();
    if (href.includes("#")) return;
    if (href.includes("?")) return;
    if (name.length < 2) return;
    if (blockedNames.has(lower)) return;
    if (lower.startsWith("realmeye")) return;
    if (lower.startsWith("wiki")) return;

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
  const selectors = ["table img", ".wiki-content img", "img"];
  for (const selector of selectors) {
    const src = $(selector).first().attr("src");
    if (src) return absoluteUrl(src);
  }
  return "";
}

function extractDescription($) {
  const paragraphs = [];
  $("p").each((_, p) => {
    const text = cleanText($(p).text());
    if (text.length > 60 && !text.toLowerCase().includes("last updated") && !text.toLowerCase().includes("realmeye")) {
      paragraphs.push(text);
    }
  });
  return paragraphs[0] || "";
}

function extractTableValue($, labels) {
  let value = "";
  $("tr").each((_, row) => {
    const cells = $(row).find("th, td").toArray().map((cell) => cleanText($(cell).text()));
    if (cells.length < 2) return;
    const label = cells[0].toLowerCase();
    if (labels.some((target) => label.includes(target))) {
      const rest = cells.slice(1).join(" ").trim();
      if (rest) value = rest;
    }
  });
  return value;
}

function extractLocations($) {
  const value = extractTableValue($, ["location", "realm", "area", "region"]);
  if (value) {
    return value.split(/,|;|\band\b|\//).map((part) => cleanText(part)).filter(Boolean);
  }
  const section = extractSectionText($, ["location", "realm", "area", "region"]);
  return section ? [section] : [];
}

function extractDifficulty($) {
  const value = extractTableValue($, ["difficulty", "danger level", "challenge"]);
  if (value) return value;
  return extractSectionText($, ["difficulty", "danger", "challenge"]);
}

function extractRealmPortal($) {
  const text = cleanText($("body").text()).toLowerCase();
  return text.includes("realm portal") || text.includes("portal to the realm");
}

function extractListByKeywords($, keywords) {
  const found = new Set();
  $("a[href^='/wiki/']").each((_, a) => {
    const text = cleanText($(a).text());
    if (!text || text.length < 2) return;
    const href = ($(a).attr("href") || "").toLowerCase();
    const lower = `${href} ${text.toLowerCase()}`;
    if (keywords.some((keyword) => lower.includes(keyword))) {
      found.add(text);
    }
  });
  return [...found];
}

function extractSectionText($, keywords) {
  const results = [];
  $("h2,h3,h4").each((_, heading) => {
    const headingText = cleanText($(heading).text()).toLowerCase();
    if (!keywords.some((keyword) => headingText.includes(keyword))) return;
    let current = $(heading).next();
    while (current.length) {
      const tag = current.get(0)?.tagName?.toLowerCase();
      if (["h1", "h2", "h3", "h4"].includes(tag)) break;
      const text = cleanText(current.text());
      if (text) results.push(text);
      current = current.next();
    }
  });
  return results.join(" ").trim();
}

function buildDungeonData(link, pageTitle, imageUrl, description, bosses, drops, locations, difficulty, realmPortal) {
  const slug = slugify(pageTitle || link.slug);
  const issues = [];
  if (!imageUrl) issues.push("missing image");
  if (!description) issues.push("missing description");
  if (bosses.length === 0) issues.push("missing bosses");
  if (drops.length === 0) issues.push("missing drops");
  if (locations.length === 0) issues.push("missing location");
  if (!difficulty) issues.push("missing difficulty");
  return {
    id: slug,
    name: pageTitle,
    slug,
    category: "dungeons",
    sprite: imageUrl ? `/dungeons/${slug}.png` : "",
    difficulty,
    realmPortal,
    location: locations,
    bosses,
    drops,
    description,
    notes: [],
    sourceUrl: link.url,
    needsReview: issues.length > 0,
    issues
  };
}

function writeDungeonFile(data) {
  writeJson(path.join(DUNGEONS_DIR, `${data.slug}.json`), data);
}

function buildDungeonIndex() {
  const files = fs.readdirSync(DUNGEONS_DIR).filter((name) => name.endsWith(".json") && name !== "index.json");
  const dungeons = files
    .map((file) => {
      const filePath = path.join(DUNGEONS_DIR, file);
      return readJson(filePath);
    })
    .filter(Boolean)
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  writeJson(path.join(DUNGEONS_DIR, "index.json"), dungeons);
  return dungeons;
}

async function importDungeon(link, debug) {
  const html = await fetchPage(link.url);
  const $ = cheerio.load(html);
  if (debug) {
    writeJson(path.join("debug", `${link.slug}-page.json`), {
      url: link.url,
      title: link.name,
      body: cleanText($("body").text()).slice(0, 2000)
    });
  }
  const pageTitle = cleanText($("h1").first().text()) || link.name;
  const imageUrl = extractFirstImage($);
  const description = extractDescription($);
  const bosses = extractListByKeywords($, ["boss", "oryx", "lord", "king", "queen", "guardian", "curse"]);
  const drops = extractListByKeywords($, ["drop", "loot", "reward", "bag", "mark", "treasure"]);
  const locations = extractLocations($);
  const difficulty = extractDifficulty($);
  const realmPortal = extractRealmPortal($);
  const dungeonData = buildDungeonData(link, pageTitle, imageUrl, description, bosses, drops, locations, difficulty, realmPortal);
  if (imageUrl) {
    const localImagePath = path.join(DUNGEON_IMAGES_DIR, `${dungeonData.slug}.png`);
    await downloadImage(imageUrl, localImagePath);
  }
  writeDungeonFile(dungeonData);
  return dungeonData;
}

async function main() {
  const debug = process.argv.includes("--debug");
  console.log(`Fetching dungeon index: ${SOURCE_URL}`);
  const html = await fetchPage(SOURCE_URL);
  const $ = cheerio.load(html);
  const candidates = collectDungeonLinks($);
  writeJson(path.join("debug", "dungeon-candidates.json"), candidates);
  const rejectedNames = new Set([
    "contents",
    "table of contents",
    "realm dungeons",
    "realm event dungeons",
    "advanced dungeons",
    "oryx's castle",
    "wormholes",
    "heroic dungeons",
    "special event dungeons",
    "other dungeons",
    "history"
  ]);
  const rejected = candidates.filter((candidate) => rejectedNames.has(candidate.name.toLowerCase()));
  writeJson(path.join("debug", "dungeon-rejected.json"), rejected);
  const selected = candidates.slice(0, batch);
  const imported = [];
  for (const link of selected) {
    try {
      const dungeon = await importDungeon(link, debug);
      imported.push(dungeon);
      console.log(`Imported dungeon: ${dungeon.name}`);
    } catch (error) {
      console.log(`Failed dungeon: ${link.name}`);
    }
  }
  const allDungeons = buildDungeonIndex();
  writeJson(path.join("debug", "dungeon-validation-report.json"), allDungeons.map((dungeon) => ({
    name: dungeon.name,
    slug: dungeon.slug,
    hasSprite: Boolean(dungeon.sprite),
    hasDescription: Boolean(dungeon.description),
    hasLocations: Array.isArray(dungeon.location) && dungeon.location.length > 0,
    hasDifficulty: Boolean(dungeon.difficulty),
    hasBosses: Array.isArray(dungeon.bosses) && dungeon.bosses.length > 0,
    hasDrops: Array.isArray(dungeon.drops) && dungeon.drops.length > 0,
    sourceUrl: dungeon.sourceUrl,
    needsReview: dungeon.needsReview,
    issues: dungeon.issues || []
  })));
  console.log(`Dungeon import complete. Imported ${imported.length} of ${selected.length}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
