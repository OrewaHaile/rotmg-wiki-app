import { Link } from "wouter";

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
      <div
        className={`group relative bg-stone-950 border rounded-xl p-3 cursor-pointer hover:bg-stone-900 transition-all duration-200 shadow-lg hover:shadow-xl ${borderClass}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0 w-14 h-14 bg-stone-900 border border-amber-900/40 rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src={spritePath}
              alt={item.name}
              className="w-12 h-12 object-contain"
              style={{ imageRendering: "pixelated" }}
              onError={(event) => {
                const img = event.currentTarget;
                img.style.display = "none";
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-amber-200 font-semibold text-sm leading-tight truncate group-hover:text-amber-100 transition-colors">
              {item.name}
            </p>

            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                {item.category}
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-400">{item.itemType}</span>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {item.tier && (
                <span className="text-xs font-bold text-amber-500 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded">
                  {item.tier}
                </span>
              )}

              {item.bagType && (
                <span
                  className={`text-xs border px-1.5 py-0.5 rounded ${badgeClass}`}
                >
                  {item.bagType} bag
                </span>
              )}

              {item.soulbound && (
                <span className="text-xs text-red-400 bg-red-950/40 border border-red-800/30 px-1.5 py-0.5 rounded">
                  SB
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 text-stone-600 group-hover:text-amber-600 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {item.usableClasses &&
          item.usableClasses.length > 0 &&
          item.usableClasses[0] !== "Unknown" && (
            <div className="mt-3 flex flex-wrap gap-1">
              {item.usableClasses.slice(0, 3).map((cls) => (
                <span
                  key={cls}
                  className="text-[10px] text-stone-400 bg-stone-800/60 px-1.5 py-0.5 rounded"
                >
                  {cls}
                </span>
              ))}

              {item.usableClasses.length > 3 && (
                <span className="text-[10px] text-stone-500">
                  +{item.usableClasses.length - 3}
                </span>
              )}
            </div>
          )}
      </div>
    </Link>
  );
}