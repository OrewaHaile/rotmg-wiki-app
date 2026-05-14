import { useState, useMemo } from "react";
import { Shield, Database, ShieldCheck, AlertTriangle } from "lucide-react";
import SearchBar from "../components/SearchBar";
import FilterBar, { FilterState } from "../components/FilterBar";
import ItemCard from "../components/ItemCard";
import { getAllItems, getFilterOptions } from "../utils/itemData";
import reportData from "../data/import-report.json";

const allItems = getAllItems();
const filterOptions = getFilterOptions();

const emptyFilters: FilterState = {
  category: "",
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
      if (filters.category && item.category !== filters.category) return false;
      if (filters.itemType && item.itemType !== filters.itemType) return false;
      if (filters.tier && item.tier !== filters.tier) return false;
      if (filters.bagType && item.bagType !== filters.bagType) return false;
      if (filters.usableClass && !item.usableClasses?.includes(filters.usableClass)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-amber-900/40 px-4 pt-6 pb-5 sticky top-0 z-20 shadow-lg backdrop-blur-lg">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-amber-400/80">RotMG Wiki</p>
                <h1 className="text-2xl font-semibold text-amber-100">Item Explorer</h1>
              </div>
            </div>
            <div className="rounded-3xl border border-stone-800/80 bg-stone-950/80 px-4 py-3 shadow-inner flex flex-wrap gap-3 justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Database className="w-4 h-4 text-amber-400" />
                <span>{allItems.length} loaded</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>{reportData.duplicates ?? 0} duplicates</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>{reportData.invalid ?? 0} invalid</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <SearchBar value={search} onChange={setSearch} />
            <div className="rounded-2xl bg-stone-900/80 border border-stone-800/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500 mb-2">Category counts</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-stone-400">
                {Object.entries(reportData.categories || {}).map(([category, _count]) => {
                  const loadedCount = allItems.filter((i) => i.category === category).length;
                  return (
                    <div key={category} className="rounded-xl bg-stone-950/80 border border-stone-800/70 px-2 py-2">
                      <p className="text-stone-300 font-semibold">{category}</p>
                      <p className="text-amber-300">{loadedCount}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <p className="text-xs text-stone-500">
            {filtered.length} {filtered.length === 1 ? "item" : "items"} found
          </p>
          {(search || Object.values(filters).some(Boolean)) && (
            <button
              onClick={() => {
                setSearch("");
                setFilters(emptyFilters);
              }}
              className="text-xs text-stone-400 hover:text-amber-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-stone-400">
            <div className="text-4xl">🔮</div>
            <p className="text-sm">No items found</p>
            <p className="text-xs text-stone-500">Try adjusting search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <ItemCard key={item.slug} item={item} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-stone-500 text-xs">
          Data sourced from <a href="https://www.realmeye.com" target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300">RealmEye</a>. Fan project only.
        </div>
      </main>
    </div>
  );
}
