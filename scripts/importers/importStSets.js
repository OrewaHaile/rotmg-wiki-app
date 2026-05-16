import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.realmeye.com";
const DEFAULT_SOURCE_PATH = "/wiki/set-tier-items";
const SETS_JSON = "src/data/st-sets.json";
const SETS_IMG_DIR = "public/sets";
const ITEMS_JSON = "src/data/all-items.json";
const DEBUG_DIR = "debug";
const CANDIDATES_JSON = path.join(DEBUG_DIR, "st-set-candidates.json");
const REJECTED_JSON = path.join(DEBUG_DIR, "st-set-rejected.json");

fs.mkdirSync(SETS_IMG_DIR, { recursive: true });
fs.mkdirSync(DEBUG_DIR, { recursive: true });

function getArg(name, fallback = null) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

const sourcePath = getArg("--url", DEFAULT_SOURCE_PATH);
const batch = Number(getArg("--batch", "999"));
const SOURCE_URL = sourcePath.startsWith("http") ? sourcePath : `${BASE_URL}${sourcePath}`;

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
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  return response.data;
}

async function downloadImage(url, outputPath) {
  if (!url) return false;

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    fs.writeFileSync(outputPath, response.data);
    return true;
  } catch {
    return false;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

const allItems = Array.isArray(readJson(ITEMS_JSON)) ? readJson(ITEMS_JSON) : [];
const itemBySlug = new Map();
const stItemsBySlug = new Map();

function isSTItem(item) {
  const tier = String(item?.tier || "").toUpperCase();
  const type = String(item?.itemType || "").toLowerCase();
  const bag = String(item?.bagType || "").toLowerCase();
  if (tier.includes("ST")) return true;
  if (type.includes("set tier")) return true;
  if (bag.includes("orange") && tier.includes("ST")) return true;
  return false;
}

for (const item of allItems) {
  if (!item?.slug) continue;
  itemBySlug.set(item.slug, item);
  if (isSTItem(item)) {
    stItemsBySlug.set(item.slug, item);
  }
}

function makeSetItem(item) {
  return {
    name: item.name,
    slug: item.slug,
    sprite: item.sprite || item.spriteUrl || item.icon || `/items/${item.slug}.png`,
    itemType: item.itemType || "",
    tier: item.tier || "",
    category: item.category || "",
  };
}

function extractSlugFromHref(href) {
  if (!href) return "";
  return href.split("/").pop() || "";
}

function parseSetItemsFromTable($, table, setSlug) {
  const found = new Map();
  $(table)
    .find("a[href^='/wiki/']")
    .each((_, anchor) => {
      const href = $(anchor).attr("href") || "";
      const slug = extractSlugFromHref(href);
      if (!slug || slug === setSlug || slug === "set-tier-items") return;
      if (/^(rogue|archer|wizard|priest|warrior|knight|paladin|assassin|necromancer|huntress|mystic|trickster|sorcerer|ninja|samurai|bard|summoner|kensei|druid|character-skins|skins)$/i.test(slug)) return;
      const item = stItemsBySlug.get(slug);
      if (!item) return;
      found.set(item.slug, makeSetItem(item));
    });
  return [...found.values()];
}

function findBestSetTable($, setSlug, setName) {
  const candidates = [];
  $(".wiki-page table").each((_, table) => {
    const items = parseSetItemsFromTable($, table, setSlug);
    if (items.length === 4) {
      const text = cleanText($(table).text()).toLowerCase();
      const score = (text.includes(setName.toLowerCase()) ? 10 : 0) + items.length;
      candidates.push({ items, score });
    }
  });
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].items;
  }
  const fallbackFound = new Map();
  $(".wiki-page a[href^='/wiki/']").each((_, anchor) => {
    const href = $(anchor).attr("href") || "";
    const slug = extractSlugFromHref(href);
    if (!slug || slug === setSlug || slug === "set-tier-items") return;
    if (/^(rogue|archer|wizard|priest|warrior|knight|paladin|assassin|necromancer|huntress|mystic|trickster|sorcerer|ninja|samurai|bard|summoner|kensei|druid|character-skins|skins)$/i.test(slug)) return;
    const item = stItemsBySlug.get(slug);
    if (!item) return;
    fallbackFound.set(item.slug, makeSetItem(item));
  });
  const items = [...fallbackFound.values()];
  return items.length === 4 ? items : [];
}

function parseSetClass($) {
  let setClass = "Unknown";
  $(".wiki-page table").first().find("tr").each((_, row) => {
    const text = cleanText($(row).text());
    if (/Class/i.test(text)) {
      const match = text.match(/Class\s+([A-Za-z]+)/i);
      if (match) setClass = match[1];
    }
  });
  return setClass;
}

