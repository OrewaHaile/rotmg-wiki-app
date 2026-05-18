import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUTPUT_PATH = path.join(ROOT, "src", "data", "game-updates.json");
const SOURCE_URL = "https://www.realmeye.com/wiki/realm-of-the-mad-god";

const http = axios.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.google.com/",
  },
  timeout: 20000,
  maxRedirects: 5,
});

function normalizeHref(href) {
  if (!href || typeof href !== "string") return "";
  const cleaned = href.trim();
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }
  if (cleaned.startsWith("//")) {
    return `https:${cleaned}`;
  }
  if (cleaned.startsWith("/")) {
    return `https://www.realmeye.com${cleaned}`;
  }
  return cleaned;
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseCurrentVersion($) {
  const row = $("th").filter((_, el) => cleanText($(el).text()).toLowerCase() === "current game version").first().closest("tr");
  if (!row.length) return "";

  const cell = row.find("th").last();
  const anchor = cell.find("a").first();
  return cleanText(anchor.text() || cell.text());
}

function parseUpdateDate($) {
  const row = $("td b").filter((_, el) => cleanText($(el).text()).toLowerCase() === "updated").first().closest("tr");
  if (!row.length) return "";

  return cleanText(row.find("td").last().text());
}

function parseChanges($) {
  const row = $("td b").filter((_, el) => cleanText($(el).text()).toLowerCase() === "changes").first().closest("tr");
  if (!row.length) return [];

  const cell = row.find("td").last();
  const title = cleanText(cell.find("b").first().text()) || "Update";
  const rawHtml = String(cell.html() || "").replace(/<br\s*\/?>/gi, "\n");
  const temp = cheerio.load(`<div>${rawHtml}</div>`);
  let text = temp("div").text();
  if (title && text.startsWith(title)) {
    text = text.slice(title.length);
  }

  const content = text
    .split(/\n+/)
    .map(cleanText)
    .filter(Boolean);

  const links = cell
    .find("a[href]")
    .map((_, anchor) => {
      const linkText = cleanText($(anchor).text());
      const href = normalizeHref($(anchor).attr("href"));
      return href && linkText ? { text: linkText, href } : null;
    })
    .get()
    .filter(Boolean);

  return [
    {
      title,
      date: parseUpdateDate($),
      content,
      links,
    },
  ];
}

async function fetchUpdateData() {
  try {
    const response = await http.get(SOURCE_URL);
    const html = String(response.data || "");
    if (!html.trim()) {
      console.warn("Received empty page from RealmEye.");
      return null;
    }
    return html;
  } catch (error) {
    console.warn(`Failed to fetch RealmEye page: ${error.message}`);
    return null;
  }
}

function safeJson(data) {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return JSON.stringify(
      {
        currentVersion: "",
        lastImported: "",
        sourceUrl: SOURCE_URL,
        changes: [],
      },
      null,
      2
    );
  }
}

async function run() {
  const html = await fetchUpdateData();
  const raw = {
    currentVersion: "",
    lastImported: new Date().toISOString(),
    sourceUrl: SOURCE_URL,
    changes: [],
  };

  if (html) {
    const $ = cheerio.load(html);
    raw.currentVersion = parseCurrentVersion($) || "";
    raw.changes = parseChanges($);
  }

  const result = {
    currentVersion: raw.currentVersion,
    lastImported: raw.lastImported,
    sourceUrl: raw.sourceUrl,
    changes: raw.changes,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, safeJson(result));
  console.log(`Saved game updates to ${OUTPUT_PATH}`);
}

run().catch((error) => {
  console.error("Unexpected error while importing game updates:", error);
  const fallback = {
    currentVersion: "",
    lastImported: new Date().toISOString(),
    sourceUrl: SOURCE_URL,
    changes: [],
  };
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, safeJson(fallback));
});
