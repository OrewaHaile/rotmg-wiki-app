import fs from "fs";
import path from "path";

const ST_SETS_JSON = path.join("src", "data", "st-sets.json");
const ALL_ITEMS_JSON = path.join("src", "data", "all-items.json");
const REPORT_JSON = path.join("debug", "st-set-validation-report.json");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error.message);
    process.exit(1);
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isMissingField(item, field) {
  const value = item[field];
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

function validateSet(set, validSlugs) {
  const items = Array.isArray(set.items) ? set.items : [];
  const itemCount = items.length;
  const missingItemSlugs = [];
  const missingSprites = [];
  const issues = [];

  if (itemCount !== 4) {
    issues.push(`Item count is ${itemCount}, expected 4`);
  }

  for (const item of items) {
    if (isMissingField(item, "name")) {
      issues.push(`Item ${item.slug || item.name || "unknown"} is missing name`);
    }
    if (isMissingField(item, "slug")) {
      issues.push(`Item ${item.name || "unknown"} is missing slug`);
    }
    if (isMissingField(item, "sprite")) {
      missingSprites.push(item.slug || item.name || "unknown");
      issues.push(`Item ${item.slug || item.name || "unknown"} is missing sprite`);
    }
    if (isMissingField(item, "itemType")) {
      issues.push(`Item ${item.slug || item.name || "unknown"} is missing itemType`);
    }
    if (isMissingField(item, "tier")) {
      issues.push(`Item ${item.slug || item.name || "unknown"} is missing tier`);
    }
    if (isMissingField(item, "category")) {
      issues.push(`Item ${item.slug || item.name || "unknown"} is missing category`);
    }
    const slug = normalizeString(item.slug);
    if (slug && !validSlugs.has(slug)) {
      missingItemSlugs.push(slug);
      issues.push(`Item slug ${slug} not found in all-items.json`);
    }
  }

  const needsReview = itemCount !== 4 || missingItemSlugs.length > 0 || missingSprites.length > 0 || issues.length > 0;

  return {
    name: normalizeString(set.name) || set.id || "Unknown set",
    class: normalizeString(set.class) || "Unknown",
    itemCount,
    missingItemSlugs,
    missingSprites,
    hasOutfitSprite: Boolean(normalizeString(set.outfitSprite)),
    needsReview,
    issues,
  };
}

function main() {
  const allItems = Array.isArray(readJson(ALL_ITEMS_JSON)) ? readJson(ALL_ITEMS_JSON) : [];
  const stSets = Array.isArray(readJson(ST_SETS_JSON)) ? readJson(ST_SETS_JSON) : [];

  const validSlugs = new Set(allItems.map((item) => item?.slug).filter((slug) => typeof slug === "string"));
  const report = [];
  let updated = false;

  const normalizedSets = stSets.map((set) => {
    if (!set || typeof set !== "object" || set.id === "example-st-set") {
      return set;
    }

    const validation = validateSet(set, validSlugs);
    const needsReview = validation.needsReview;
    const currentNeedsReview = Boolean(set.needsReview);

    if (currentNeedsReview !== needsReview) {
      updated = true;
    }

    report.push({
      setName: validation.name,
      class: validation.class,
      itemCount: validation.itemCount,
      missingItemSlugs: validation.missingItemSlugs,
      missingSprites: validation.missingSprites,
      hasOutfitSprite: validation.hasOutfitSprite,
      needsReview,
      issues: validation.issues,
    });

    return {
      ...set,
      needsReview,
    };
  });

  if (updated) {
    writeJson(ST_SETS_JSON, normalizedSets);
    console.log(`Updated ${ST_SETS_JSON} with needsReview flags.`);
  } else if (!report.length) {
    console.log(`No valid ST set entries found to report.`);
  } else {
    console.log(`ST set data is already current; writing report only.`);
  }

  writeJson(REPORT_JSON, report);
  console.log(`Wrote validation report to ${REPORT_JSON}. Total sets: ${report.length}`);
}

main();
