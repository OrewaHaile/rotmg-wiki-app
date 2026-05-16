import { Link } from "wouter";
import { Shirt, Sparkles, ExternalLink } from "lucide-react";
import stSetsData from "../data/st-sets.json";

interface SetItem {
  name: string;
  slug?: string;
  sprite?: string;
  itemType?: string;
}

interface STSet {
  id: string;
  name: string;
  slug: string;
  category: string;
  setType: string;
  class?: string;
  outfitSprite?: string;
  sourceUrl?: string;
  description?: string;
  items?: SetItem[];
  bonuses?: string[];
  notes?: string[];
}

const rawSets = Array.isArray(stSetsData) ? stSetsData : [];
const allSets = rawSets.filter((set): set is STSet => typeof set === "object" && set !== null && "id" in set);
const realSets = allSets.filter((set) => set.id !== "example-st-set");
const hasRealSets = realSets.length > 0;

export default function Sets() {
  const displaySets = hasRealSets ? realSets : [];

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
                ST Sets
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
                Browse Special Themed sets, their items, class outfits, and set bonuses.
                Full outfit sprites will be added as we import the RealmEye set pages.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-900/40 bg-stone-950/70 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                Sets indexed
              </p>
              <p className="mt-2 text-3xl font-black text-amber-200">
                {hasRealSets ? realSets.length : 0}
              </p>
            </div>
          </div>
        </section>

        {!hasRealSets && (
          <section className="rounded-2xl border border-amber-900/40 bg-amber-500/10 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <h2 className="font-bold text-amber-100">
                  ST Sets importer coming next
                </h2>
                <p className="mt-1 text-sm text-amber-100/75">
                  The page structure is ready. Next we will import ST set names,
                  items, bonuses, and complete outfit sprites from RealmEye.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {displaySets.map((set) => (
            <article
              key={set.id}
              className="rounded-3xl border border-stone-800 bg-stone-900/60 p-5 shadow-xl shadow-black/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-amber-900/40 bg-stone-950">
                  {set.outfitSprite ? (
                    <img
                      src={set.outfitSprite}
                      alt={set.name}
                      className="h-16 w-16 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <Shirt className="h-8 w-8 text-amber-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-purple-700/50 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-200">
                      {set.setType || "ST"}
                    </span>
                    {set.class && (
                      <span className="rounded-full border border-amber-800/50 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200">
                        {set.class}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="mt-2 truncate text-xl font-black text-amber-100">
                      {set.name}
                    </h2>
                    {Array.isArray(set.items) && set.items.length !== 4 && (
                      <span className="rounded-full border border-orange-700/50 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-200">
                        Needs review
                      </span>
                    )}
                  </div>

                  {set.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-400">
                      {set.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-stone-500">
                  Set items
                </p>

            {Array.isArray(set.items) && set.items.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {set.items.slice(0, 4).map((item, index) => {
                  const itemCard = (
                    <div
                      className="flex h-16 items-center justify-center rounded-xl border border-stone-800 bg-stone-950 transition hover:border-amber-500 hover:bg-stone-900"
                      title={item.name}
                    >
                      {item?.sprite ? (
                        <img
                          src={item.sprite}
                          alt={item.name}
                          className="h-11 w-11 object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                      ) : (
                        <span className="text-xs text-stone-500">?</span>
                      )}
                    </div>
                  );

                  return item.slug ? (
                    <Link key={item.slug} href={`/item/${item.slug}`}>
                      {itemCard}
                    </Link>
                  ) : (
                    <div key={item.name || index}>{itemCard}</div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl border border-stone-800 bg-stone-950/80 px-3 py-3 text-sm text-stone-500">
                Items will appear here after the ST set import.
              </p>
            )}
              </div>

              {set.bonuses && set.bonuses.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-stone-500">
                    Bonuses
                  </p>
                  <ul className="space-y-1 text-sm text-stone-300">
                    {set.bonuses.map((bonus) => (
                      <li key={bonus}>• {bonus}</li>
                    ))}
                  </ul>
                </div>
              )}

              {set.sourceUrl && (
                <a
                  href={set.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-amber-800/60 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20"
                >
                  View on RealmEye
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </article>
          ))}
        </section>

        <div className="pt-2">
          <Link href="/categories">
            <button className="rounded-xl border border-stone-800 bg-stone-900 px-4 py-2 text-sm font-semibold text-stone-300 transition hover:border-amber-800 hover:text-amber-200">
              Back to Categories
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
