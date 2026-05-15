import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import SearchBar from "../components/SearchBar";
import FilterBar, { FilterState } from "../components/FilterBar";
import ItemCard from "../components/ItemCard";
import { getAllItems, getFilterOptions } from "../utils/itemData";

const allItems = getAllItems();
const filterOptions = getFilterOptions();

const tabGroups = {
  all: { label: "All", categories: [] as string[] },
  weapons: {
    label: "Weapons",
    categories: ["daggers", "swords", "bows", "wands", "staves", "katanas", "spellblades"],
  },
  abilities: { label: "Abilities", categories: ["abilities"] },
  armors: { label: "Armors", categories: ["armors"] },
  rings: { label: "Rings", categories: ["rings"] },
  pets: { label: "Pets", categories: ["pets"] },
};

const emptyFilters: FilterState = {
  category: "",
  subCategory: "",
  itemType: "",
  tier: "",
  bagType: "",
  usableClass: "",
};

export default function Home() {
  const searchParams = useSearch();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [activeTab, setActiveTab] = useState<keyof typeof tabGroups>("all");

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const newFilters = { ...emptyFilters };

    if (params.has("itemType")) {
      newFilters.itemType = params.get("itemType") || "";
    }
    if (params.has("category")) {
      newFilters.category = params.get("category") || "";
    }
    if (params.has("subCategory")) {
      newFilters.subCategory = params.get("subCategory") || "";
    }
    if (params.has("tier")) {
      newFilters.tier = params.get("tier") || "";
    }
    if (params.has("bagType")) {
      newFilters.bagType = params.get("bagType") || "";
    }
    if (params.has("usableClass")) {
      newFilters.usableClass = params.get("usableClass") || "";
    }
    if (params.has("search")) {
      setSearch(params.get("search") || "");
    }

    setFilters(newFilters);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeTab !== "all" && !tabGroups[activeTab].categories.includes(item.category)) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.subCategory && item.subCategory !== filters.subCategory) return false;
      if (filters.itemType && item.itemType !== filters.itemType) return false;
      if (filters.tier && item.tier !== filters.tier) return false;
      if (filters.bagType && item.bagType !== filters.bagType) return false;
      if (filters.usableClass && !item.usableClasses?.includes(filters.usableClass)) return false;
      return true;
    });
  }, [search, filters, activeTab]);

  const totalCount = allItems.length;
  const groupCounts = {
    all: totalCount,
    weapons: allItems.filter((item) => tabGroups.weapons.categories.includes(item.category)).length,
    abilities: allItems.filter((item) => item.category === "abilities").length,
    armors: allItems.filter((item) => item.category === "armors").length,
    rings: allItems.filter((item) => item.category === "rings").length,
    pets: allItems.filter((item) => item.category === "pets").length,
  };

  const clearAll = () => {
    setSearch("");
    setFilters(emptyFilters);
    setActiveTab("all");
  };

  const hasActiveFilters =
    search ||
    activeTab !== "all" ||
    Object.values(filters).some((value) => Boolean(value));

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className=" border-b border-amber-900/30 bg-stone-950/95 -xl px-4 py-5 shadow-sm">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.7fr_auto] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-400/70">RotMG Wiki Beta</p>
              <h1 className="text-4xl sm:text-5xl font-semibold text-amber-100">RotMG Wiki Beta</h1>
              <p className="max-w-2xl text-stone-300 text-sm sm:text-base">
                Search weapons, abilities, armors, rings and pet skins. Data is still being reviewed as part of the beta.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-amber-800/50 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-amber-200">
                  Beta version
                </span>
                <span className="rounded-full border border-stone-800/50 bg-stone-900/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-stone-300">
                  Fan project
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-stone-800/70 bg-stone-900/70 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Total entries</p>
                <p className="mt-3 text-4xl font-semibold text-amber-200">{totalCount}</p>
                <p className="mt-2 text-sm text-stone-400">Weapons, abilities, armors, rings and pets.</p>
              </div>
              <div className="rounded-3xl border border-amber-900/60 bg-amber-500/10 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-amber-100">Current view</p>
                <p className="mt-3 text-4xl font-semibold text-amber-100">{filtered.length}</p>
                <p className="mt-2 text-sm text-amber-100/80">
                  {tabGroups[activeTab].label} {activeTab !== "all" ? "selected" : "items"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-900/30 bg-stone-900/75 px-4 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <SearchBar value={search} onChange={setSearch} placeholder="Search weapons, armors, rings, abilities or pets..." />
              <div className="flex flex-wrap gap-2">
                {Object.entries(tabGroups).map(([key, tab]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as keyof typeof tabGroups)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      activeTab === key
                        ? "border-amber-500 bg-amber-500/15 text-amber-200"
                        : "border-stone-800 bg-stone-950/70 text-stone-300 hover:border-amber-500 hover:text-amber-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {Object.entries(groupCounts).map(([key, count]) => (
                <div key={key} className="rounded-3xl border border-stone-800/70 bg-stone-950/80 px-4 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">{tabGroups[key as keyof typeof tabGroups].label}</p>
                  <p className="mt-2 text-lg font-semibold text-amber-200">{count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-stone-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing <span className="font-semibold text-amber-200">{filtered.length}</span> of <span className="font-semibold text-amber-200">{totalCount}</span> items
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="self-start text-xs uppercase tracking-[0.3em] text-amber-400 hover:text-amber-200"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-10 pt-8">
        <div className="mb-6 rounded-3xl border border-stone-800/70 bg-stone-900/60 p-5">
          <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-stone-400">
            <div className="text-4xl">🔮</div>
            <p className="text-sm">No items found</p>
            <p className="text-xs text-stone-500">Try adjusting search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
