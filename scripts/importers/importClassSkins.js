import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.realmeye.com";
const OUTPUT_JSON = "src/data/class-skins.json";
const SKINS_DIR = "public/skins";
const ITEMS_JSON = "src/data/all-items.json";

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

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

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

const allItems = Array.isArray(readJson(ITEMS_JSON)) ? readJson(ITEMS_JSON) : [];

const itemNames = new Set();
const itemSlugs = new Set();

for (const item of allItems) {
  if (item?.name) itemNames.add(String(item.name).toLowerCase());
  if (item?.slug) itemSlugs.add(String(item.slug).toLowerCase());
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

function isBlockedName(name) {
  const lower = name.toLowerCase();
  const slug = slugify(name);

  const blockedExact = [
    "eye",
    "realm gold",
    "gold",
    "fame",
    "feed power",
    "mystery box",
    "crystal of fortune",
    "crystals of fortune",
    "crystal of extreme fortune",
    "event chest",
    "vault",
    "tinkerer",
    "login seer",
    "reinforced root armor",
    "akuma's tear",
    "akumas tear",
    "pet skin",
    "armor",
    "weapon",
    "ring",
    "ability",
    "cloak",
    "dagger",
    "sword",
    "bow",
    "staff",
    "wand",
    "tomb",
    "dye"
  ];

  if (blockedExact.includes(lower)) return true;
  if (itemNames.has(lower)) return true;
  if (itemSlugs.has(slug)) return true;

  return false;
}

function previousHeadingText($, element) {
  let current = $(element).closest("table").prev();

  while (current.length) {
    const tag = current.get(0)?.tagName?.toLowerCase();

    if (["h1", "h2", "h3", "h4"].includes(tag)) {
      return cleanText(current.text());
    }

    current = current.prev();
  }

  return "";
}

function shouldAcceptSkinImage({ name, src, href, className, section }) {
  if (!name || !src) return false;

  const lowerName = name.toLowerCase();
  const lowerSrc = src.toLowerCase();
  const lowerHref = String(href || "").toLowerCase();
  const lowerSection = String(section || "").toLowerCase();
  const hrefSlug = lowerHref.split("/").pop() || "";

  if (isBlockedName(name)) return false;
  if (hrefSlug && itemSlugs.has(hrefSlug)) return false;
  if (lowerName === className.toLowerCase()) return false;
  if (lowerSrc.includes("/s/hl/img/")) return false;
  if (lowerSrc.includes("/items/") || lowerSrc.includes("/item/")) return false;
  if (lowerHref.includes("/item/") || lowerHref.includes("/items/")) return false;
  if (!lowerSrc.includes("/s/a/img/wiki/")) return false;

  // ST skin sections: accept set skin images, not item sprites.
  if (lowerSection.includes("set tier") || lowerSection.includes("special themed")) {
    if (lowerName.includes("set skin")) return true;
    if (lowerHref.endsWith("-set") && !isBlockedName(name)) return true;
    return false;
  }

  // Strong skin signals.
  if (lowerSrc.includes("/skins/")) return true;
  if (lowerName.includes("skin")) return true;
  if (lowerName.includes(className.toLowerCase())) return true;

  // On class skin pages, normal skin names can be short, like "Bandit" or "Brigand".
  // Accept images from skin sections as long as they are not known item names.
  if (lowerSection.includes("skins")) return true;

  return false;
}

function extractFirstUsefulParagraph($) {
  const paragraphs = [];

  $("p").each((_, p) => {
    const text = cleanText($(p).text());
    if (
      text.length > 40 &&
      !text.toLowerCase().includes("last updated") &&
      !text.toLowerCase().includes("realmeye")
    ) {
      paragraphs.push(text);
    }
  });

  return paragraphs[0] || "";
}

function getTableValueByLabel($, labels) {
  let value = "";

  $("tr").each((_, row) => {
    const cells = $(row)
      .find("td, th")
      .toArray()
      .map((cell) => cleanText($(cell).text()));

    if (cells.length < 2) return;

    const label = cells[0].toLowerCase();

    if (labels.some((target) => label.includes(target))) {
      value = cells.slice(1).join(" ").trim();
    }
  });

  return value;
}

function extractSectionText($, headingNames) {
  const results = [];

  $("h2,h3,h4").each((_, heading) => {
    const headingText = cleanText($(heading).text()).toLowerCase();

    if (!headingNames.some((name) => headingText.includes(name))) return;

    let current = $(heading).next();

    while (current.length) {
      const tag = current.get(0)?.tagName?.toLowerCase();

      if (["h1", "h2", "h3", "h4"].includes(tag)) break;

      if (["p", "ul", "ol", "table"].includes(tag)) {
        const text = cleanText(current.text());
        if (text) results.push(text);
      }

      current = current.next();
    }
  });

  return results.join(" ").trim();
}

async function getSkinDetails(sourceUrl) {
  if (!sourceUrl) {
    return {
      description: "",
      howToAcquire: "",
      feedPower: "",
      notes: []
    };
  }

  try {
    const html = await fetchPage(sourceUrl);
    const $ = cheerio.load(html);

    const description =
      extractFirstUsefulParagraph($) ||
      getTableValueByLabel($, ["description"]);

    const howToAcquire =
      extractSectionText($, ["how to acquire", "how to obtain", "obtaining", "acquisition"]) ||
      getTableValueByLabel($, ["how to acquire", "how to obtain", "obtained", "acquired", "location"]);

    const feedPower =
      getTableValueByLabel($, ["feed power", "feed"]);

    const notesText =
      extractSectionText($, ["notes", "note"]);

    const notes = notesText
      ? notesText
          .split(/(?<=[.!?])\s+/)
          .map((note) => note.trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];

    return {
      description,
      howToAcquire,
      feedPower,
      notes
    };
  } catch {
    return {
      description: "",
      howToAcquire: "",
      feedPower: "",
      notes: []
    };
  }
}

function collectSkinsFromPage($, className, pageUrl) {
  const skins = new Map();
  const rejected = [];

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

    const href = $img.closest("a[href^='/wiki/']").attr("href") || "";
    const section = previousHeadingText($, img);

    const candidate = {
      name,
      src,
      href,
      section,
      className
    };

    if (!shouldAcceptSkinImage(candidate)) {
      rejected.push({
        ...candidate,
        reason: "not a valid skin image"
      });
      return;
    }

    const slug = slugify(`${className}-${name}`);
    if (!slug) return;

    skins.set(slug, {
      id: slug,
      name,
      slug,
      class: className,
      sprite: `/skins/${slug}.png`,
      imageUrl: absoluteUrl(src),
      rarity: inferRarity(name),
      description: "",
      howToAcquire: "",
      feedPower: "",
      sourceUrl: href ? absoluteUrl(href) : pageUrl,
      notes: []
    });
  });

  return {
    accepted: [...skins.values()],
    rejected
  };
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
    const result = collectSkinsFromPage($, classInfo.className, pageUrl);

    if (debug) {
      fs.writeFileSync(
        `debug/${classInfo.slug}-skins-rejected.json`,
        JSON.stringify(result.rejected, null, 2)
      );
    }

    console.log(`Found ${result.accepted.length} valid skins for ${classInfo.className}`);
    console.log(`Rejected ${result.rejected.length} non-skin images for ${classInfo.className}`);

    return result.accepted;
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

    const details = await getSkinDetails(skin.sourceUrl);

    skin.description = details.description;
    skin.howToAcquire = details.howToAcquire;
    skin.feedPower = details.feedPower;
    skin.notes = details.notes;

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
