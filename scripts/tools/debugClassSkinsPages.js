import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.realmeye.com";

const paths = [
  "/wiki/skins",
  "/wiki/class-skins",
  "/wiki/character-skins",
  "/wiki/costumes"
];

async function fetchPage(path) {
  try {
    const url = `${BASE_URL}${path}`;
    const html = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then((res) => res.data);

    return { path, url, html };
  } catch {
    return null;
  }
}

function clean(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

async function main() {
  fs.mkdirSync("debug", { recursive: true });

  for (const path of paths) {
    const result = await fetchPage(path);

    if (!result) {
      console.log(`FAILED: ${path}`);
      continue;
    }

    const $ = cheerio.load(result.html);

    const title = clean($("h1").first().text());
    const tableCount = $("table").length;
    const imageCount = $("img").length;
    const wikiLinkCount = $("a[href^='/wiki/']").length;

    const skinImageMatches = $("img")
      .toArray()
      .filter((img) => {
        const alt = clean($(img).attr("alt"));
        const title = clean($(img).attr("title"));
        const src = clean($(img).attr("src"));
        const text = `${alt} ${title} ${src}`.toLowerCase();

        return (
          text.includes("skin") ||
          text.includes("rogue") ||
          text.includes("wizard") ||
          text.includes("priest") ||
          text.includes("archer") ||
          text.includes("warrior")
        );
      }).length;

    fs.writeFileSync(`debug/${path.replaceAll("/", "_")}.html`, result.html);

    console.log("");
    console.log("====================================");
    console.log(`PATH: ${path}`);
    console.log(`TITLE: ${title}`);
    console.log(`TABLES: ${tableCount}`);
    console.log(`IMAGES: ${imageCount}`);
    console.log(`WIKI LINKS: ${wikiLinkCount}`);
    console.log(`SKIN-LIKE IMAGES: ${skinImageMatches}`);

    console.log("");
    console.log("HEADINGS:");
    $("h1,h2,h3,h4").slice(0, 20).each((i, el) => {
      console.log(`${i + 1}. ${clean($(el).text())}`);
    });

    console.log("");
    console.log("FIRST IMAGES:");
    $("img").slice(0, 20).each((i, img) => {
      console.log({
        alt: clean($(img).attr("alt")),
        title: clean($(img).attr("title")),
        src: clean($(img).attr("src")),
      });
    });

    console.log("");
    console.log("FIRST LINKS:");
    $("a[href^='/wiki/']").slice(0, 30).each((i, a) => {
      console.log({
        text: clean($(a).text()),
        href: $(a).attr("href"),
      });
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
