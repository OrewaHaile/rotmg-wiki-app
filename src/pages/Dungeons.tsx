import { useMemo, useState } from "react";
import { MapPin, Skull, Compass, Globe } from "lucide-react";
import SearchBar from "../components/SearchBar";

type Dungeon = {
  id: string;
  name: string;
  slug: string;
  category: string;
  sprite: string;
  difficulty: string;
  realmPortal: boolean;
  location: string[];
  drops: string[];
  bosses: string[];
  description: string;
  notes: string[];
  sourceUrl: string;
};

const dungeonModules = import.meta.glob<{ default: Dungeon }>(
  "../data/dungeons/*.json",
  { eager: true, import: "default" }
);

const dungeons = Object.values(dungeonModules)
  .map((module) => module.default)
  .sort((a, b) => a.name.localeCompare(b.name));

export default function Dungeons() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return dungeons;
    return dungeons.filter((dungeon) =>
      dungeon.name.toLowerCase().includes(query) ||
      dungeon.description.toLowerCase().includes(query) ||
      dungeon.location.some((loc) => loc.toLowerCase().includes(query)) ||
      dungeon.bosses.some((boss) => boss.toLowerCase().includes(query))
    );
  }, [search]);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="rounded-[2rem] border border-amber-900/50 bg-stone-950/80 p-6 shadow-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-amber-400/80">RotMG Wiki</p>
              <h1 className="mt-2 text-4xl font-black text-amber-100">Dungeons</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
                Browse dungeon pages, locations, bosses, and loot tables from RealmEye.
              </p>
            </div>
            <div className="flex items-center gap-3 text-stone-400">
              <Compass className="h-6 w-6 text-amber-500" />
              <Globe className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Search dungeons..." />
            <div className="rounded-3xl border border-stone-800/70 bg-stone-900/80 p-5 text-sm text-stone-400">
              <p className="font-semibold text-amber-200">Matches</p>
              <p className="mt-2">
                Showing <span className="text-amber-200">{filtered.length}</span> of <span className="text-amber-200">{dungeons.length}</span> dungeons.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-stone-800/70 bg-stone-900/80 p-5 space-y-3 text-sm text-stone-400">
            <p className="uppercase tracking-[0.25em] text-amber-400/80 text-xs font-semibold">Dungeon Info</p>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-200 font-semibold">Total</span>
                <span className="ml-auto text-stone-300">{dungeons.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-200 font-semibold">Search</span>
                <span className="ml-auto text-stone-300">Name, location, boss</span>
              </div>
            </div>
          </div>
        </section>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-stone-800/70 bg-stone-900/80 p-10 text-center text-stone-500">
            No dungeons found. Try a different keyword.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((dungeon) => (
              <article
                key={dungeon.slug}
                className="group overflow-hidden rounded-[1.75rem] border border-amber-900/50 bg-stone-900/80 shadow-xl transition hover:-translate-y-0.5"
              >
                <div className="relative h-52 overflow-hidden bg-stone-950">
                  <img
                    src={dungeon.sprite}
                    alt={dungeon.name}
                    className="h-full w-full object-contain p-6"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-amber-100">{dungeon.name}</h2>
                      <p className="mt-1 text-sm text-stone-400 line-clamp-2">{dungeon.description}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-stone-300">
                    <div className="flex items-center gap-2 text-stone-400">
                      <Skull className="h-4 w-4 text-amber-400" />
                      <span>{dungeon.bosses.length} boss{dungeon.bosses.length === 1 ? "" : "es"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <MapPin className="h-4 w-4 text-amber-400" />
                      <span>{dungeon.location.slice(0, 2).join(", ") || "Unknown location"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="rounded-full bg-amber-950/50 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-amber-200">
                        {dungeon.difficulty || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {dungeon.sourceUrl && (
                    <a
                      href={dungeon.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300 hover:text-amber-100"
                    >
                      View on RealmEye
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
