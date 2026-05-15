import { useEffect, useState } from "react";
import { useParams } from "wouter";
import ItemDetail from "../components/ItemDetail";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { getItemBySlug } from "../utils/itemData";

const detailModules = import.meta.glob<{ default: Record<string, unknown> }>(
  "../data/*/*.json",
  { eager: true }
);

export default function ItemPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Item not found");
      return;
    }

    // First try to get from the itemData loader
    const itemData = getItemBySlug(slug);
    if (!itemData) {
      setLoading(false);
      setError("Item not found");
      return;
    }

    // Then load the full data from modules
    const categoryPath = itemData.category;
    const key = `../data/${categoryPath}/${slug}.json`;
    const loader = detailModules[key];

    if (!loader || !loader.default) {
      // If module not found, just use the cached item data
      setItem(itemData);
      setLoading(false);
      return;
    }

    setItem(loader.default ?? itemData);
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <div className="text-stone-400 text-sm">Loading item...</div>
      </div>
    );
  }

  if (!item || error) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4 text-center space-y-4">
        <div className="text-5xl">⚔️</div>
        <h2 className="text-amber-200 text-lg font-semibold">{error || "Item Not Found"}</h2>
        <p className="text-stone-500 text-sm">
          This item doesn't exist in the wiki yet.
        </p>
        <Link href="/">
          <button className="inline-flex items-center gap-2 rounded-full border border-amber-700/70 bg-stone-900/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-amber-100 hover:border-amber-500/80 hover:bg-stone-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Items
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-5">
      <ItemDetail item={item} />
    </div>
  );
}
