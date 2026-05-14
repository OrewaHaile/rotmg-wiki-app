import { Link } from "wouter";
import { Sword, Zap, Shield, Gem, Heart, Crypt, Skull } from "lucide-react";

interface CategoryCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  href?: string;
}

const categories: CategoryCard[] = [
  {
    id: "weapons",
    title: "Weapons",
    icon: <Sword className="w-6 h-6" />,
    description: "Swords, daggers, wands, staves, and more",
    color: "from-orange-900 to-orange-800",
    href: "/items?itemType=Sword",
  },
  {
    id: "abilities",
    title: "Abilities",
    icon: <Zap className="w-6 h-6" />,
    description: "Tomes, rings of power, and special items",
    color: "from-yellow-900 to-yellow-800",
  },
  {
    id: "armor",
    title: "Armor",
    icon: <Shield className="w-6 h-6" />,
    description: "Robes, tunics, and protective gear",
    color: "from-blue-900 to-blue-800",
  },
  {
    id: "rings",
    title: "Rings",
    icon: <Ring className="w-6 h-6" />,
    description: "Rings and stat-boosting equipment",
    color: "from-purple-900 to-purple-800",
  },
  {
    id: "pets",
    title: "Pets",
    icon: <Heart className="w-6 h-6" />,
    description: "Companion creatures and familiars",
    color: "from-pink-900 to-pink-800",
  },
  {
    id: "dungeons",
    title: "Dungeons",
    icon: <Dungeon className="w-6 h-6" />,
    description: "Challenging encounters and raids",
    color: "from-cyan-900 to-cyan-800",
  },
  {
    id: "bosses",
    title: "Bosses",
    icon: <Skull className="w-6 h-6" />,
    description: "Epic enemies and their drops",
    color: "from-red-900 to-red-800",
  },
];

export default function Categories() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-amber-900/40 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-amber-100 mb-2">Categories</h1>
          <p className="text-stone-400 text-sm">Explore items by type and role</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id}>
              {category.href ? (
                <Link href={category.href}>
                  <CategoryCardButton category={category} />
                </Link>
              ) : (
                <CategoryCardButton category={category} disabled />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-4 rounded-lg bg-stone-900/60 border border-stone-800/60">
          <p className="text-xs text-stone-500 text-center">
            More categories coming soon! Items are currently organized by type and tier.
          </p>
        </div>
      </main>
    </div>
  );
}

function CategoryCardButton({ category, disabled }: { category: CategoryCard; disabled?: boolean }) {
  const content = (
    <div
      className={`group relative bg-gradient-to-br ${category.color} p-6 rounded-xl border border-stone-800/60 overflow-hidden transition-all ${
        !disabled ? "hover:shadow-lg hover:border-amber-600/40 hover:scale-105 cursor-pointer" : "opacity-60 cursor-not-allowed"
      }`}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="text-amber-200">{category.icon}</div>
          <h2 className="text-lg font-bold text-amber-100">{category.title}</h2>
        </div>
        <p className="text-sm text-stone-200">{category.description}</p>

        {disabled && (
          <div className="mt-2 text-xs text-stone-400 italic">Coming soon</div>
        )}

        {!disabled && (
          <div className="mt-2 flex items-center gap-1 text-amber-400 text-xs font-medium group-hover:gap-2 transition-all">
            <span>Explore</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  if (disabled) {
    return content;
  }

  return content;
}
