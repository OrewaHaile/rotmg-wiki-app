import { Link, useRoute } from "wouter";
import { getItemBySlug } from "../utils/itemData";

export default function ItemEditPage() {
  const [, params] = useRoute("/item/:slug/edit");
  const slug = params?.slug || "";
  const item = getItemBySlug(slug);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-stone-800 bg-stone-900/60 p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-500/80">
          Editor
        </p>

        <h1 className="mt-3 text-3xl font-black text-amber-100">
          {item ? item.name : "Item"} editor
        </h1>

        <p className="mt-3 text-stone-400">
          Manual item editing is not available in the public beta yet.
        </p>

        <Link href={item ? `/item/${item.slug}` : "/"}>
          <button className="mt-6 rounded-xl border border-amber-800 bg-amber-500/10 px-4 py-2 text-amber-200">
            Back
          </button>
        </Link>
      </div>
    </main>
  );
}
