/**
 * RealmEye Category Importer
 *
 * Usage:
 *   node services/realmeyeImporter.js                        # import daggers, first 5
 *   node services/realmeyeImporter.js --url /wiki/daggers    # explicit category
 *   node services/realmeyeImporter.js --batch 20             # import 20 items
 *   node services/realmeyeImporter.js --all                  # import everything in category
 *   node services/realmeyeImporter.js --reset                # wipe progress and restart
 *
 * Progress is saved to services/progress.json so repeated runs continue
 * from where they left off.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import * as cheerio from "cheerio";
import { parseCategoryLinks, parseItemPage } from "../utils/parser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const ITEMS_DIR   = path.join(ROOT, "src", "data", "items");
const SPRITES_DIR = path.join(ROOT, "public", "items");
const PROGRESS_FILE = path.join(__dirname, "progress.json");

const BASE_URL      = "https://www.realmeye.com";
const DELAY_MS      = 1200;   // polite pause between requests
const MAX_RETRIES   = 3;
const FIRST_RUN_LIMIT = 5;    // limit for a fresh run (no progress file)

// ─── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const argVal = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const CATEGORY_PATH = argVal("--url") ?? "/wiki/daggers";
const CATEGORY_URL  = BASE_URL + CATEGORY_PATH;
const BATCH_SIZE    = argVal("--batch") ? parseInt(argVal("--batch"), 10) : FIRST_RUN_LIMIT;
const IMPORT_ALL    = hasFlag("--all");
const RESET         = hasFlag("--reset");

// ─── Logging ──────────────────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`[${ts}] ${msg}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── HTTP with retry ──────────────────────────────────────────────────────────

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; RotMGWikiBot/1.0; fan project)",
    Accept: "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

async function fetchHtml(url, attempt = 1) {
  try {
    const { data } = await http.get(url);
    return data;
  } catch (err) {
    if (attempt >= MAX_RETRIES) throw err;
    const wait = attempt * 2000;
    log(`  ⚠ Attempt ${attempt} failed (${err.message}). Retrying in ${wait / 1000}s…`);
    await sleep(wait);
    return fetchHtml(url, attempt + 1);
  }
}

/**
 * Download a binary sprite image and save to public/items/{slug}.png
 * Returns the local public path "/items/{slug}.png".
 */
async function downloadSprite(spriteUrl, slug, attempt = 1) {
  const dest = path.join(SPRITES_DIR, `${slug}.png`);

  // Skip if already downloaded
  if (fs.existsSync(dest)) {
    return `/items/${slug}.png`;
  }

  try {
    log(`  ↓ Downloading sprite: ${slug}`);
    const resp = await axios.get(spriteUrl, {
      responseType: "arraybuffer",
      timeout: 10_000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RotMGWikiBot/1.0)" },
    });
    fs.mkdirSync(SPRITES_DIR, { recursive: true });
    fs.writeFileSync(dest, Buffer.from(resp.data));
    return `/items/${slug}.png`;
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      log(`  ✗ Sprite download failed after ${MAX_RETRIES} attempts: ${err.message}`);
      return "Unknown";
    }
    const wait = attempt * 1500;
    log(`  ⚠ Sprite attempt ${attempt} failed. Retrying in ${wait / 1000}s…`);
    await sleep(wait);
    return downloadSprite(spriteUrl, slug, attempt + 1);
  }
}

// ─── Progress ─────────────────────────────────────────────────────────────────

function loadProgress() {
  if (RESET || !fs.existsSync(PROGRESS_FILE)) {
    return { categoryUrl: "", urls: [], nextIndex: 0, imported: [], skipped: [] };
  }
  try {
    const saved = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
    // If switching categories, reset
    if (saved.categoryUrl !== CATEGORY_URL) {
      log(`Category changed from ${saved.categoryUrl} → ${CATEGORY_URL}. Resetting progress.`);
      return { categoryUrl: CATEGORY_URL, urls: [], nextIndex: 0, imported: [], skipped: [] };
    }
    return saved;
  } catch {
    return { categoryUrl: CATEGORY_URL, urls: [], nextIndex: 0, imported: [], skipped: [] };
  }
}

function saveProgress(state) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(state, null, 2));
}

// ─── Normalization ────────────────────────────────────────────────────────────

const DAGGER_CLASSES = ["Rogue", "Assassin", "Trickster"];

const CATEGORY_DEFAULTS = {
  "/wiki/daggers": { itemType: "Dagger", usableClasses: ["Rogue", "Assassin", "Trickster"] },
  "/wiki/swords": { itemType: "Sword", usableClasses: ["Warrior", "Knight", "Paladin"] },
  "/wiki/bows": { itemType: "Bow", usableClasses: ["Archer", "Huntress", "Bard"] },
  "/wiki/staves": { itemType: "Staff", usableClasses: ["Wizard", "Necromancer", "Mystic"] },
  "/wiki/wands": { itemType: "Wand", usableClasses: ["Priest", "Sorcerer", "Summoner"] },
  "/wiki/katanas": { itemType: "Katana", usableClasses: ["Samurai", "Ninja", "Kensei"] },
  "/wiki/spellblades": { itemType: "Spellblade", usableClasses: ["Sorcerer"] },
  "/wiki/robes": { itemType: "Robe", usableClasses: ["Wizard", "Priest", "Necromancer", "Mystic", "Sorcerer", "Summoner"] },
  "/wiki/leather-armors": { itemType: "Leather Armor", usableClasses: ["Rogue", "Archer", "Assassin", "Huntress", "Trickster", "Ninja", "Bard"] },
  "/wiki/heavy-armors": { itemType: "Heavy Armor", usableClasses: ["Warrior", "Knight", "Paladin", "Samurai", "Kensei"] },
  "/wiki/rings": { itemType: "Ring", usableClasses: [] },
};

