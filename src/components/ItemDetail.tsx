import { ExternalLink, ArrowLeft, Pencil } from "lucide-react";
import { Link } from "wouter";

interface Item {
  id: string;
  name: string;
  slug: string;
  category?: string;
  subCategory?: string;
  sprite?: string;
  spriteUrl?: string;
  icon?: string;
  itemType: string;
  tier: string;
  bagType: string;
  soulbound?: boolean;
  fameBonus?: string | number | null;
  feedPower?: string | number | null;
  description?: string;
  stats?: Record<string, unknown>;
  effects?: string[] | string;
  usableClasses?: string[];
  dropsFrom?: string[] | string;
  notes?: string[] | string;
  sourceUrl?: string;
}

const bagColors: Record<string, string> = {
  White: "text-white",
  Cyan: "text-cyan-300",
  Orange: "text-orange-300",
  Purple: "text-purple-300",
  Blue: "text-blue-300",
  Brown: "text-stone-300",
};

function normalizeArray(value?: string[] | string): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [value];
}

function isHiddenValue(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "Unknown"
  );
}

function formatStatValue(value: unknown) {
  if (value === undefined || value === null) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.filter((item) => !isHiddenValue(item)).map(String).join(", ");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, innerValue]) => !isHiddenValue(innerValue))
      .map(([innerKey, innerValue]) => `${innerKey}: ${String(innerValue)}`)
      .join(", ");
  }
  return String(value);
}

function StatEntry({ label, value }: { label: string; value: unknown }) {
  const formatted = formatStatValue(value);
  if (!formatted) return null;

  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 py-3 border-b border-stone-800/50 last:border-b-0">
      <span className="text-sm text-stone-400">{label}</span>
      <span className="text-sm font-semibold text-amber-200 text-right">{formatted}</span>
    </div>
  );
}

