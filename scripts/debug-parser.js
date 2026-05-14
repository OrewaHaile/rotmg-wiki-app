import { parseItemPage, parseWeaponLinks } from "../utils/parser.js";

const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; RotMGWikiBot/1.0)" };

// Test 1: parse a known weapon item
const dagUrl = "https://www.realmeye.com/wiki/dagger-of-foul-malevolence";
console.log("=== Parsing: Dagger of Foul Malevolence ===");
const dagHtml = await fetch(dagUrl, { headers: HEADERS }).then((r) => r.text());
const dagger = parseItemPage(dagHtml, dagUrl);
console.log(JSON.stringify(dagger, null, 2));

// Test 2: weapon link filter
console.log("\n=== Weapon links (first 20 after filter) ===");
const idxHtml = await fetch("https://www.realmeye.com/wiki/weapons", { headers: HEADERS }).then((r) => r.text());
const links = parseWeaponLinks(idxHtml);
console.log("Total:", links.length);
links.slice(0, 20).forEach((l, i) => console.log(i + 1, l.replace("https://www.realmeye.com/wiki/", "")));
