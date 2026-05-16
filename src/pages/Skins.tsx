import { useMemo, useState } from "react";
import { Search, Shirt } from "lucide-react";
import classSkinsData from "../data/class-skins.json";

interface ClassSkin {
  id: string;
  name: string;
  slug: string;
  class: string;
  sprite: string;
  rarity?: string;
  sourceUrl?: string;
  notes?: string[];
}

const rawSkins = Array.isArray(classSkinsData) ? classSkinsData : [];
const skins = rawSkins.filter(
  (skin): skin is ClassSkin =>
    typeof skin === "object" &&
    skin !== null &&
    "name" in skin &&
    "slug" in skin
);

export default function Skins() {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const classes = useMemo(() => {
    return [...new Set(skins.map((skin) => skin.class).filter(Boolean))].sort();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return skins.filter((skin) => {
      if (selectedClass && skin.class !== selectedClass) return false;
      if (term && !skin.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [search, selectedClass]);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-amber-900/40 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_32%),linear-gradient(180deg,_#1c1712_0%,_#0c0a09_100%)] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-400/80">
            RotMG Wiki
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-black text-amber-100">
                Class Skins
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
                Browse class skins imported from RealmEye. Search by skin name or filter by class.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-900/40 bg-stone-950/70 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                Skins indexed
              </p>
              <p className="mt-2 text-3xl font-black text-amber-200">
                {skins.length}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-800 bg-stone-900/60 p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search skins..."
                className="h-12 w-full rounded-2xl border border-amber-900/50 bg-stone-950/80 pl-11 pr-4 text-sm text-amber-100 placeholder:text-stone-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(event) => setSelectedClass(event.target.value)}
              className="h-12 rounded-2xl border border-stone-800 bg-stone-950/80 px-4 text-sm font-semibold text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">All classes</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-4 text-sm text-stone-400">
            Showing <span className="font-bold text-amber-200">{filtered.length}</span> of{" "}
            <span className="font-bold text-amber-200">{skins.length}</span> skins.
          </p>
        </section>

        {skins.length === 0 ? (
          <section className="rounded-3xl border border-stone-800 bg-stone-900/60 p-10 text-center">
            <Shirt className="mx-auto h-10 w-10 text-amber-400" />
            <h2 className="mt-4 text-xl font-black text-amber-100">
              Skins coming soon
            </h2>
            <p className="mt-2 text-sm text-stone-400">
              Run the class skin importer to populate this page.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {filtered.map((skin) => (
              <a
                key={skin.id}
                href={skin.sourceUrl || "#"}
                target={skin.sourceUrl ? "_blank" : undefined}
                rel={skin.sourceUrl ? "noreferrer" : undefined}
                className="group rounded-3xl border border-stone-800 bg-stone-900/60 p-4 text-center transition hover:border-amber-600 hover:bg-stone-900"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-900/30 bg-stone-950">
                  {skin.sprite ? (
                    <img
                      src={skin.sprite}
                      alt={skin.name}
                      className="h-16 w-16 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <Shirt className="h-8 w-8 text-amber-400" />
                  )}
                </div>

                <h2 className="mt-3 line-clamp-2 text-sm font-black text-amber-100">
                  {skin.name}
                </h2>

                <p className="mt-1 text-xs text-stone-400">
                  {skin.class}
                </p>

                {skin.rarity && (
                  <span className="mt-2 inline-flex rounded-full border border-amber-800/50 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                    {skin.rarity}
                  </span>
                )}
              </a>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
