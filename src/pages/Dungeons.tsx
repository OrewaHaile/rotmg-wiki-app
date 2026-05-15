import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Map, Skull } from "lucide-react";

interface Dungeon {
  id?: string;
  name: string;
  slug: string;
  category?: string;
  sprite?: string;
  difficulty?: string;
  realmPortal?: boolean;
  location?: string[] | string;
  drops?: Array<string | { name: string; slug?: string; sprite?: string; sourceUrl?: string }>;
  bosses?: string[] | string;
  description?: string;
  notes?: string[] | string;
  sourceUrl?: string;
}

const dungeonModules = import.meta.glob<Dungeon>("../data/dungeons/*.json", {
  eager: true,
  import: "default",
});

function normalizeDungeon(dungeon: Partial<Dungeon>, path: string): Dungeon {
  const slug = dungeon.slug || path.split("/").pop()?.replace(".json", "") || "unknown";

  return {
    id: dungeon.id || slug,
    name: dungeon.name || slug,
    slug,
    category: "dungeons",
    sprite: dungeon.sprite || `/dungeons/${slug}.png`,
    difficulty: dungeon.difficulty || "",
    realmPortal: dungeon.realmPortal ?? false,
    location: dungeon.location || [],
    drops: dungeon.drops || [],
    bosses: dungeon.bosses || [],
    description: dungeon.description || "",
    notes: dungeon.notes || [],
    sourceUrl: dungeon.sourceUrl || "",
  };
}

const dungeons = Object.entries(dungeonModules)
  .map(([path, dungeon]) => normalizeDungeon(dungeon, path))
  .sort((a, b) => a.name.localeCompare(b.name));

function toArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "name" in item) return String(item.name);
        return "";
      })
      .filter(Boolean);
  }
  if (typeof value === "string") return value ? [value] : [];
  return [];
}

export default function Dungeons() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    return dungeons.filter((dungeon) => {
      if (!term) return true;

      const locations = toArray(dungeon.location).join(" ").toLowerCase();
      const bosses = toArray(dungeon.bosses).join(" ").toLowerCase();

      return (
        dungeon.name.toLowerCase().includes(term) ||
        locations.includes(term) ||
        bosses.includes(term)
      );
    });
  }, [search]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 px-4 py-6">
      <main className="max-w-6xl mx-auto">
        <section className="rounded-3xl border border-amber-900/50 bg-stone-950 p-6 mb-6">
          <p className="text-amber-500 uppercase tracking-[0.35em] text-xs font-bold">
            RotMG Wiki
          </p>

          <h1 className="text-4xl font-bold text-amber-100 mt-3">
            Dungeons
          </h1>

          <p className="text-stone-400 mt-3">
            Browse dungeon pages, bosses, locations, and loot tables from RealmEye.
          </p>

          <div className="flex gap-3 mt-5 text-amber-400">
            <Map className="w-5 h-5" />
            <Skull className="w-5 h-5" />
          </div>
        </section>

        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dungeons..."
            className="w-full rounded-xl border border-amber-900/50 bg-stone-900/70 px-11 py-3 text-stone-100 placeholder:text-stone-500 outline-none focus:border-amber-600"
          />
        </div>

        <section className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5 mb-5">
          <h2 className="text-amber-300 font-bold mb-2">Matches</h2>
          <p className="text-stone-400">
            Showing <span className="text-amber-300">{filtered.length}</span> of{" "}
            <span className="text-amber-300">{dungeons.length}</span> dungeons.
          </p>
        </section>

        {filtered.length === 0 ? (
          <section className="rounded-2xl border border-stone-800 bg-stone-900/40 p-10 text-center">
            <p className="text-stone-400">
              No dungeons found. We still need to finish the dungeon importer.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((dungeon) => {
              const locations = toArray(dungeon.location);
              const bosses = toArray(dungeon.bosses);
              const drops = toArray(dungeon.drops);

              return (
                <Link key={dungeon.slug} href={`/dungeon/${dungeon.slug}`}>
                  <article className="rounded-2xl border border-amber-900/40 bg-stone-900/70 p-4 cursor-pointer hover:border-amber-600 hover:bg-stone-900 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl border border-stone-700 bg-stone-950 flex items-center justify-center overflow-hidden">
                        {dungeon.sprite ? (
                          <img
                            src={dungeon.sprite}
                            alt={dungeon.name}
                            className="w-14 h-14 object-contain"
                            style={{ imageRendering: "pixelated" }}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-2xl">🗺️</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-amber-100 truncate">
                          {dungeon.name}
                        </h3>

                        {dungeon.difficulty && (
                          <p className="text-xs text-stone-400 mt-1">
                            Difficulty: {dungeon.difficulty}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-stone-400">
                      {locations.length > 0 && (
                        <p>Location: {locations.slice(0, 2).join(", ")}</p>
                      )}

                      {bosses.length > 0 && (
                        <p>Bosses: {bosses.slice(0, 2).join(", ")}</p>
                      )}

                      <p>Drops: {drops.length}</p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
