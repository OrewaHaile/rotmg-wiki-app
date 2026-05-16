import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Sparkles } from "lucide-react";

interface ClassSkin {
  id?: string;
  name?: string;
  slug?: string;
  sprite?: string;
  class?: string;
}

export default function Skins() {
  const [skins, setSkins] = useState<ClassSkin[]>([]);

  useEffect(() => {
    let active = true;

    const modules = import.meta.glob("../data/class-skins.json");
    const paths = Object.keys(modules);

    if (!paths.length) {
      return () => {
        active = false;
      };
    }

    const load = () => {
      const loader = modules[paths[0]] as () => Promise<{ default: unknown }>;
      loader()
        .then((module) => {
          if (!active) {
            return;
          }

          const value = module?.default;
          setSkins(Array.isArray(value) ? value : []);
        })
        .catch(() => {
          if (active) {
            setSkins([]);
          }
        });
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const itemCount = skins.length;
  const hasSkins = itemCount > 0;

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-amber-900/40 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_32%),linear-gradient(180deg,_#1c1712_0%,_#0c0a09_100%)] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-400/80">RotMG Wiki</p>
          <div className="mt-3 sm:flex sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-black text-amber-100">Class Skins</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
                Browse class skin collections safely. If skin data is unavailable, this page will remain stable and return to the main wiki experience.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-900/40 bg-stone-950/70 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Skin entries</p>
              <p className="mt-2 text-3xl font-black text-amber-200">{hasSkins ? itemCount : 0}</p>
            </div>
          </div>
        </section>

        {!hasSkins && (
          <section className="rounded-2xl border border-amber-900/40 bg-amber-500/10 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <h2 className="font-bold text-amber-100">Class skins are coming soon</h2>
                <p className="mt-1 text-sm text-amber-100/75">
                  The page is ready. When class skin data is available in <code>src/data/class-skins.json</code>, it will load safely and render without crashing.
                </p>
              </div>
            </div>
          </section>
        )}

        {hasSkins && (
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {skins.slice(0, 12).map((skin, index) => (
              <article
                key={skin.id || skin.slug || skin.name || index}
                className="rounded-3xl border border-stone-800 bg-stone-900/60 p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-amber-900/40 bg-stone-950">
                    {skin.sprite ? (
                      <img
                        src={skin.sprite}
                        alt={skin.name}
                        className="h-16 w-16 object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <span className="text-sm text-stone-500">?</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black text-amber-100">{skin.name || "Unknown skin"}</h2>
                    {skin.class && (
                      <p className="mt-2 text-sm uppercase tracking-[0.2em] text-amber-300">{skin.class}</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

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
