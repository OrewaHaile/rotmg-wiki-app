import fs from "fs";
import path from "path";

const CLASS_SKINS_JSON = path.join("src", "data", "class-skins.json");
const ALL_ITEMS_JSON = path.join("src", "data", "all-items.json");
const REPORT_JSON = path.join("debug", "class-skins-validation-report.json");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Failed to read ${filePath}: ${error.message}`);
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

function isMissing(value) {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

function getBlockedNames(itemNames) {
  return new Set([
    "realm gold",
    "gold",
    "fame",
    "reinforced root armor",
    "akuma's tear",
    "akumas tear",
    "mystery box",
    "crystal of fortune",
    "crystals of fortune",
    "crystal of extreme fortune",
    "vault",
    "event chest",
    "supply drop",
    "treasure chest",
    "pet skin",
    "pet skin",
    "tinkerer",
    "login seer",
    "feed power",
    "feed powers",
    "skin token",
    "skin tokens",
    "character skin",
    "soulbound",
    "armor",
    "weapon",
    "ring",
    "ability",
    "backpack",
    "mystery dye",
    "golden skull",
    "mystery dye"
  ].concat([...itemNames]));
}

function validateSkin(skin, blockedNames, itemSlugs) {
  const issues = [];
  const name = normalizeString(skin.name);
  const lowerName = name.toLowerCase();
  const slug = normalizeString(skin.slug);
  const className = normalizeString(skin.class);
  const sprite = normalizeString(skin.sprite);
  const description = normalizeString(skin.description);
  const howToAcquire = normalizeString(skin.howToAcquire);
  const feedPower = normalizeString(skin.feedPower);
  const sourceUrl = normalizeString(skin.sourceUrl);
  const notes = Array.isArray(skin.notes) ? skin.notes : [];

  if (!name) issues.push("Missing name");
  if (!slug) issues.push("Missing slug");
  if (!className) issues.push("Missing class");
  if (!sprite) issues.push("Missing sprite");
  if (!Array.isArray(skin.notes)) issues.push("Notes must be an array");

  if (lowerName && blockedNames.has(lowerName)) {
    issues.push("Name matches a blocked item or currency name");
  }

  if (slug && itemSlugs.has(slug)) {
    issues.push("Slug matches an item slug from all-items.json");
  }

  const missingItemName = skin?.name && blockedNames.has(lowerName);
  const obviousFalsePositive = missingItemName || itemSlugs.has(slug);

  return {
    name,
    class: className,
    slug,
    hasSprite: Boolean(sprite),
    hasDescription: Boolean(description),
    hasHowToAcquire: Boolean(howToAcquire),
    hasFeedPower: Boolean(feedPower),
    sourceUrl,
    needsReview: issues.length > 0,
    removed: obviousFalsePositive,
    issues,
    sprite,
    description,
    howToAcquire,
    feedPower,
    notes,
    original: skin
  };
}

function main() {
  const skins = Array.isArray(readJson(CLASS_SKINS_JSON)) ? readJson(CLASS_SKINS_JSON) : [];
  const allItems = Array.isArray(readJson(ALL_ITEMS_JSON)) ? readJson(ALL_ITEMS_JSON) : [];

  const itemNames = new Set(
    allItems
      .map((item) => normalizeString(item?.name).toLowerCase())
      .filter(Boolean)
  );

  const itemSlugs = new Set(
    allItems
      .map((item) => normalizeString(item?.slug).toLowerCase())
      .filter(Boolean)
  );

  const blockedNames = getBlockedNames(itemNames);
  const report = [];
  const updatedSkins = [];
  let removedCount = 0;
  let reviewCount = 0;

  for (const rawSkin of skins) {
    if (!rawSkin || typeof rawSkin !== "object") continue;

    const validation = validateSkin(rawSkin, blockedNames, itemSlugs);

    report.push({
      name: validation.name,
      class: validation.class,
      slug: validation.slug,
      hasSprite: validation.hasSprite,
      hasDescription: validation.hasDescription,
      hasHowToAcquire: validation.hasHowToAcquire,
      hasFeedPower: validation.hasFeedPower,
      sourceUrl: normalizeString(rawSkin.sourceUrl),
      needsReview: validation.needsReview,
      issues: validation.issues
    });

    if (validation.removed) {
      removedCount += 1;
      continue;
    }

    const outputSkin = {
      ...rawSkin,
      id: validation.slug || rawSkin.id,
      name: validation.name || rawSkin.name,
      slug: validation.slug || rawSkin.slug,
      class: validation.class || rawSkin.class,
      sprite: validation.sprite || rawSkin.sprite || "",
      rarity: normalizeString(rawSkin.rarity),
      description: rawSkin.description || "",
      howToAcquire: rawSkin.howToAcquire || "",
      feedPower: rawSkin.feedPower || "",
      sourceUrl: normalizeString(rawSkin.sourceUrl),
      notes: Array.isArray(rawSkin.notes) ? rawSkin.notes : [],
      needsReview: validation.needsReview
    };

    if (validation.needsReview) reviewCount += 1;
    updatedSkins.push(outputSkin);
  }

  writeJson(CLASS_SKINS_JSON, updatedSkins);
  writeJson(REPORT_JSON, report);

  console.log(`Class skins validated: ${updatedSkins.length}`);
  console.log(`Needs review: ${reviewCount}`);
  console.log(`Removed obvious false positives: ${removedCount}`);
  console.log(`Report written to ${REPORT_JSON}`);
}

main();
