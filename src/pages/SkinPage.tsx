import { Link, useRoute } from "wouter";
import { ArrowLeft, ExternalLink, Shirt } from "lucide-react";
import classSkinsData from "../data/class-skins.json";

interface ClassSkin {
  id: string;
  name: string;
  slug: string;
  class: string;
  sprite: string;
  rarity?: string;
  description?: string;
  howToAcquire?: string;
  feedPower?: string | number;
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

function isEmpty(value: unknown) {
  if (value == null) return true;
  if (value === "") return true;
  if (value === "Unknown") return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export default function SkinPage() {
  const [, params] = useRoute("/skin/:slug");
  const slug = params?.slug || "";

  const skin = skins.find((entry) => entry.slug === slug);

  if (!skin) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-800 bg-stone-900/60 p-8 text-center">
          <Shirt className="mx-auto h-10 w-10 text-amber-400" />

          <h1 className="mt-4 text-3xl font-black text-amber-100">
            Skin not found
          </h1>

          <p className="mt-3 text-stone-400">
            This skin could not be found in the local database.
          </p>

          <Link href="/skins">
            <button className="mt-6 rounded-xl border border-amber-800 bg-amber-500/10 px-4 py-2 text-amber-200 transition hover:bg-amber-500/20">
              Back to Skins
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/skins">
          <button className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-amber-300">
            <ArrowLeft className="h-4 w-4" />
            Back to Skins
          </button>
        </Link>

        <section className="rounded-3xl border border-amber-900/40 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_32%),linear-gradient(180deg,_#1c1712_0%,_#0c0a09_100%)] p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl border border-amber-900/40 bg-stone-950">
              {skin.sprite ? (
                <img
                  src={skin.sprite}
                  alt={skin.name}
                  className="h-24 w-24 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <Shirt className="h-12 w-12 text-amber-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-400/80">
                Class Skin
              </p>

              <h1 className="mt-2 text-4xl font-black text-amber-100">
                {skin.name}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                {skin.class && (
                  <span className="rounded-full border border-amber-800/50 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                    {skin.class}
                  </span>
                )}

                {skin.rarity && (
                  <span className="rounded-full border border-purple-800/50 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
                    {skin.rarity}
                  </span>
                )}

                {!isEmpty(skin.feedPower) && (
                  <span className="rounded-full border border-cyan-800/50 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                    Feed Power {skin.feedPower}
                  </span>
                )}
              </div>
            </div>

            {skin.sourceUrl && (
              <a
                href={skin.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-800 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-200 transition hover:bg-amber-500/20"
              >
                View on RealmEye
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard label="Class" value={skin.class} />
          <InfoCard label="Rarity" value={skin.rarity} />
          <InfoCard label="Feed Power" value={skin.feedPower} />
        </section>

        {!isEmpty(skin.description) && (
          <Section title="Description">
            <p className="text-sm leading-7 text-stone-300">
              {skin.description}
            </p>
          </Section>
        )}

        {!isEmpty(skin.howToAcquire) && (
          <Section title="How to acquire">
            <p className="text-sm leading-7 text-stone-300">
              {skin.howToAcquire}
            </p>
          </Section>
        )}

        {Array.isArray(skin.notes) && skin.notes.length > 0 && (
          <Section title="Notes">
            <ul className="space-y-2 text-sm leading-7 text-stone-300">
              {skin.notes.map((note, index) => (
                <li key={`${note}-${index}`}>• {note}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-amber-200">
        {isEmpty(value) ? "—" : String(value)}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-stone-800 bg-stone-900/60 p-5">
      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-amber-400">
        {title}
      </h2>
      {children}
    </section>
  );
}