function findOutfitImage($, setName, slug) {
  const images = [];
  $(".wiki-page img").each((_, img) => {
    const $img = $(img);
    const src = $img.attr("src") || $img.attr("data-src") || $img.attr("data-original") || "";
    if (!src) return;
    const alt = cleanText($img.attr("alt") || "");
    const title = cleanText($img.attr("title") || "");
    const combined = `${alt} ${title} ${src}`.toLowerCase();
    let score = 0;
    if (combined.includes("skin")) score += 8;
    if (combined.includes("outfit")) score += 6;
    if (combined.includes("set")) score += 4;
    if (combined.includes(setName.toLowerCase())) score += 4;
    if (combined.includes(slug)) score += 4;
    if (src.toLowerCase().includes("skins")) score += 5;
    images.push({ url: absoluteUrl(src), score });
  });
  images.sort((a, b) => b.score - a.score);
  return images[0]?.score > 0 ? images[0].url : "";
}

function collectBonuses($) {
  const bonuses = new Set();
  $(".wiki-page table tr, .wiki-page p, .wiki-page li").each((_, element) => {
    const text = cleanText($(element).text());
    const lower = text.toLowerCase();
    if (
      text.length > 5 &&
      text.length < 220 &&
      (lower.includes("bonus") || lower.includes("piece") || lower.includes("overall") || lower.includes("subtotal") || lower.includes("transform") || lower.includes("def") || lower.includes("dex") || lower.includes("vit") || lower.includes("hp") || lower.includes("mp"))
    ) {
      bonuses.add(text);
    }
  });
  return [...bonuses].slice(0, 20);
}

async function parseSetPage(sourceUrl) {
  const html = await fetchPage(sourceUrl);
  const $ = cheerio.load(html);
  const name = cleanText($("h1").first().text()) || sourceUrl.split("/").pop() || "ST Set";
  const slug = slugify(name);
  const setClass = parseSetClass($);
  const items = findBestSetTable($, slug, name);
  const outfitImageUrl = findOutfitImage($, name, slug);
  const bonuses = collectBonuses($);
  return {
    id: slug,
    name,
    slug,
    category: "sets",
    setType: "ST",
    class: setClass,
    outfitSprite: "",
    outfitImageUrl,
    sourceUrl,
    description: "",
    items,
    bonuses,
    notes: ["Imported from RealmEye Set Tier Items."],
  };
}

function collectSTSetLinks($) {
  const setLinks = new Map();
  $("#d table tr").each((_, row) => {
    $(row)
      .find("a[href^='/wiki/']")
      .each((_, anchor) => {
        const href = $(anchor).attr("href") || "";
        const slug = extractSlugFromHref(href);
        if (!slug || !slug.includes("-set")) return;
        if (slug === "set-tier-items") return;
        const label = cleanText($(anchor).text());
        setLinks.set(slug, {
          slug,
          sourceUrl: absoluteUrl(href),
          label,
        });
      });
  });
  return [...setLinks.values()];
}

function validateSet(set) {
  const uniqueSlugCount = new Set(set.items.map((item) => item.slug)).size;
  if (uniqueSlugCount !== set.items.length) {
    return "Duplicate items found.";
  }
  if (set.items.length !== 4) {
    return `Expected 4 ST items, found ${set.items.length}.`;
  }
  const invalidItems = set.items.filter((item) => !item.slug || !stItemsBySlug.has(item.slug));
  if (invalidItems.length > 0) {
    return `Contains invalid ST item slugs: ${invalidItems.map((item) => item.slug || item.name).join(", ")}`;
  }
  return "";
}

async function saveOutfit(set) {
  if (!set.outfitImageUrl) {
    delete set.outfitImageUrl;
    return set;
  }
  const output = path.join(SETS_IMG_DIR, `${set.slug}.png`);
  const ok = await downloadImage(set.outfitImageUrl, output);
  if (ok) {
    set.outfitSprite = `/sets/${set.slug}.png`;
  }
  delete set.outfitImageUrl;
  return set;
}

async function main() {
  const html = await fetchPage(SOURCE_URL);
  const $ = cheerio.load(html);
  const links = collectSTSetLinks($);
  console.log(`Found ${links.length} candidate ST set pages from ${SOURCE_URL}`);
  const candidates = [];
  const rejected = [];
  const accepted = [];
  for (const candidate of links.slice(0, batch)) {
    try {
      const set = await parseSetPage(candidate.sourceUrl);
      const reason = validateSet(set);
      const entry = {
        name: set.name,
        slug: set.slug,
        sourceUrl: set.sourceUrl,
        class: set.class,
        itemCount: set.items.length,
        itemNames: set.items.map((item) => item.name),
        accepted: !reason,
        reason: reason || "Accepted",
      };
      candidates.push(entry);
      if (reason) {
        rejected.push(entry);
        continue;
      }
      const enriched = await saveOutfit(set);
      accepted.push(enriched);
    } catch (error) {
      rejected.push({
        name: candidate.label || candidate.slug,
        slug: candidate.slug,
        sourceUrl: candidate.sourceUrl,
        itemCount: 0,
        itemNames: [],
        accepted: false,
        reason: `Failed to parse page: ${error?.message || "Unknown error"}`,
      });
    }
  }
  writeJson(CANDIDATES_JSON, candidates);
  writeJson(REJECTED_JSON, rejected);
  writeJson(SETS_JSON, accepted);
  console.log(`Imported ${accepted.length} valid ST sets.`);
  console.log(`Saved debug files: ${CANDIDATES_JSON}, ${REJECTED_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
