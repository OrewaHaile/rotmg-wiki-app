import { ExternalLink, ArrowLeft, Pencil } from "lucide-react";
import { Link } from "wouter";

interface Item {
  id: string;
  name: string;
  slug: string;
  category?: string;
  sprite: string;
  itemType: string;
  tier: string;
  bagType: string;
  soulbound?: boolean;
  fameBonus?: string | number | null;
  feedPower?: string | number | null;
  description?: string;
  stats?: Record<string, string | number | null>;
  effects?: string[];
  usableClasses?: string[];
  dropsFrom?: string[];
  notes?: string;
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

function StatRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const isEmpty = value === "Unknown" || value === undefined || value === null || value === "";
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-stone-800/60 last:border-0">
      <span className="text-stone-400 text-sm">{label}</span>
      <span className={`text-sm font-medium ${isEmpty ? "text-stone-600 italic" : "text-amber-200"}`}>
        {isEmpty ? "—" : String(value)}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600/80 mb-2 mt-4 first:mt-0">
      {children}
    </h3>
  );
}

export default function ItemDetail({ item }: { item: Item }) {
  const bagColor = bagColors[item.bagType] ?? "text-stone-300";
  const stats = item.stats ?? {};

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-stone-400 hover:text-amber-400 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to list
          </button>
        </Link>
        <Link href={`/item/${item.slug}/edit`}>
          <button className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-400 border border-amber-800/50 hover:border-amber-600/50 bg-amber-950/30 hover:bg-amber-950/60 px-3 py-1.5 rounded-lg transition-all">
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </Link>
      </div>

      <div className="bg-stone-950 border border-amber-900/50 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-stone-900 to-stone-950 px-4 py-5 border-b border-amber-900/40">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-stone-800/80 border border-amber-800/40 rounded-lg flex items-center justify-center shrink-0">
              <img
                src={item.sprite}
                alt={item.name}
                className="w-14 h-14 object-contain"
                style={{ imageRendering: "pixelated" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' fill='%23292524'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='%23a16207'%3E%3F%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-amber-100 leading-tight">{item.name}</h1>
              <p className="text-stone-400 text-sm mt-0.5">{item.itemType}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.tier && (
                  <span className="text-xs font-bold text-amber-500 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                    {item.tier}
                  </span>
                )}
                {item.bagType && (
                  <span className={`text-xs font-medium ${bagColor} bg-stone-800/60 border border-stone-700/40 px-2 py-0.5 rounded`}>
                    {item.bagType} Bag
                  </span>
                )}
                {item.soulbound && (
                  <span className="text-xs text-red-400 bg-red-950/40 border border-red-800/30 px-2 py-0.5 rounded">
                    Soulbound
                  </span>
                )}
              </div>
            </div>
          </div>

          {item.description && (
            <p className="mt-4 text-stone-300 text-sm leading-relaxed italic border-l-2 border-amber-800/60 pl-3">
              "{item.description}"
            </p>
          )}
        </div>

        <div className="px-4 py-4 space-y-3">
          <div>
            <SectionTitle>Combat Stats</SectionTitle>
            <div className="bg-stone-900/60 rounded-lg px-3 py-1">
              <StatRow label="Damage" value={stats.damage} />
              <StatRow label="Range" value={stats.range} />
              <StatRow label="Rate of Fire" value={stats.rateOfFire} />
              <StatRow label="Shots" value={stats.shots} />
              <StatRow label="Projectiles" value={stats.projectiles} />
            </div>
          </div>

          {item.effects && item.effects.length > 0 && (
            <div>
              <SectionTitle>Effects</SectionTitle>
              <div className="bg-stone-900/60 rounded-lg px-3 py-2 space-y-1">
                {item.effects.map((effect, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 text-xs mt-0.5">◆</span>
                    <span className={`text-sm ${effect === "Unknown" ? "text-stone-600 italic" : "text-amber-100"}`}>
                      {effect}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionTitle>Item Info</SectionTitle>
            <div className="bg-stone-900/60 rounded-lg px-3 py-1">
              <StatRow label="Fame Bonus" value={item.fameBonus} />
              <StatRow label="Feed Power" value={item.feedPower} />
            </div>
          </div>

          {item.usableClasses && item.usableClasses.length > 0 && (
            <div>
              <SectionTitle>Usable By</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {item.usableClasses.map((cls) => (
                  <span
                    key={cls}
                    className={`text-xs px-2 py-1 rounded border ${cls === "Unknown" ? "text-stone-600 border-stone-800 italic" : "text-amber-200 bg-amber-950/40 border-amber-800/30"}`}
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.dropsFrom && item.dropsFrom.length > 0 && (
            <div>
              <SectionTitle>Drops From</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {item.dropsFrom.map((source) => (
                  <span
                    key={source}
                    className={`text-xs px-2 py-1 rounded border ${source === "Unknown" ? "text-stone-600 border-stone-800 italic" : "text-stone-300 bg-stone-800/60 border-stone-700/40"}`}
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.notes && (
            <div>
              <SectionTitle>Notes</SectionTitle>
              <p className="text-stone-400 text-xs leading-relaxed bg-stone-900/60 rounded-lg px-3 py-2">
                {item.notes}
              </p>
            </div>
          )}

          {item.sourceUrl && (
            <div className="pt-3">
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-amber-600/70 hover:text-amber-500 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on RealmEye
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
