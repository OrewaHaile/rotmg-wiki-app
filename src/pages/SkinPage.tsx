import type { ReactNode } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, ExternalLink, Shirt } from "lucide-react";
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
  needsReview?: boolean;
}

const rawSkins = Array.isArray(classSkinsData) ? classSkinsData : [];

const skins = rawSkins
  .filter(
    (skin): skin is ClassSkin =>
      typeof skin === "object" &&
      skin !== null &&
      "name" in skin &&
      "slug" in skin
  )
  .sort((a, b) => {
    if (a.class !== b.class) return a.class.localeCompare(b.class);
    return a.name.localeCompare(b.name);
  });

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

  const currentIndex = skins.findIndex((entry) => entry.slug === slug);
  const skin = currentIndex >= 0 ? skins[currentIndex] : undefined;

  const previousSkin =
    skins.length > 0 && currentIndex >= 0
      ? skins[(currentIndex - 1 + skins.length) % skins.length]
      : undefined;

  const nextSkin =
    skins.length > 0 && currentIndex >= 0
      ? skins[(currentIndex + 1) % skins.length]
      : undefined;

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/skins">
            <button className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-amber-300">
              <ArrowLeft className="h-4 w-4" />
              Back to Skins
            </button>
          </Link>

          <div className="flex gap-2">
            {previousSkin && (
              <Link href={`/skin/${previousSkin.slug}`}>
                <button className="inline-flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/70 px-3 py-2 text-sm font-semibold text-stone-300 transition hover:border-amber-700 hover:text-amber-200">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
              </Link>
            )}

            {nextSkin && (
              <Link href={`/skin/${nextSkin.slug}`}>
                <button className="inline-flex items-center gap-2 rounded-xl border border-amber-800 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            )}
          </div>
        </div>

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

        {skin.needsReview && (
          <section className="rounded-3xl border border-orange-700/40 bg-orange-500/10 p-4 text-orange-100">
            <p className="font-bold">This entry needs review.</p>
            <p className="mt-2 text-sm text-orange-100/80">
              The skin data may be incomplete or contain doubtful matches. Please verify against RealmEye.
            </p>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard label="Class" value={skin.class} />
          <InfoCard label="Rarity" value={skin.rarity} />
          <InfoCard label="Feed Power" value={skin.feedPower} />
        </section>

        <Section title="Description">
          {isEmpty(skin.description) ? (
            <p className="text-sm leading-7 text-stone-500">Not available yet.</p>
          ) : (
            <p className="text-sm leading-7 text-stone-300">{skin.description}</p>
          )}
        </Section>

        <Section title="How to acquire">
          {isEmpty(skin.howToAcquire) ? (
            <p className="text-sm leading-7 text-stone-500">Not available yet.</p>
          ) : (
            <p className="text-sm leading-7 text-stone-300">{skin.howToAcquire}</p>
          )}
        </Section>

        <Section title="Notes">
          {Array.isArray(skin.notes) && skin.notes.length > 0 ? (
            <ul className="space-y-2 text-sm leading-7 text-stone-300">
              {skin.notes.map((note, index) => (
                <li key={`${note}-${index}`}>• {note}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-7 text-stone-500">Not available yet.</p>
          )}
        </Section>

        <section className="flex flex-col gap-3 rounded-3xl border border-stone-800 bg-stone-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-stone-400">
            <span className="text-amber-200 font-bold">{currentIndex + 1}</span> of{" "}
            <span className="text-amber-200 font-bold">{skins.length}</span> skins
          </div>

          <div className="flex gap-2">
            {previousSkin && (
              <Link href={`/skin/${previousSkin.slug}`}>
                <button className="inline-flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-sm font-semibold text-stone-300 transition hover:border-amber-700 hover:text-amber-200">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
              </Link>
            )}

            {nextSkin && (
              <Link href={`/skin/${nextSkin.slug}`}>
                <button className="inline-flex items-center gap-2 rounded-xl border border-amber-800 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            )}
          </div>
        </section>
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-stone-800 bg-stone-900/60 p-5">
      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-amber-400">
        {title}
      </h2>
      {children}
    </section>
  );
}
