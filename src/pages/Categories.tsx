import { Link } from "wouter";
import { getAllItems } from "../utils/itemData";

const weaponCategories = [
  "daggers",
  "swords",
  "bows",
  "wands",
  "staves",
  "katanas",
  "spellblades",
];

const categories = [
  {
    title: "Weapons",
    description: "Daggers, swords, bows, wands, staffs, katanas and spellblades.",
    href: "/items",
    countKey: "weapons",
    icon: "⚔️",
  },
  {
    title: "Abilities",
    description: "Class abilities, spells, traps, tomes, poisons and more.",
    href: "/items",
    countKey: "abilities",
    icon: "✨",
  },
  {
    title: "Armor",
    description: "Robes, leather armor and heavy armor.",
    href: "/items",
    countKey: "armors",
    icon: "🛡️",
  },
  {
    title: "Rings",
    description: "Stat rings and special accessories.",
    href: "/items",
    countKey: "rings",
    icon: "💍",
  },
  {
    title: "Pets",
    description: "Pet skins, families and abilities.",
    href: "/items",
    countKey: "pets",
    icon: "🐾",
  },
  {
    title: "Dungeons",
    description: "Dungeon pages, bosses and loot tables are coming soon.",
    href: "/dungeons",
    countKey: null,
    icon: "🗺️",
    badge: "Coming soon",
  },
];

export default function Categories() {
  const allItems = getAllItems();
  const counts = {
    weapons: allItems.filter((item) => weaponCategories.includes(item.category)).length,
    abilities: allItems.filter((item) => item.category === "abilities").length,
    armors: allItems.filter((item) => item.category === "armors").length,
    rings: allItems.filter((item) => item.category === "rings").length,
    pets: allItems.filter((item) => item.category === "pets").length,
  };

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-3xl border border-amber-900/40 bg-stone-900/70 p-6">
          <p className="text-amber-500 uppercase tracking-[0.35em] text-xs font-bold">RotMG Wiki</p>
          <h1 className="text-4xl font-bold text-amber-100 mt-3">Categories</h1>
          <p className="text-stone-400 mt-3 max-w-2xl">Browse the wiki by content type and explore the available item groups.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.title} href={category.href}>
              <div className="group flex h-full flex-col justify-between rounded-3xl border border-amber-900/30 bg-stone-900/70 p-6 text-left transition hover:border-amber-500/40 hover:bg-stone-900">
                <div>
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h2 className="text-2xl font-semibold text-amber-200">{category.title}</h2>
                  <p className="text-sm text-stone-400 mt-3 leading-relaxed">{category.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm text-stone-400">
                  {category.countKey ? (
                    <span>{counts[category.countKey]} items</span>
                  ) : (
                    <span className="rounded-full border border-amber-800/50 bg-amber-500/10 px-3 py-1 text-amber-200">Coming soon</span>
                  )}
                  <span className="text-amber-400 text-xs uppercase tracking-[0.25em]">Explore</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
