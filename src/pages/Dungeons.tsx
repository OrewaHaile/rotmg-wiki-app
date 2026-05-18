import { useMemo, useState } from "react";
import dungeons from "../data/dungeons/index.json";

type Dungeon = {
  id: string;
  name: string;
  slug: string;
  sprite: string;
  difficulty: string;
  realmPortal: boolean;
  location: string[];
  drops: string[];
  bosses: string[];
  description: string;
  needsReview?: boolean;
  issues?: string[];
  sourceUrl: string;
};

const dungeonData = dungeons as Dungeon[];

export default function Dungeons() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return dungeonData;

    return dungeonData.filter((dungeon) => {
      const haystack = [
        dungeon.name,
        dungeon.description,
        dungeon.difficulty,
        dungeon.location.join(" "),
        dungeon.bosses.join(" "),
        dungeon.drops.join(" ")
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [query]);

  const summary = {
    total: dungeonData.length,
    withDrops: dungeonData.filter((dungeon) => dungeon.drops?.length > 0).length,
    withBosses: dungeonData.filter((dungeon) => dungeon.bosses?.length > 0).length,
    needsReview: dungeonData.filter((dungeon) => dungeon.needsReview).length,
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 px-4 py-8">
      <main className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[2rem] border border-amber-900/40 bg-stone-900/70 p-8 shadow-xl shadow-amber-900/10">
          <p className="text-amber-500 uppercase tracking-[0.35em] text-xs font-bold">RotMG Wiki</p>
          <h1 className="text-5xl font-bold text-amber-100 mt-4">Dungeons</h1>
          <p className="mt-4 max-w-3xl text-stone-300 text-base leading-7">
            Browse dungeon references and dungeon metadata sourced from RealmEye. This page highlights dungeon summaries, boss counts, loot coverage, and review status.
          </p>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            <div className="rounded-3xl border border-stone-800/60 bg-stone-900/70 p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-amber-400">Total dungeons</p>
              <p className="mt-4 text-4xl font-semibold text-amber-100">{summary.total}</p>
            </div>
            <div className="rounded-3xl border border-stone-800/60 bg-stone-900/70 p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-amber-400">With drops</p>
              <p className="mt-4 text-4xl font-semibold text-amber-100">{summary.withDrops}</p>
            </div>
            <div className="rounded-3xl border border-stone-800/60 bg-stone-900/70 p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-amber-400">With bosses</p>
              <p className="mt-4 text-4xl font-semibold text-amber-100">{summary.withBosses}</p>
            </div>
            <div className="rounded-3xl border border-stone-800/60 bg-stone-900/70 p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-amber-400">Needs review</p>
              <p className="mt-4 text-4xl font-semibold text-amber-100">{summary.needsReview}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-800/60 bg-stone-900/70 p-6">
            <label htmlFor="dungeon-search" className="text-sm uppercase tracking-[0.28em] text-amber-400">
              Search dungeons
            </label>
            <input
              id="dungeon-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, boss, loot, or location"
              className="mt-4 w-full rounded-3xl border border-stone-800/80 bg-stone-950/80 px-4 py-3 text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <p className="mt-4 text-sm leading-6 text-stone-400">
              {filtered.length} dungeon{filtered.length === 1 ? "" : "s"} match your search.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-stone-800/60 bg-stone-900/70 p-10 text-center text-stone-400">
              No dungeons matched your search.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filtered.map((dungeon) => (
                <article key={dungeon.slug} className="overflow-hidden rounded-3xl border border-stone-800/60 bg-stone-900/70 shadow-lg shadow-black/10">
                  <div className="flex min-h-[170px] flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                    <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-3xl bg-stone-950/80 text-stone-500 sm:h-32 sm:w-32">
                      {dungeon.sprite ? (
                        <img
                          src={dungeon.sprite}
                          alt={dungeon.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs uppercase tracking-[0.35em] text-stone-500">No image</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-2xl font-semibold text-amber-100">{dungeon.name}</h2>
                        {dungeon.needsReview && (
                          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs uppercase tracking-[0.24em] text-amber-200">
                            Review
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-stone-400 line-clamp-3">{dungeon.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-stone-800/60 bg-stone-950/80 p-5 text-sm text-stone-300">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Difficulty</p>
                        <p className="mt-1 text-sm text-amber-100">{dungeon.difficulty || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Location</p>
                        <p className="mt-1 text-sm text-stone-100">
                          {dungeon.location.length > 0 ? dungeon.location.join(", ") : "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-3xl bg-stone-900/80 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Bosses</p>
                        <p className="mt-2 text-lg font-semibold text-amber-100">{dungeon.bosses.length}</p>
                      </div>
                      <div className="rounded-3xl bg-stone-900/80 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Drops</p>
                        <p className="mt-2 text-lg font-semibold text-amber-100">{dungeon.drops.length}</p>
                      </div>
                      <div className="rounded-3xl bg-stone-900/80 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Source</p>
                        <p className="mt-2 text-lg font-semibold text-amber-100">RealmEye</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-400">
                      {dungeon.bosses.length > 0 && (
                        <span className="inline-flex rounded-full border border-emerald-700/40 bg-emerald-700/10 px-3 py-1">
                          {dungeon.bosses.slice(0, 3).join(", ")}{dungeon.bosses.length > 3 ? "..." : ""}
                        </span>
                      )}
                      {dungeon.drops.length > 0 && (
                        <span className="inline-flex rounded-full border border-sky-700/40 bg-sky-700/10 px-3 py-1">
                          {dungeon.drops.slice(0, 3).join(", ")}{dungeon.drops.length > 3 ? "..." : ""}
                        </span>
                      )}
                    </div>

                    <a
                      href={dungeon.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center rounded-2xl border border-amber-800/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15"
                    >
                      View source on RealmEye
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-stone-800/60 bg-stone-900/70 p-6 text-stone-400">
          <h2 className="text-lg font-semibold text-amber-100">Dungeon data notes</h2>
          <p className="mt-3 text-sm leading-6">
            Dungeon content is sourced and validated separately from the item index. Dungeon JSON files live under <code className="rounded bg-stone-950 px-1 py-0.5 text-stone-100">src/data/dungeons</code>, and there is no import-meta glob used for this list.
          </p>
        </section>
      </main>
    </div>
  );
}
