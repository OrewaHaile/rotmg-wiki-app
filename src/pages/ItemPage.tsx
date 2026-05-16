import { Link, useRoute } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getItemBySlug } from "../utils/itemData";

function isEmpty(value: unknown) {
  if (value == null) return true;
  if (value === "") return true;
  if (value === "Unknown") return true;
  if (Array.isArray(value)) return value.length === 0 || value.every(isEmpty);
  if (typeof value === "object") return Object.keys(value as object).length === 0;
  return false;
}

function renderValue(value: unknown): string {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

export default function ItemPage() {
  const [, params] = useRoute("/item/:slug");
  const slug = params?.slug || "";
  const item = getItemBySlug(slug);

  if (!item) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-800 bg-stone-900/60 p-8 text-center">
          <h1 className="text-3xl font-black text-amber-100">Item not found</h1>
          <p className="mt-3 text-stone-400">This item could not be found in the local database.</p>
          <Link href="/">
            <button className="mt-6 rounded-xl border border-amber-800 bg-amber-500/10 px-4 py-2 text-amber-200">
              Back to Items
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const sprite =
    item.sprite ||
    item.spriteUrl ||
    item.icon ||
    `/items/${item.slug}.png`;

  const stats = item.stats && typeof item.stats === "object" ? Object.entries(item.stats) : [];
  const effects = Array.isArray(item.effects) ? item.effects.filter((x) => !isEmpty(x)) : [];
  const dropsFrom = Array.isArray(item.dropsFrom) ? item.dropsFrom.filter((x) => !isEmpty(x)) : [];
  const usableClasses = Array.isArray(item.usableClasses) ? item.usableClasses.filter((x) => !isEmpty(x)) : [];
  const notes = Array.isArray(item.notes)
    ? item.notes.filter((x) => !isEmpty(x))
    : item.notes
      ? [item.notes]
      : [];

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/">
          <button className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-amber-300">
            <ArrowLeft className="h-4 w-4" />
            Back to Items
          </button>
        </Link>

        <section className="rounded-3xl border border-amber-900/40 bg-stone-900/70 p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-amber-900/40 bg-stone-950">
              <img
                src={sprite}
                alt={item.name}
                className="h-20 w-20 object-contain"
                style={{ imageRendering: "pixelated" }}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-500/80">
                {item.category}
                {item.subCategory ? ` • ${item.subCategory}` : ""}
              </p>

              <h1 className="mt-2 text-4xl font-black text-amber-100">
                {item.name}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.itemType && (
                  <span className="rounded-full border border-stone-700 bg-stone-950 px-3 py-1 text-xs text-stone-300">
                    {item.itemType}
                  </span>
                )}
                {item.tier && (
                  <span className="rounded-full border border-amber-800 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-200">
                    {item.tier}
                  </span>
                )}
                {item.bagType && (
                  <span className="rounded-full border border-orange-800 bg-orange-500/10 px-3 py-1 text-xs text-orange-200">
                    {item.bagType} bag
                  </span>
                )}
                {item.soulbound && (
                  <span className="rounded-full border border-red-800 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                    Soulbound
                  </span>
                )}
              </div>
            </div>

            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-800 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-200 hover:bg-amber-500/20"
              >
                View on RealmEye
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard label="Feed Power" value={item.feedPower} />
          <InfoCard label="Fame Bonus" value={item.fameBonus} />
          <InfoCard label="Tier" value={item.tier} />
          <InfoCard label="Bag Type" value={item.bagType} />
        </section>

        {item.description && (
          <Section title="Description">
            <p className="text-sm leading-7 text-stone-300">{item.description}</p>
          </Section>
        )}

        {stats.length > 0 && (
          <Section title="Stats">
            <div className="grid gap-3 sm:grid-cols-2">
              {stats
                .filter(([, value]) => !isEmpty(value))
                .map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-stone-800 bg-stone-950/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{key}</p>
                    <p className="mt-1 text-sm font-semibold text-amber-100">{renderValue(value)}</p>
                  </div>
                ))}
            </div>
          </Section>
        )}

        {usableClasses.length > 0 && (
          <Section title="Usable Classes">
            <div className="flex flex-wrap gap-2">
              {usableClasses.map((cls) => (
                <span key={cls} className="rounded-full border border-stone-700 bg-stone-950 px-3 py-1 text-sm text-stone-300">
                  {cls}
                </span>
              ))}
            </div>
          </Section>
        )}

        {effects.length > 0 && (
          <Section title="Effects">
            <div className="flex flex-wrap gap-2">
              {effects.map((effect) => (
                <span key={effect} className="rounded-full border border-cyan-800 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
                  {effect}
                </span>
              ))}
            </div>
          </Section>
        )}

        {dropsFrom.length > 0 && (
          <Section title="Drops From">
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {dropsFrom.map((drop) => (
                <div key={drop} className="rounded-xl border border-stone-800 bg-stone-950/70 px-4 py-3 text-sm text-stone-300">
                  {drop}
                </div>
              ))}
            </div>
          </Section>
        )}

        {notes.length > 0 && (
          <Section title="Notes">
            <ul className="space-y-2 text-sm text-stone-300">
              {notes.map((note) => (
                <li key={String(note)}>• {String(note)}</li>
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
      <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{label}</p>
      <p className="mt-2 text-lg font-black text-amber-200">
        {isEmpty(value) ? "—" : renderValue(value)}
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
