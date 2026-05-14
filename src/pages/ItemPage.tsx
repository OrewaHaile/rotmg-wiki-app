import { useParams } from "wouter";
import ItemDetail from "../components/ItemDetail";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const itemModules = import.meta.glob("../data/items/*.json", { eager: true });
const allItems: any[] = Object.values(itemModules).map((m: any) => m.default ?? m);

export default function ItemPage() {
  const { slug } = useParams<{ slug: string }>();
  const item = allItems.find((i) => i.slug === slug);

  if (!item) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4 text-center space-y-4">
        <div className="text-5xl">⚔️</div>
        <h2 className="text-amber-200 text-lg font-semibold">Item Not Found</h2>
        <p className="text-stone-500 text-sm">
          This item doesn't exist in the wiki yet.
        </p>
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-300 transition-colors border border-amber-800/50 hover:border-amber-600/50 px-4 py-2 rounded-lg bg-amber-950/30">
            <ArrowLeft className="w-4 h-4" />
            Back to home
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
