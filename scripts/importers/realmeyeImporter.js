/**
 * RealmEye Category Importer
 *
 * Usage:
 *   node scripts/importers/realmeyeImporter.js --url /wiki/daggers
 *   node scripts/importers/realmeyeImporter.js --batch 20
 *   node scripts/importers/realmeyeImporter.js --all
 *   node scripts/importers/realmeyeImporter.js --reset
 *
 * Progress is saved to scripts/importers/progress.json so repeated runs continue
 * from where they left off.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { parseCategoryLinks, parseItemPage } from "../../src/utils/parser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const SPRITES_DIR = path.join(ROOT, "public", "items");
const PROGRESS_FILE = path.join(__dirname, "progress.json");

const BASE_URL = "https://www.realmeye.com";
const DELAY_MS = 1200;
const MAX_RETRIES = 3;
const FIRST_RUN_LIMIT = 5;

const args = process.argv.slice(2);
const argVal = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const CATEGORY_PATH = argVal("--url") ?? "/wiki/daggers";
const CATEGORY_URL = BASE_URL + CATEGORY_PATH;
const BATCH_SIZE = argVal("--batch") ? parseInt(argVal("--batch"), 10) : FIRST_RUN_LIMIT;
const IMPORT_ALL = hasFlag("--all");
const RESET = hasFlag("--reset");

function log(msg) {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`[${ts}] ${msg}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; RotMGWikiBot/1.0; fan project)",
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

async function downloadSprite(spriteUrl, slug, attempt = 1) {
  const dest = path.join(SPRITES_DIR, `${slug}.png`);

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

function loadProgress() {
  if (RESET || !fs.existsSync(PROGRESS_FILE)) {
    return { categoryUrl: "", urls: [], nextIndex: 0, imported: [], skipped: [] };
  }
  try {
    const saved = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
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

const DATA_DIR = path.join(ROOT, "src", "data");
const INVALID_DIR = path.join(DATA_DIR, "invalid");
const INDEX_FILE = path.join(DATA_DIR, "index.json");
const REPORT_FILE = path.join(DATA_DIR, "import-report.json");

function normalizeCategoryName(categoryPath) {
  return categoryPath.replace(/^\/wiki\//, "").replace(/\/$/, "");
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function listJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath).filter((file) => file.endsWith(".json"));
}

function loadExistingSlugs() {
  const slugs = new Set();
  if (!fs.existsSync(DATA_DIR)) return slugs;

  for (const child of fs.readdirSync(DATA_DIR, { withFileTypes: true })) {
    if (!child.isDirectory()) continue;
    const dirPath = path.join(DATA_DIR, child.name);
    for (const file of listJsonFiles(dirPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dirPath, file), "utf-8"));
        if (data && data.slug) slugs.add(data.slug);
      } catch {
        // ignore invalid files
      }
    }
  }

  const legacyItemsPath = path.join(DATA_DIR, "items");
  if (fs.existsSync(legacyItemsPath)) {
    for (const file of listJsonFiles(legacyItemsPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(legacyItemsPath, file), "utf-8"));
        if (data && data.slug) slugs.add(data.slug);
      } catch {
        // ignore invalid files
      }
    }
  }

  return slugs;
}

function buildGlobalIndex() {
  const knownCategories = ["daggers", "swords", "bows", "wands", "staves", "katanas", "spellblades"];
  const index = { total: 0, categories: {}, items: [] };

  if (!fs.existsSync(DATA_DIR)) {
    for (const category of knownCategories) {
      index.categories[category] = 0;
    }
    return index;
  }

  for (const child of fs.readdirSync(DATA_DIR, { withFileTypes: true })) {
    if (!child.isDirectory()) continue;
    const category = child.name;
    if (category === "invalid") continue;
    const folder = path.join(DATA_DIR, category);
    const files = listJsonFiles(folder);
    if (files.length > 0) {
      index.categories[category] = files.length;
    }
    for (const fileName of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(folder, fileName), "utf-8"));
        if (!data || !data.slug) continue;
        index.items.push({
          id: data.slug,
          name: data.name,
          slug: data.slug,
          category,
          itemType: data.itemType,
          tier: data.tier,
          path: `${category}/${fileName}`,
        });
      } catch {
        // ignore invalid json
      }
    }
  }

  for (const category of knownCategories) {
    if (!Object.prototype.hasOwnProperty.call(index.categories, category)) {
      index.categories[category] = 0;
    }
  }

  index.total = index.items.length;
  return index;
}

function saveGlobalIndex() {
  const index = buildGlobalIndex();
  ensureDirectory(DATA_DIR);
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

function buildImportReport(duplicateCount, invalidCount) {
  const categories = {};
  let totalImported = 0;
  const reportCategories = ["daggers", "swords", "bows", "wands", "staves", "katanas", "spellblades"];

  for (const category of reportCategories) {
    const folder = path.join(DATA_DIR, category);
    const count = fs.existsSync(folder) ? listJsonFiles(folder).length : 0;
    categories[category] = count;
    totalImported += count;
  }

  const report = { totalImported, duplicates: duplicateCount, invalid: invalidCount, categories };
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  return report;
}

function normalizeItem(item, categoryPath) {
  const defaults = CATEGORY_DEFAULTS[categoryPath] ?? {};

  const feedPower = item.feedPower == null ? null : isNaN(Number(item.feedPower)) ? null : Number(item.feedPower);
  const fameBonus = item.fameBonus == null || item.fameBonus === "Unknown" ? null : item.fameBonus;
  const cleanArray = (arr) =>
    Array.isArray(arr) ? arr.filter((v) => v && v !== "Unknown" && String(v).trim() !== "") : [];

  const usableClasses = cleanArray(item.usableClasses).length > 0 ? cleanArray(item.usableClasses) : defaults.usableClasses ?? [];
  const itemType = item.itemType && item.itemType !== "Unknown" ? item.itemType : defaults.itemType ?? "Unknown";

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

const CATEGORY_DEFAULTS = {
  "/wiki/daggers": { itemType: "Dagger", usableClasses: ["Rogue", "Assassin", "Trickster"] },
  "/wiki/swords": { itemType: "Sword", usableClasses: ["Warrior", "Knight", "Paladin"] },
  "/wiki/bows": { itemType: "Bow", usableClasses: ["Archer", "Huntress", "Bard"] },
  "/wiki/wands": { itemType: "Wand", usableClasses: ["Priest", "Sorcerer", "Summoner"] },
  "/wiki/staves": { itemType: "Staff", usableClasses: ["Wizard", "Mystic", "Necromancer"] },
  "/wiki/katanas": { itemType: "Katana", usableClasses: ["Samurai", "Ninja", "Kensei"] },
  "/wiki/spellblades": { itemType: "Spellblade", usableClasses: ["Sorcerer"] },
  "/wiki/robes": { itemType: "Robe", usableClasses: ["Wizard", "Priest", "Necromancer", "Mystic", "Sorcerer", "Summoner"] },
  "/wiki/leather-armors": { itemType: "Leather Armor", usableClasses: ["Rogue", "Archer", "Assassin", "Huntress", "Trickster", "Ninja", "Bard"] },
  "/wiki/heavy-armors": { itemType: "Heavy Armor", usableClasses: ["Warrior", "Knight", "Paladin", "Samurai", "Kensei"] },
  "/wiki/rings": { itemType: "Ring", usableClasses: [] },
};

function validateItem(item) {
  const issues = [];
  if (!item.name || item.name === "Unknown") issues.push("missing name");
  if (!item.sprite || item.sprite === "Unknown" || !item.sprite.startsWith("/items/")) issues.push("missing sprite");
  if (!item.itemType || item.itemType === "Unknown") issues.push("invalid item type");
  if (!item.tier || item.tier === "Unknown") issues.push("invalid tier");
  if (!item.stats || item.stats.damage == null) issues.push("invalid stats: damage");
  if (["Wand", "Staff"].includes(item.itemType)) {
    if (item.stats.shots == null) issues.push("invalid stats: shots");
    if (item.stats.rateOfFire == null) issues.push("invalid stats: rate of fire");
    if (item.stats.range == null) issues.push("invalid stats: range");
  }
  return [...new Set(issues)];
}

function saveItem(item, categoryName) {
  const categoryDir = path.join(DATA_DIR, categoryName);
  ensureDirectory(categoryDir);
  const file = path.join(categoryDir, `${item.slug}.json`);
  fs.writeFileSync(file, JSON.stringify(item, null, 2));
}

function saveInvalidItem(item, categoryName, issues) {
  ensureDirectory(INVALID_DIR);
  const invalidItem = {
    ...item,
    category: categoryName,
    invalidReasons: issues,
    importedAt: new Date().toISOString(),
  };
  const file = path.join(INVALID_DIR, `${item.slug}.json`);
  fs.writeFileSync(file, JSON.stringify(invalidItem, null, 2));
}

const CATEGORY_NAME = normalizeCategoryName(CATEGORY_PATH);

async function main() {
  ensureDirectory(DATA_DIR);
  ensureDirectory(INVALID_DIR);

  const existingSlugs = loadExistingSlugs();
  let duplicateCount = 0;
  let invalidCount = 0;

  let state = loadProgress();
  state.categoryUrl = CATEGORY_URL;

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
    saveGlobalIndex();
    buildImportReport(duplicateCount, invalidCount);
    return;
  }

  const batchEnd = IMPORT_ALL ? total : Math.min(start + BATCH_SIZE, total);
  log(`Importing items ${start + 1}–${batchEnd} of ${total}`);
  log("─".repeat(55));

  for (let i = start; i < batchEnd; i++) {
    const url = state.urls[i];
    const position = `${i + 1}/${total}`;

    let html;
    try {
      html = await fetchHtml(url);
    } catch (err) {
      log(`  ✗ [${position}] Fetch failed: ${url}\n        ${err.message}`);
      state.skipped.push({ url, reason: err.message });
      state.nextIndex = i + 1;
      saveProgress(state);
      await sleep(DELAY_MS);
      continue;
    }

    let parsed;
    try {
      parsed = parseItemPage(html, url);
    } catch (err) {
      log(`  ↩ [${position}] Skipped (not an item page): ${url.split("/wiki/")[1]}`);
      state.skipped.push({ url, reason: err.message });
      state.nextIndex = i + 1;
      saveProgress(state);
      await sleep(DELAY_MS);
      continue;
    }

    if (existingSlugs.has(parsed.slug)) {
      log(`  ↩ [${position}] Duplicate slug skipped: ${parsed.slug}`);
      duplicateCount += 1;
      state.skipped.push({ url, slug: parsed.slug, reason: "duplicate" });
      state.nextIndex = i + 1;
      saveProgress(state);
      continue;
    }

    if (parsed.spriteDownloadUrl && parsed.spriteDownloadUrl !== "Unknown") {
      log(`Downloading sprite: ${parsed.name}`);
      const localPath = await downloadSprite(parsed.spriteDownloadUrl, parsed.slug);
      parsed.sprite = localPath;
    }

    const normalized = normalizeItem(parsed, CATEGORY_PATH);
    const validationErrors = validateItem(normalized);

    if (validationErrors.length > 0) {
      log(`  ✗ [${position}] Invalid item: ${normalized.name} (${validationErrors.join(", ")})`);
      saveInvalidItem(normalized, CATEGORY_NAME, validationErrors);
      existingSlugs.add(parsed.slug);
      invalidCount += 1;
      state.skipped.push({ url, slug: parsed.slug, reason: validationErrors.join("; ") });
      state.nextIndex = i + 1;
      saveProgress(state);
      await sleep(400);
      continue;
    }

    saveItem(normalized, CATEGORY_NAME);
    existingSlugs.add(parsed.slug);
    log(`Imported ${position}: ${normalized.name} (${normalized.itemType}, ${normalized.tier})`);

    state.imported.push(parsed.slug);
    state.nextIndex = i + 1;
    saveProgress(state);

    if (i < batchEnd - 1) await sleep(DELAY_MS);
  }

  log("─".repeat(55));

  saveGlobalIndex();
  const report = buildImportReport(duplicateCount, invalidCount);

  if (state.nextIndex >= total) {
    log(`✓ Complete! ${state.imported.length} imported, ${state.skipped.length} skipped.`);
  } else {
    const remaining = total - state.nextIndex;
    log(`Batch done. ${remaining} items remaining.`);
    log(`Run again to import the next ${Math.min(BATCH_SIZE, remaining)}.`);
  }

  if (state.skipped.length > 0) {
    log(`\nSkipped (${state.skipped.length}):`);
    state.skipped.forEach(({ url, slug, reason }) =>
      log(`  - ${slug || url.split("/wiki/")[1]} → ${reason}`)
    );
  }

  log(`\nReport saved to ${REPORT_FILE}: ${JSON.stringify(report)}`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