export default function ItemDetail({ item }: { item: Item }) {
  const spritePath = item.sprite || item.spriteUrl || item.icon || `/items/${item.slug}.png`;
  const effects = normalizeArray(item.effects as string[] | string);
  const dropsFrom = normalizeArray(item.dropsFrom as string[] | string);
  const notes = normalizeArray(item.notes as string[] | string);
  const usableClasses = item.usableClasses?.length ? item.usableClasses : [];
  const stats = item.stats || {};

  const visibleEffects = effects.filter((effect) => !isHiddenValue(effect));
  const visibleDrops = dropsFrom.filter((source) => !isHiddenValue(source));
  const visibleNotes = notes.filter((note) => !isHiddenValue(note));
  const visibleStats = Object.entries(stats).filter(([, value]) => {
    if (Array.isArray(value)) {
      return value.some((item) => !isHiddenValue(item));
    }
    if (typeof value === "object") {
      return Object.keys(value ?? {}).length > 0;
    }
    return !isHiddenValue(value);
  });

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <Link href="/">
          <button className="inline-flex items-center gap-2 rounded-full border border-amber-700/70 bg-stone-900/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-amber-100 transition hover:border-amber-500/80 hover:bg-stone-800">
            <ArrowLeft className="h-4 w-4" />
            Back to Items
          </button>
        </Link>
        <Link href={`/item/${item.slug}/edit`}>
          <button className="inline-flex items-center gap-2 rounded-full border border-amber-700/70 bg-amber-950/30 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-amber-100 transition hover:bg-amber-900 hover:border-amber-500/80">
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        </Link>
      </div>

      <div className="rounded-[2rem] border border-amber-900/50 bg-stone-950 shadow-[0_30px_80px_-50px_rgba(34,28,26,0.9)] overflow-hidden">
        <div className="bg-gradient-to-br from-stone-900/95 via-stone-950 to-stone-950 px-6 py-7 border-b border-amber-900/40">
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-center">
            <div className="flex items-center justify-center rounded-[2rem] border border-amber-800/50 bg-stone-900/75 p-6 shadow-inner">
              <img
                src={spritePath}
                alt={item.name}
                className="w-40 h-40 object-contain"
                style={{ imageRendering: "pixelated" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%231a1717'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='%23a16207'%3E%3F%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            <div className="flex flex-col justify-center gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-amber-700/60 bg-amber-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                  {item.category}
                </span>
                {item.subCategory && (
                  <span className="rounded-full border border-stone-700/70 bg-stone-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">
                    {item.subCategory}
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-black tracking-tight text-amber-100 sm:text-5xl">
                {item.name}
              </h1>
              <p className="text-sm uppercase tracking-[0.25em] text-stone-400">{item.itemType}</p>
              <div className="flex flex-wrap gap-2 pt-3">
                {item.tier && (
                  <span className="rounded-full border border-amber-700/60 bg-amber-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                    Tier {item.tier}
                  </span>
                )}
                {item.bagType && (
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${bagColors[item.bagType] ?? "text-stone-200"} border-stone-700/60 bg-stone-900/70`}>
                    {item.bagType} Bag
                  </span>
                )}
                {item.soulbound && (
                  <span className="rounded-full border border-red-700/70 bg-red-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                    Soulbound
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[1.75rem] border border-amber-800/50 bg-stone-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">Feed Power</p>
              <p className="mt-4 text-3xl font-semibold text-amber-100">{item.feedPower ?? "—"}</p>
            </div>
            <div className="rounded-[1.75rem] border border-amber-800/50 bg-stone-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">Fame Bonus</p>
              <p className="mt-4 text-3xl font-semibold text-amber-100">{item.fameBonus ?? "—"}</p>
            </div>
            <div className="rounded-[1.75rem] border border-amber-800/50 bg-stone-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">Soulbound</p>
              <p className="mt-4 text-3xl font-semibold text-amber-100">{item.soulbound ? "Yes" : "No"}</p>
            </div>
            <div className="rounded-[1.75rem] border border-amber-800/50 bg-stone-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">Tier</p>
              <p className="mt-4 text-3xl font-semibold text-amber-100">{item.tier || "—"}</p>
            </div>
            <div className="rounded-[1.75rem] border border-amber-800/50 bg-stone-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">Bag Type</p>
              <p className="mt-4 text-3xl font-semibold text-amber-100">{item.bagType || "—"}</p>
            </div>
            <div className="rounded-[1.75rem] border border-amber-800/50 bg-stone-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">Usable Classes</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {usableClasses.length > 0 ? (
                  usableClasses.map((cls) => (
                    <span
                      key={cls}
                      className="rounded-full border border-amber-700/60 bg-amber-950/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100"
                    >
                      {cls}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-stone-700/60 bg-stone-900/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">Unknown</span>
                )}
              </div>
            </div>
          </div>

          {item.description && item.description !== "Unknown" && (
            <div className="rounded-[1.75rem] border border-amber-800/50 bg-stone-900/70 p-6">
              <p className="text-sm leading-relaxed text-stone-300">{item.description}</p>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-6">
              {visibleEffects.length > 0 && (
                <div className="rounded-[1.75rem] border border-amber-800/50 bg-stone-900/70 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">Effects</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {visibleEffects.map((effect) => (
                      <span
                        key={effect}
                        className="rounded-full border border-amber-700/60 bg-amber-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100"
                      >
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {visibleDrops.length > 0 && (
                <div className="rounded-[1.75rem] border border-amber-800/50 bg-stone-900/70 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">Drops From</p>
                  <div className="mt-4 space-y-3">
                    {visibleDrops.map((source) => (
                      <div key={source} className="rounded-2xl border border-stone-800/60 bg-stone-950/70 px-4 py-3 text-sm text-stone-200">
                        {source}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {visibleNotes.length > 0 && (
                <div className="rounded-[1.75rem] border border-amber-800/50 bg-stone-900/70 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">Notes</p>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-stone-300">
                    {visibleNotes.map((note, index) => (
                      <p key={`${note}-${index}`}>{note}</p>
                    ))}
                  </div>
                </div>
              )}

              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-[1.75rem] border border-amber-700/60 bg-amber-950/40 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-900"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on RealmEye
                </a>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-amber-800/50 bg-stone-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">Stats</p>
              <div className="mt-4 divide-y divide-stone-800/50">
                {visibleStats.length > 0 ? (
                  visibleStats.map(([key, value]) => (
                    <StatEntry
                      key={key}
                      label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                      value={value}
                    />
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No stats available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
