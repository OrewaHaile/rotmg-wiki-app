import { Link } from "wouter";
import { formatCategoryLabel } from "../utils/labels";

interface Item {
  id: string;
  name: string;
  slug: string;
  category: string;
  sprite?: string;
  spriteUrl?: string;
  icon?: string;
  itemType: string;
  tier: string;
  bagType: string;
  soulbound?: boolean;
  usableClasses?: string[];
}

const bagColors: Record<string, string> = {
  White: "border-white/60 shadow-white/10",
  Cyan: "border-cyan-400/60 shadow-cyan-400/10",
  Orange: "border-orange-400/60 shadow-orange-400/10",
  Purple: "border-purple-400/60 shadow-purple-400/10",
  Blue: "border-blue-400/60 shadow-blue-400/10",
  Brown: "border-stone-400/60 shadow-stone-400/10",
};

const bagBadge: Record<string, string> = {
  White: "bg-white/10 text-white border-white/30",
  Cyan: "bg-cyan-900/40 text-cyan-300 border-cyan-600/30",
  Orange: "bg-orange-900/40 text-orange-300 border-orange-600/30",
  Purple: "bg-purple-900/40 text-purple-300 border-purple-600/30",
  Blue: "bg-blue-900/40 text-blue-300 border-blue-600/30",
  Brown: "bg-stone-800/60 text-stone-300 border-stone-600/30",
};

export default function ItemCard({ item }: { item: Item }) {
  const borderClass =
    bagColors[item.bagType] ?? "border-amber-900/60 shadow-amber-900/10";

  const badgeClass =
    bagBadge[item.bagType] ??
    "bg-stone-800/60 text-stone-300 border-stone-600/30";

  const spritePath =
    item.sprite ||
    item.spriteUrl ||
    item.icon ||
    `/items/${item.slug}.png`;

  return (
    <Link href={`/item/${item.slug}`}>
      <div className={`group relative overflow-hidden rounded-3xl border bg-stone-950/90 p-4 cursor-pointer transition hover:-translate-y-0.5 hover:bg-stone-900/95 ${borderClass}`}>
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-900/40 bg-gradient-to-br from-amber-950/25 via-stone-900 to-stone-950">
            <img
              src={spritePath}
              alt={item.name}
              className="w-14 h-14 object-contain pixel-art"
              style={{ imageRendering: "pixelated" }}
              onError={(event) => {
                const img = event.currentTarget;
                img.style.display = "none";
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-amber-100 truncate">{item.name}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.25em] text-stone-400">
              <span className="rounded-full bg-stone-900/70 px-2 py-1">{formatCategoryLabel(item.category)}</span>
              <span className="rounded-full bg-stone-900/70 px-2 py-1">{item.itemType}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {item.tier && (
                <span className="rounded-full border border-amber-700/40 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-200">
                  {item.tier}
                </span>
              )}
              {item.bagType && (
                <span className={`rounded-full border px-2 py-1 text-[11px] ${badgeClass}`}>{item.bagType} bag</span>
              )}
              {item.soulbound && (
                <span className="rounded-full border border-red-800/40 bg-red-950/60 px-2 py-1 text-[11px] text-red-300">Soulbound</span>
              )}
            </div>
          </div>

          <div className="shrink-0 text-stone-500 group-hover:text-amber-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {item.usableClasses && item.usableClasses.length > 0 && item.usableClasses[0] !== "Unknown" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.usableClasses.slice(0, 3).map((cls) => (
              <span key={cls} className="text-[10px] text-stone-300 bg-stone-900/70 px-2 py-1 rounded-full">
                {cls}
              </span>
            ))}
            {item.usableClasses.length > 3 && (
              <span className="text-[10px] text-stone-400">+{item.usableClasses.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
