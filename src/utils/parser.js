import * as cheerio from "cheerio";
import { slugify } from "./slugify.js";

export function parseCategoryLinks(html, baseUrl = "https://www.realmeye.com") {
  const $ = cheerio.load(html);
  const seen = new Set();
  const links = [];

  $(`a[href^="/wiki/"] img[src*="/s/a/img/wiki/i/"]`).each((_, img) => {
    const anchor = $(img).closest("a");
    const href = anchor.attr("href") ?? "";
    if (!href.startsWith("/wiki/") || href.includes("#") || href.includes("?")) return;
    const slug = href.replace("/wiki/", "").toLowerCase().trim();
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    links.push(baseUrl + href);
  });

  return links;
}

function cleanText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function buildStatMap($) {
  const map = {};
  $("table tr").each((_, row) => {
    const cells = $(row).find("th, td");
    if (cells.length < 2) return;
    const key = cleanText($(cells[0]).text()).toLowerCase();
    const val = cleanText($(cells[1]).text());
    if (key && val && key.length < 60) map[key] = val;
  });
  return map;
}

function getStat(map, ...keys) {
  for (const k of keys) {
    for (const [mk, val] of Object.entries(map)) {
      if (mk.includes(k.toLowerCase())) return val || "Unknown";
    }
  }
  return "Unknown";
}

function normalizeTier(raw) {
  if (!raw || raw === "Unknown") return "Unknown";
  const t = raw.trim();
  if (/^\d+$/.test(t)) return `T${t}`;
  if (/^(ut|st|pt)$/i.test(t)) return t.toUpperCase();
  return t;
}

function extractBagType($) {
  let bag = "Unknown";
  $("img").each((_, img) => {
    const alt = cleanText($(img).attr("alt") ?? $(img).attr("title") ?? "");
    const m = alt.match(/assigned to ([a-z]+) bag/i);
    if (m) {
      bag = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
      return false;
    }
  });
  return bag;
}

export function extractSpriteInfo($, itemName) {
  let absoluteUrl = null;

  $("img").each((_, img) => {
    const src = $(img).attr("src") ?? "";
    const alt = cleanText($(img).attr("alt") ?? $(img).attr("title") ?? "");
    if (alt.toLowerCase() === itemName.toLowerCase() && src.includes("/s/a/img/wiki/i/")) {
      absoluteUrl = src.startsWith("http") ? src : "https://www.realmeye.com" + src;
      return false;
    }
  });

  if (!absoluteUrl) {
    $("img").each((_, img) => {
      const src = $(img).attr("src") ?? "";
      if (src.includes("/s/a/img/wiki/i/")) {
        absoluteUrl = src.startsWith("http") ? src : "https://www.realmeye.com" + src;
        return false;
      }
    });
  }

  const slug = slugify(itemName);
  return {
    absoluteUrl,
    localPath: absoluteUrl ? `/items/${slug}.png` : "Unknown",
  };
}

function extractDescription($) {
  const quote = cleanText($("blockquote").first().text());
  if (quote.length > 8) return quote;

  const likely = [];
  $("p").each((_, p) => {
    const text = cleanText($(p).text());
    if (text.length >= 25 && !/realmeye|trading pages|privacy|advertising/i.test(text)) likely.push(text);
  });
  if (likely.length) return likely[0].slice(0, 600);

  return "";
}

function extractUsableClasses($) {
  const knownClasses = [
    "Archer", "Assassin", "Bard", "Druid", "Huntress", "Kensei", "Knight",
    "Mystic", "Necromancer", "Ninja", "Paladin", "Priest", "Rogue", "Samurai",
    "Sorcerer", "Summoner", "Trickster", "Warrior", "Wizard",
  ];
  const found = [];
  $("img").each((_, img) => {
    const alt = cleanText($(img).attr("alt") ?? $(img).attr("title") ?? "");
    if (knownClasses.includes(alt) && !found.includes(alt)) found.push(alt);
  });
  return found;
}

function extractDrops($) {
  const drops = [];
  $("table tr").each((_, row) => {
    const label = cleanText($(row).find("th, td").first().text()).toLowerCase();
    if (label.includes("tier grouped drop") || label === "drops" || label === "drops from") {
      const cells = $(row).find("th, td");
      const td = $(cells[1]);
      td.find("a").each((_, a) => {
        const t = cleanText($(a).text());
        if (t && t.length > 1 && !drops.includes(t)) drops.push(t);
      });
      return false;
    }
  });
  return drops;
}

