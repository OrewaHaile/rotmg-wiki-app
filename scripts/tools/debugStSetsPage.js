import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";

const url = "https://www.realmeye.com/wiki/set-tier-items";

async function main() {
  const html = await axios
    .get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })
    .then((res) => res.data);

  fs.mkdirSync("debug", { recursive: true });
  fs.writeFileSync("debug/set-tier-items.html", html);

  const $ = cheerio.load(html);

  console.log("PAGE TITLE:");
  console.log($("h1").first().text().trim());
  console.log("");

  console.log("HEADINGS:");
  $("h1,h2,h3,h4").each((i, el) => {
    console.log(`${i + 1}. ${$(el).text().replace(/\s+/g, " ").trim()}`);
  });

  console.log("");
  console.log("TABLES FOUND:", $("table").length);

  $("table").each((tableIndex, table) => {
    const text = $(table).text().replace(/\s+/g, " ").trim();
    const links = [];

    $(table)
      .find("a[href^='/wiki/']")
      .each((_, a) => {
        links.push({
          text: $(a).text().replace(/\s+/g, " ").trim(),
          href: $(a).attr("href"),
        });
      });

    const imgs = [];

    $(table)
      .find("img")
      .each((_, img) => {
        imgs.push({
          alt: $(img).attr("alt") || "",
          title: $(img).attr("title") || "",
          src: $(img).attr("src") || "",
        });
      });

    console.log("");
    console.log("======================================");
    console.log(`TABLE ${tableIndex + 1}`);
    console.log("TEXT PREVIEW:");
    console.log(text.slice(0, 800));
    console.log("");
    console.log("LINKS:");
    console.log(links.slice(0, 30));
    console.log("");
    console.log("IMAGES:");
    console.log(imgs.slice(0, 20));
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
