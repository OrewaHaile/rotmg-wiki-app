import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.realmeye.com";
const SOURCE_URL = "https://www.realmeye.com/wiki/set-tier-items";

const SETS_JSON = "src/data/st-sets.json";
const SETS_IMG_DIR = "public/sets";
const ITEMS_JSON = "src/data/all-items.json";

fs.mkdirSync(SETS_IMG_DIR, { recursive: true });
fs.mkdirSync("debug", { recursive: true });

function getArg(name, fallback = null) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

const batch = Number(getArg("--batch", "999"));
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

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function isSTItem(item) {
  const tier = String(item?.tier || "").toUpperCase();
  const type = String(item?.itemType || "").toLowerCase();

  return tier.includes("ST") || type.includes("set tier");
}

const allItems = Array.isArray(readJson(ITEMS_JSON)) ? readJson(ITEMS_JSON) : [];
const itemBySlug = new Map();
const stItemsBySlug = new Map();

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

function getImageFromCell($, cell) {
  const $img = $(cell).find("img").first();

  if (!$img.length) return null;

  const src =
    $img.attr("src") ||
    $img.attr("data-src") ||
    $img.attr("data-original") ||
    "";

  return {
    src: absoluteUrl(src),
    alt: cleanText($img.attr("alt") || ""),
    title: cleanText($img.attr("title") || ""),
  };
}

function collectSetLinksFromIndex($) {
  const candidates = [];

  $("table").eq(1).find("tr").each((rowIndex, row) => {
    const cells = $(row).find("td, th").toArray();

    if (cells.length < 2) return;

    const classImage = getImageFromCell($, cells[0]);
    const className =
      classImage?.title ||
      classImage?.alt ||
      cleanText($(cells[0]).text()) ||
      "Unknown";

    for (let i = 1; i < cells.length; i++) {
      const cell = cells[i];

      const $setLink = $(cell)
        .find("a[href^='/wiki/']")
        .filter((_, a) => {
          const href = $(a).attr("href") || "";
          return href.endsWith("-set");
        })
        .first();

      if (!$setLink.length) continue;

      const href = $setLink.attr("href") || "";
      const image = getImageFromCell($, cell);

      const imageName = image?.title || image?.alt || "";
      const slug = href.split("/").pop() || "";
      const name = imageName || slug.replace(/-/g, " ");

      candidates.push({
        name: cleanText(name),
        slug,
        class: cleanText(className),
        sourceUrl: absoluteUrl(href),
        outfitImageUrl: image?.src || "",
        rowIndex,
        cellIndex: i,
      });
    }
  });

  const unique = new Map();

  for (const candidate of candidates) {
    if (!candidate.slug) continue;
    unique.set(candidate.slug, candidate);
  }

  return [...unique.values()];
}

function collectSTItemsFromSetPage($) {
  const found = new Map();

  $("a[href^='/wiki/']").each((_, anchor) => {
    const href = $(anchor).attr("href") || "";
    const slug = href.split("/").pop() || "";

    const item = stItemsBySlug.get(slug);

    if (!item) return;

    found.set(item.slug, makeSetItem(item));
  });

  return [...found.values()];
}

function extractDescription($) {
  const paragraphs = [];

  $("p").each((_, p) => {
    const text = cleanText($(p).text());
    if (text.length > 40) paragraphs.push(text);
  });

  return paragraphs[0] || "";
}

function extractBonuses($) {
  const bonuses = new Set();

  $("tr, li, p").each((_, element) => {
    const text = cleanText($(element).text());
    const lower = text.toLowerCase();

    if (text.length < 5 || text.length > 220) return;

    const looksLikeBonus =
      lower.includes("bonus") ||
      lower.includes("pieces") ||
      lower.includes("piece") ||
      /^\d\s/.test(lower) ||
      lower.includes("+");

    if (looksLikeBonus) {
      bonuses.add(text);
    }
  });

  return [...bonuses].slice(0, 20);
}

async function importSet(candidate) {
  const html = await fetchPage(candidate.sourceUrl);
  const $ = cheerio.load(html);

  const title = cleanText($("h1").first().text());
  const name = title || candidate.name;
  const slug = candidate.slug || slugify(name);

  const items = collectSTItemsFromSetPage($);
  const bonuses = extractBonuses($);
  const description = extractDescription($);

  const set = {
    id: slug,
    name,
    slug,
    category: "sets",
    setType: "ST",
    class: candidate.class || "Unknown",
    outfitSprite: "",
    sourceUrl: candidate.sourceUrl,
    description,
    items,
    bonuses,
    notes: [],
  };

  let reason = "";

  const uniqueItemSlugs = new Set(items.map((item) => item.slug));

  if (items.length !== uniqueItemSlugs.size) {
    reason = "duplicate item slugs";
  } else if (items.length !== 4) {
    reason = `expected 4 ST items, found ${items.length}`;
  }

  if (reason) {
    return {
      accepted: false,
      reason,
      set,
      candidate,
    };
  }

  if (candidate.outfitImageUrl) {
    const imagePath = path.join(SETS_IMG_DIR, `${slug}.png`);
    const ok = await downloadImage(candidate.outfitImageUrl, imagePath);

    if (ok) {
      set.outfitSprite = `/sets/${slug}.png`;
    }
  }

  return {
    accepted: true,
    reason: "accepted",
    set,
    candidate,
  };
}

async function main() {
  console.log(`ST items in database: ${stItemsBySlug.size}`);
  console.log(`Fetching ST sets source: ${SOURCE_URL}`);

  const html = await fetchPage(SOURCE_URL);

  fs.writeFileSync("debug/set-tier-items.html", html);

  const $ = cheerio.load(html);

  const candidates = collectSetLinksFromIndex($).slice(0, batch);

  console.log(`Set candidates from index table: ${candidates.length}`);

  if (debug) {
    fs.writeFileSync(
      "debug/st-set-index-candidates.json",
      JSON.stringify(candidates, null, 2)
    );
  }

  const accepted = [];
  const rejected = [];

  for (const candidate of candidates) {
    try {
      const result = await importSet(candidate);

      const itemNames = result.set.items.map((item) => item.name);

      const debugEntry = {
        name: result.set.name,
        slug: result.set.slug,
        class: result.set.class,
        sourceUrl: result.set.sourceUrl,
        outfitSprite: result.set.outfitSprite,
        itemCount: result.set.items.length,
        itemNames,
        reason: result.reason,
      };

      if (result.accepted) {
        accepted.push(result.set);
        console.log(`Accepted: ${result.set.name} | ${result.set.class} | ${result.set.items.length} items`);
      } else {
        rejected.push(debugEntry);
        console.log(`Rejected: ${result.set.name} | ${result.reason}`);
      }
    } catch (error) {
      rejected.push({
        name: candidate.name,
        slug: candidate.slug,
        class: candidate.class,
        sourceUrl: candidate.sourceUrl,
        itemCount: 0,
        itemNames: [],
        reason: "failed to import page",
      });

      console.log(`Failed: ${candidate.name}`);
    }
  }

  accepted.sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(SETS_JSON, JSON.stringify(accepted, null, 2));
  fs.writeFileSync("debug/st-set-candidates.json", JSON.stringify(accepted, null, 2));
  fs.writeFileSync("debug/st-set-rejected.json", JSON.stringify(rejected, null, 2));

  console.log("");
  console.log(`Accepted sets: ${accepted.length}`);
  console.log(`Rejected candidates: ${rejected.length}`);
  console.log(`Saved: ${SETS_JSON}`);
  console.log(`Debug accepted: debug/st-set-candidates.json`);
  console.log(`Debug rejected: debug/st-set-rejected.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