function extractEffects($) {
  const effects = [];
  $("table tr").each((_, row) => {
    const label = cleanText($(row).find("th, td").first().text()).toLowerCase();
    if (/on equip|on ability|proc|effect|active|passive|reactive|condition/.test(label)) {
      const cells = $(row).find("th, td");
      const val = cleanText($(cells[1]).text());
      if (val && val !== "Unknown") effects.push(val);
    }
  });
  return effects;
}

function extractItemType($, url) {
  const slug = (url.split("/wiki/")[1] ?? "").toLowerCase();
  const typePatterns = [
    [/spellblade/, "Spellblade"],
    [/sword|blade|saber|claymore|falchion|flail|cutlass|rapier/, "Sword"],
    [/dagger|dirk|shiv|stiletto|knife|kris|pugio|talon/, "Dagger"],
    [/bow|longbow/, "Bow"],
    [/staff|stave|spire/, "Staff"],
    [/wand|morning-star/, "Wand"],
    [/katana|tachi|masamune|wakizaki|wakizashi/, "Katana"],
    [/robe/, "Robe"], [/leather/, "Leather Armor"], [/heavy-armor|armor/, "Heavy Armor"],
    [/ring/, "Ring"], [/cloak/, "Cloak"], [/poison/, "Poison"], [/prism/, "Prism"],
    [/trap/, "Trap"], [/quiver/, "Quiver"], [/spell/, "Spell"], [/tome/, "Tome"],
    [/shield/, "Shield"], [/helm/, "Helm"], [/seal/, "Seal"], [/orb/, "Orb"],
    [/skull/, "Skull"], [/scepter/, "Scepter"], [/shuriken/, "Shuriken"],
    [/lute/, "Lute"], [/mace/, "Mace"], [/sheath/, "Sheath"],
  ];
  for (const [pattern, type] of typePatterns) if (pattern.test(slug)) return type;
  return "Unknown";
}

export function parseItemPage(html, url) {
  const $ = cheerio.load(html);
  const hasStats = $("table th, table td").toArray().some((el) => {
    const text = cleanText($(el).text()).toLowerCase();
    return text === "shots" || text === "damage" || text === "feed power" || text === "tier";
  });
  if (!hasStats) throw new Error("Not an individual item page (no stats table found)");

  const name = cleanText($("h1").first().text()) || "Unknown";
  const statMap = buildStatMap($);
  const slug = slugify(name);

  const damage = getStat(statMap, "damage");
  const shots = getStat(statMap, "shots");
  const rateOfFire = getStat(statMap, "rate of fire");
  const feedPower = getStat(statMap, "feed power");
  const fameBonus = getStat(statMap, "xp bonus", "fame bonus", "bonus fame");

  let range = getStat(statMap, "range");
  if (range === "Unknown") {
    const speed = parseFloat(getStat(statMap, "projectile speed"));
    const lifetime = parseFloat(getStat(statMap, "lifetime"));
    if (!Number.isNaN(speed) && !Number.isNaN(lifetime)) range = `${(speed * lifetime).toFixed(2)} tiles`;
  }

  const soulbound = $("table th, table td").toArray().some((el) => cleanText($(el).text()).toLowerCase() === "soulbound");
  const { localPath: sprite, absoluteUrl: spriteDownloadUrl } = extractSpriteInfo($, name);

  return {
    name,
    slug,
    sprite,
    spriteDownloadUrl,
    itemType: extractItemType($, url),
    tier: normalizeTier(getStat(statMap, "tier")),
    bagType: extractBagType($),
    soulbound,
    fameBonus: fameBonus === "Unknown" ? null : fameBonus,
    feedPower: feedPower === "Unknown" ? null : feedPower,
    description: extractDescription($),
    stats: {
      damage: damage === "Unknown" ? null : damage,
      range: range === "Unknown" ? null : range,
      rateOfFire: rateOfFire === "Unknown" ? null : rateOfFire,
      shots: shots === "Unknown" ? null : shots,
      projectiles: shots === "Unknown" ? null : shots,
    },
    effects: extractEffects($),
    usableClasses: extractUsableClasses($),
    dropsFrom: extractDrops($),
    notes: [],
    sourceUrl: url,
  };
}