/**
 * Apply output-format rules after parsing:
 *  - id = slug (string)
 *  - feedPower → integer or null
 *  - fameBonus → null when missing
 *  - empty arrays instead of ["Unknown"] / ""
 *  - category-specific class defaults
 */
function normalizeItem(item, categoryPath) {
  const defaults = CATEGORY_DEFAULTS[categoryPath] ?? {};

  const feedPower =
    item.feedPower == null
      ? null
      : isNaN(Number(item.feedPower))
      ? null
      : Number(item.feedPower);

  const fameBonus = item.fameBonus == null || item.fameBonus === "Unknown" ? null : item.fameBonus;

  const cleanArray = (arr) => Array.isArray(arr)
    ? arr.filter((v) => v && v !== "Unknown" && String(v).trim() !== "")
    : [];

  const usableClasses =
    cleanArray(item.usableClasses).length > 0
      ? cleanArray(item.usableClasses)
      : (defaults.usableClasses ?? []);

  const itemType = item.itemType && item.itemType !== "Unknown"
    ? item.itemType
    : (defaults.itemType ?? "Unknown");

  return {
    id: item.slug,
    name: item.name,
    slug: item.slug,
    sprite: item.sprite,
    itemType,
    tier: item.tier,
    bagType: item.bagType,
    soulbound: item.soulbound,
    fameBonus,
    feedPower,
    description: item.description,
    stats: item.stats,
    effects: cleanArray(item.effects),
    usableClasses,
    dropsFrom: cleanArray(item.dropsFrom),
    notes: cleanArray(item.notes),
    sourceUrl: item.sourceUrl,
  };
}

// ─── Item I/O ─────────────────────────────────────────────────────────────────

function saveItem(item) {
  fs.mkdirSync(ITEMS_DIR, { recursive: true });
  const file = path.join(ITEMS_DIR, `${item.slug}.json`);
  fs.writeFileSync(file, JSON.stringify(item, null, 2));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  let state = loadProgress();
  state.categoryUrl = CATEGORY_URL;

  // Step 1: collect item URLs from category page
  if (state.urls.length === 0) {
    log(`Fetching category page: ${CATEGORY_URL}`);
    let html;
    try {
      html = await fetchHtml(CATEGORY_URL);
    } catch (err) {
      log(`✗ Could not load category page: ${err.message}`);
      process.exit(1);
    }

    state.urls = parseCategoryLinks(html);
    state.nextIndex = 0;
    state.imported = [];
    state.skipped = [];
    saveProgress(state);

    const cat = CATEGORY_PATH.replace("/wiki/", "");
    log(`Found ${state.urls.length} ${cat}`);
  }

  const total = state.urls.length;
  const start = state.nextIndex;

  if (start >= total) {
    log(`✓ All ${total} items already processed (${state.imported.length} imported, ${state.skipped.length} skipped).`);
    log(`  Run with --reset to start over.`);
    return;
  }

  const batchEnd = IMPORT_ALL ? total : Math.min(start + BATCH_SIZE, total);
  log(`Importing items ${start + 1}–${batchEnd} of ${total}`);
  log("─".repeat(55));

  for (let i = start; i < batchEnd; i++) {
    const url = state.urls[i];
    const position = `${i + 1}/${total}`;

    // Fetch item page
    let html;
    try {
      html = await fetchHtml(url);
    } catch (err) {
      log(`  ✗ [${position}] Fetch failed: ${url}\n        ${err.message}`);
      state.skipped.push({ url, error: err.message });
      state.nextIndex = i + 1;
      saveProgress(state);
      await sleep(DELAY_MS);
      continue;
    }

    // Parse item data
    let item;
    try {
      item = parseItemPage(html, url);
    } catch (err) {
      log(`  ↩ [${position}] Skipped (not an item page): ${url.split("/wiki/")[1]}`);
      state.skipped.push({ url, error: err.message });
      state.nextIndex = i + 1;
      saveProgress(state);
      await sleep(DELAY_MS);
      continue;
    }

    // Skip if already imported (unless --reset)
    const destFile = path.join(ITEMS_DIR, `${item.slug}.json`);
    if (fs.existsSync(destFile) && !RESET) {
      log(`  ↩ [${position}] Already exists: ${item.name}`);
      state.imported.push(item.slug);
      state.nextIndex = i + 1;
      saveProgress(state);
      await sleep(400);
      continue;
    }

    // Download sprite
    if (item.spriteDownloadUrl && item.spriteDownloadUrl !== "Unknown") {
      log(`Downloading sprite: ${item.name}`);
      const localPath = await downloadSprite(item.spriteDownloadUrl, item.slug);
      item.sprite = localPath;
    }

    // Normalize and save
    const normalized = normalizeItem(item, CATEGORY_PATH);
    saveItem(normalized);
    log(`Imported ${position}: ${item.name} (${item.itemType}, ${item.tier})`);

    state.imported.push(item.slug);
    state.nextIndex = i + 1;
    saveProgress(state);

    if (i < batchEnd - 1) await sleep(DELAY_MS);
  }

  log("─".repeat(55));

  if (state.nextIndex >= total) {
    log(`✓ Complete! ${state.imported.length} imported, ${state.skipped.length} skipped.`);
  } else {
    const remaining = total - state.nextIndex;
    log(`Batch done. ${remaining} items remaining.`);
    log(`Run again to import the next ${Math.min(BATCH_SIZE, remaining)}.`);
  }

  if (state.skipped.length > 0) {
    log(`\nSkipped (${state.skipped.length}):`);
    state.skipped.forEach(({ url, error }) =>
      log(`  - ${url.split("/wiki/")[1]} → ${error}`)
    );
  }
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
