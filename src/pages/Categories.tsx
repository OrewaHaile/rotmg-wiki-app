import { Link } from "wouter";

const categories = [
  {
    title: "Weapons",
    description: "Daggers, swords, bows, wands, staffs, katanas and spellblades.",
    href: "/items",
    icon: "⚔️"
  },
  {
    title: "Abilities",
    description: "Class abilities, spells, traps, tomes, poisons and more.",
    href: "/items",
    icon: "✨"
  },
  {
    title: "Armor",
    description: "Robes, leather armor and heavy armor.",
    href: "/items",
    icon: "🛡️"
  },
  {
    title: "Rings",
    description: "Stat rings and special accessories.",
    href: "/items",
    icon: "💍"
  },
  {
    title: "Pets",
    description: "Pet skins, families and abilities.",
    href: "/items",
    icon: "🐾"
  },
  {
    title: "Dungeons",
    description: "Dungeon pages, bosses and loot tables.",
    href: "/items",
    icon: "🗺️"
  },
  {
    title: "Bosses",
    description: "Boss information, drops and locations.",
    href: "/items",
    icon: "☠️"
  }
];

export default function Categories() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-amber-500 uppercase tracking-[0.35em] text-xs font-bold">
            RotMG Wiki
          </p>
          <h1 className="text-3xl font-bold text-amber-100 mt-2">
            Categories
          </h1>
          <p className="text-stone-400 mt-2">
            Browse the wiki by content type.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.title} href={category.href}>
              <div className="bg-stone-900/70 border border-amber-900/40 rounded-2xl p-5 cursor-pointer hover:bg-stone-900 hover:border-amber-700 transition">
                <div className="text-3xl mb-3">{category.icon}</div>
                <h2 className="text-xl font-bold text-amber-200">
                  {category.title}
                </h2>
                <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}