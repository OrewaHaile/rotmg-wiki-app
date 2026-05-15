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

type SortMode =
  | "name-asc"
  | "name-desc"
  | "tier-asc"
  | "tier-desc"
  | "damage-asc"
  | "damage-desc"
  | "feedPower-desc"
  | "fameBonus-desc"
  | "category"
  | "itemType";

const sortLabels: Record<SortMode, string> = {
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  "tier-asc": "Tier low to high",
  "tier-desc": "Tier high to low",
  "damage-asc": "Damage low to high",
  "damage-desc": "Damage high to low",
  "feedPower-desc": "Feed Power high to low",
  "fameBonus-desc": "Fame Bonus high to low",
  category: "Category",
  itemType: "Item Type",
};

const sortOptions: Array<{ value: SortMode; label: string }> = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "tier-asc", label: "Tier low to high" },
  { value: "tier-desc", label: "Tier high to low" },
  { value: "damage-asc", label: "Damage low to high" },
  { value: "damage-desc", label: "Damage high to low" },
  { value: "feedPower-desc", label: "Feed Power high to low" },
  { value: "fameBonus-desc", label: "Fame Bonus high to low" },
  { value: "category", label: "Category" },
  { value: "itemType", label: "Item Type" },
];

function getNumberValue(value: unknown): number | null {
  if (value == null || value === "" || value === "Unknown") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();
  const averageMatch = text.match(/average:\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (averageMatch) {
    return parseFloat(averageMatch[1]);
  }

  const rangeMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*[–-]\s*([0-9]+(?:\.[0-9]+)?)/);
  if (rangeMatch) {
    return (parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2;
  }

  const numberMatch = text.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (numberMatch) {
    return parseFloat(numberMatch[1]);
  }

  return null;
}

function getAverageDamage(item: any): number | null {
  const damageTargets = [
    item.damage,
    item.stats?.damage,
    item.stats?.Damage,
    item.stats?.["Damage"],
    item.stats?.projectileDamage,
    item.stats?.["projectileDamage"],
  ];

  for (const target of damageTargets) {
    const value = getNumberValue(target);
    if (value != null) {
      return value;
    }
  }

  return null;
}

function getNumericField(item: any, names: string[]): number | null {
  for (const name of names) {
    const value = item[name] ?? item.stats?.[name];
    const parsed = getNumberValue(value);
    if (parsed != null) {
      return parsed;
    }
  }
  return null;
}

function getTierRank(item: any): number {
  const tier = item.tier ? String(item.tier).trim() : "";
  const normalized = tier.toUpperCase();

  if (/^T(\d{1,2})$/.test(normalized)) {
    return Number(normalized.slice(1));
  }
  if (normalized.startsWith("ST") && normalized.includes("LIMITED")) {
    return 18;
  }
  if (normalized.startsWith("UT") && normalized.includes("LIMITED")) {
    return 17;
  }
  if (normalized.startsWith("ST")) {
    return 15;
  }
  if (normalized.startsWith("UT")) {
    return 16;
  }
  return 99;
}

function sortItems(items: typeof allItems, sortMode: SortMode) {
  return [...items].sort((a, b) => {
    const nameA = String(a.name || "").toLowerCase();
    const nameB = String(b.name || "").toLowerCase();

    switch (sortMode) {
      case "name-asc":
        return nameA.localeCompare(nameB);
      case "name-desc":
        return nameB.localeCompare(nameA);
      case "tier-asc": {
        const rankA = getTierRank(a);
        const rankB = getTierRank(b);
        if (rankA !== rankB) return rankA - rankB;
        return nameA.localeCompare(nameB);
      }
      case "tier-desc": {
        const rankA = getTierRank(a);
        const rankB = getTierRank(b);
        if (rankA !== rankB) return rankB - rankA;
        return nameA.localeCompare(nameB);
      }
      case "damage-asc": {
        const damageA = getAverageDamage(a);
        const damageB = getAverageDamage(b);
        if (damageA == null && damageB == null) return nameA.localeCompare(nameB);
        if (damageA == null) return 1;
        if (damageB == null) return -1;
        if (damageA !== damageB) return damageA - damageB;
        return nameA.localeCompare(nameB);
      }
      case "damage-desc": {
        const damageA = getAverageDamage(a);
        const damageB = getAverageDamage(b);
        if (damageA == null && damageB == null) return nameA.localeCompare(nameB);
        if (damageA == null) return 1;
        if (damageB == null) return -1;
        if (damageA !== damageB) return damageB - damageA;
        return nameA.localeCompare(nameB);
      }
      case "feedPower-desc": {
        const feedA = getNumericField(a, ["feedPower", "feed power", "Feed Power"]);
        const feedB = getNumericField(b, ["feedPower", "feed power", "Feed Power"]);
        if (feedA == null && feedB == null) return nameA.localeCompare(nameB);
        if (feedA == null) return 1;
        if (feedB == null) return -1;
        if (feedA !== feedB) return feedB - feedA;
        return nameA.localeCompare(nameB);
      }
      case "fameBonus-desc": {
        const fameA = getNumericField(a, ["fameBonus", "fame bonus", "Fame Bonus", "xp bonus"]);
        const fameB = getNumericField(b, ["fameBonus", "fame bonus", "Fame Bonus", "xp bonus"]);
        if (fameA == null && fameB == null) return nameA.localeCompare(nameB);
        if (fameA == null) return 1;
        if (fameB == null) return -1;
        if (fameA !== fameB) return fameB - fameA;
        return nameA.localeCompare(nameB);
      }
      case "category": {
        const catA = String(a.category || "").toLowerCase();
        const catB = String(b.category || "").toLowerCase();
        if (catA !== catB) return catA.localeCompare(catB);
        return nameA.localeCompare(nameB);
      }
      case "itemType": {
        const typeA = String(a.itemType || "").toLowerCase();
        const typeB = String(b.itemType || "").toLowerCase();
        if (typeA !== typeB) return typeA.localeCompare(typeB);
        return nameA.localeCompare(nameB);
      }
      default:
        return nameA.localeCompare(nameB);
    }
  });
}

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
  const [sortMode, setSortMode] = useState<SortMode>("name-asc");

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
    const results = allItems.filter((item) => {
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

    return sortItems(results, sortMode);
  }, [search, filters, activeTab, sortMode]);

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
            <div className="grid gap-4 xl:grid-cols-[1.4fr_auto] xl:items-center">
              <div className="grid gap-4 w-full sm:grid-cols-[minmax(0,1fr)_220px]">
                <SearchBar value={search} onChange={setSearch} placeholder="Search weapons, armors, rings, abilities or pets..." />
                <div className="rounded-3xl border border-stone-800/70 bg-stone-950/80 p-4">
                  <label htmlFor="home-sort" className="text-xs uppercase tracking-[0.35em] text-stone-500">
                    Sort by
                  </label>
                  <select
                    id="home-sort"
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                    className="mt-2 w-full rounded-2xl border border-stone-800/70 bg-stone-900/90 px-3 py-2 text-sm text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-3 text-xs text-stone-400">
                    Sorted by <span className="font-semibold text-amber-200">{sortLabels[sortMode]}</span>
                  </p>
                </div>
              </div>

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
