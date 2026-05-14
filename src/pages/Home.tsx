import { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import FilterBar, { FilterState } from "../components/FilterBar";
import ItemCard from "../components/ItemCard";
import { Shield } from "lucide-react";

function unique(arr: string[]) {
  return Array.from(new Set(arr)).filter(Boolean).sort();
}

const itemModules = import.meta.glob("../data/items/*.json", { eager: true });
const allItems: any[] = Object.values(itemModules).map((m: any) => m.default ?? m);

const filterOptions = {
  itemTypes: unique(allItems.map((i) => i.itemType)),
  tiers: unique(allItems.map((i) => i.tier)),
  bagTypes: unique(allItems.map((i) => i.bagType)),
  classes: unique(allItems.flatMap((i) => i.usableClasses).filter((c: string) => c !== "Unknown")),
};

const emptyFilters: FilterState = {
  itemType: "",
  tier: "",
  bagType: "",
  usableClass: "",
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.itemType && item.itemType !== filters.itemType) return false;
      if (filters.tier && item.tier !== filters.tier) return false;
      if (filters.bagType && item.bagType !== filters.bagType) return false;
      if (filters.usableClass && !item.usableClasses.includes(filters.usableClass)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="min-h-screen bg-stone-950">
      <header className="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-amber-900/40 px-4 pt-6 pb-5 sticky top-0 z-10 shadow-lg">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500 shrink-0" />
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-amber-400">RotMG</span>
              <span className="text-amber-100"> Wiki</span>
            </h1>
            <span className="ml-auto text-xs text-stone-500 bg-stone-800/60 border border-stone-700/40 px-2 py-0.5 rounded">
              Fan-made
            </span>
          </div>
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-stone-500">
            {filtered.length} {filtered.length === 1 ? "item" : "items"} found
          </p>
          {(search || Object.values(filters).some(Boolean)) && (
            <button
              onClick={() => { setSearch(""); setFilters(emptyFilters); }}
              className="text-xs text-stone-500 hover:text-amber-400 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <div className="text-4xl">🔮</div>
            <p className="text-stone-400 text-sm">No items found</p>
            <p className="text-stone-600 text-xs">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <p className="text-center text-stone-700 text-xs mt-8">
          Data sourced from{" "}
          <a
            href="https://www.realmeye.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-600 hover:text-amber-600 transition-colors"
          >
            RealmEye
          </a>
          . Fan project — not affiliated with DECA Games.
        </p>
      </main>
    </div>
  );
}
