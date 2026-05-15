import { useEffect, useMemo, useState } from "react";
import { useSearch } from "wouter";
import { Search, Sparkles, Database, LayoutGrid } from "lucide-react";
import SearchBar from "../components/SearchBar";
import FilterBar, { FilterState } from "../components/FilterBar";
import ItemCard from "../components/ItemCard";
import { getAllItems, getFilterOptions, Item } from "../utils/itemData";

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

type TabKey = keyof typeof tabGroups;

type SortMode =
  | "name-asc"
  | "name-desc"
  | "tier-asc"
  | "tier-desc"
  | "damage-desc"
  | "damage-asc"
  | "feedPower-desc"
  | "fameBonus-desc"
  | "category"
  | "itemType";

const sortOptions: Array<{ value: SortMode; label: string }> = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "tier-asc", label: "Tier low → high" },
  { value: "tier-desc", label: "Tier high → low" },
  { value: "damage-desc", label: "Damage high → low" },
  { value: "damage-asc", label: "Damage low → high" },
  { value: "feedPower-desc", label: "Feed Power" },
  { value: "fameBonus-desc", label: "Fame Bonus" },
  { value: "category", label: "Category" },
  { value: "itemType", label: "Item Type" },
];

const emptyFilters: FilterState = {
  category: "",
  subCategory: "",
  itemType: "",
  tier: "",
  bagType: "",
  usableClass: "",
};

function formatCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    daggers: "Daggers",
    swords: "Swords",
    bows: "Bows",
    wands: "Wands",
    staves: "Staffs",
    katanas: "Katanas",
    spellblades: "Spellblades",
    abilities: "Abilities",
    armors: "Armors",
    rings: "Rings",
    pets: "Pets",
  };

  return labels[category] || category;
}

function getNumberValue(value: unknown): number | null {
  if (value == null || value === "" || value === "Unknown") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const text = value.trim();

  const average = text.match(/average:\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (average) return Number(average[1]);

  const range = text.match(/([0-9]+(?:\.[0-9]+)?)\s*[–-]\s*([0-9]+(?:\.[0-9]+)?)/);
  if (range) return (Number(range[1]) + Number(range[2])) / 2;

  const single = text.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (single) return Number(single[1]);

  return null;
}

function getAverageDamage(item: Item): number | null {
  const stats = item.stats || {};

  const values = [
    (item as any).damage,
    stats.damage,
    stats.Damage,
    stats["Damage"],
    stats.projectileDamage,
    stats["Projectile Damage"],
  ];

  for (const value of values) {
    const parsed = getNumberValue(value);
    if (parsed != null) return parsed;
  }

  return null;
}

function getNumericField(item: Item, keys: string[]) {
  const stats = item.stats || {};

  for (const key of keys) {
    const value = (item as any)[key] ?? stats[key];
    const parsed = getNumberValue(value);
    if (parsed != null) return parsed;
  }

  return null;
}

function getTierRank(item: Item) {
  const tier = String(item.tier || "").trim().toUpperCase();

  const tierMatch = tier.match(/^T(\d{1,2})$/);
  if (tierMatch) return Number(tierMatch[1]);

  if (tier.includes("ST") && tier.includes("LIMITED")) return 18;
  if (tier.includes("UT") && tier.includes("LIMITED")) return 17;
  if (tier.startsWith("ST")) return 15;
  if (tier.startsWith("UT")) return 16;

  return 99;
}

function sortItems(items: Item[], sortMode: SortMode) {
  return [...items].sort((a, b) => {
    const nameA = String(a.name || "").toLowerCase();
    const nameB = String(b.name || "").toLowerCase();

    switch (sortMode) {
      case "name-asc":
        return nameA.localeCompare(nameB);

      case "name-desc":
        return nameB.localeCompare(nameA);

      case "tier-asc": {
        const tierA = getTierRank(a);
        const tierB = getTierRank(b);
        if (tierA !== tierB) return tierA - tierB;
        return nameA.localeCompare(nameB);
      }

      case "tier-desc": {
        const tierA = getTierRank(a);
        const tierB = getTierRank(b);
        if (tierA !== tierB) return tierB - tierA;
        return nameA.localeCompare(nameB);
      }

      case "damage-desc": {
        const damageA = getAverageDamage(a);
        const damageB = getAverageDamage(b);
        if (damageA == null && damageB == null) return nameA.localeCompare(nameB);
        if (damageA == null) return 1;
        if (damageB == null) return -1;
        return damageB - damageA;
      }

      case "damage-asc": {
        const damageA = getAverageDamage(a);
        const damageB = getAverageDamage(b);
        if (damageA == null && damageB == null) return nameA.localeCompare(nameB);
        if (damageA == null) return 1;
        if (damageB == null) return -1;
        return damageA - damageB;
      }

      case "feedPower-desc": {
        const feedA = getNumericField(a, ["feedPower", "Feed Power", "feed power"]);
        const feedB = getNumericField(b, ["feedPower", "Feed Power", "feed power"]);
        if (feedA == null && feedB == null) return nameA.localeCompare(nameB);
        if (feedA == null) return 1;
        if (feedB == null) return -1;
        return feedB - feedA;
      }

      case "fameBonus-desc": {
        const fameA = getNumericField(a, ["fameBonus", "Fame Bonus", "XP Bonus", "xp bonus"]);
        const fameB = getNumericField(b, ["fameBonus", "Fame Bonus", "XP Bonus", "xp bonus"]);
        if (fameA == null && fameB == null) return nameA.localeCompare(nameB);
        if (fameA == null) return 1;
        if (fameB == null) return -1;
        return fameB - fameA;
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

export default function Home() {
  const searchParams = useSearch();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sortMode, setSortMode] = useState<SortMode>("name-asc");

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const nextFilters = { ...emptyFilters };

    nextFilters.category = params.get("category") || "";
    nextFilters.subCategory = params.get("subCategory") || "";
    nextFilters.itemType = params.get("itemType") || "";
    nextFilters.tier = params.get("tier") || "";
    nextFilters.bagType = params.get("bagType") || "";
    nextFilters.usableClass = params.get("usableClass") || "";

    setSearch(params.get("search") || "");
    setFilters(nextFilters);
  }, [searchParams]);

  const groupCounts = useMemo(() => {
    return {
      all: allItems.length,
      weapons: allItems.filter((item) => tabGroups.weapons.categories.includes(item.category)).length,
      abilities: allItems.filter((item) => item.category === "abilities").length,
      armors: allItems.filter((item) => item.category === "armors").length,
      rings: allItems.filter((item) => item.category === "rings").length,
      pets: allItems.filter((item) => item.category === "pets").length,
    };
  }, []);

  const filtered = useMemo(() => {
    const results = allItems.filter((item) => {
      const query = search.trim().toLowerCase();

      if (query && !String(item.name || "").toLowerCase().includes(query)) return false;
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

  const hasActiveFilters =
    search ||
    activeTab !== "all" ||
    Object.values(filters).some((value) => Boolean(value));

  const clearAll = () => {
    setSearch("");
    setFilters(emptyFilters);
    setActiveTab("all");
    setSortMode("name-asc");
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-amber-950/80 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.10),_transparent_32%),linear-gradient(180deg,_#120f0c_0%,_#070706_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.38em] text-amber-500/80">
                RotMG Wiki Beta
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-amber-100 sm:text-5xl">
                Item Database
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300 sm:text-base">
                Search and compare weapons, abilities, armors, rings, and pet skins.
                This beta database is still being reviewed and expanded.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-amber-700/60 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200">
                  Beta
                </span>
                <span className="rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-stone-300">
                  Fan project
                </span>
                <span className="rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-stone-300">
                  RealmEye data
                </span>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5 shadow-xl shadow-black/20">
                <div className="flex items-center gap-2 text-stone-400">
                  <Database className="h-4 w-4 text-amber-400" />
                  <p className="text-xs font-bold uppercase tracking-[0.25em]">Total Entries</p>
                </div>
                <p className="mt-3 text-4xl font-black text-amber-200">{allItems.length}</p>
                <p className="mt-1 text-sm text-stone-400">Items currently indexed.</p>
              </div>

              <div className="rounded-2xl border border-amber-800/60 bg-amber-500/10 p-5 shadow-xl shadow-black/20">
                <div className="flex items-center gap-2 text-amber-100">
                  <LayoutGrid className="h-4 w-4 text-amber-300" />
                  <p className="text-xs font-bold uppercase tracking-[0.25em]">Current View</p>
                </div>
                <p className="mt-3 text-4xl font-black text-amber-100">{filtered.length}</p>
                <p className="mt-1 text-sm text-amber-100/75">
                  {tabGroups[activeTab].label}
                </p>
              </div>
            </section>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="rounded-3xl border border-amber-950/70 bg-stone-900/50 p-4 shadow-2xl shadow-black/25">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search weapons, abilities, armors, rings or pets..."
            />

            <div className="rounded-2xl border border-stone-800/80 bg-stone-950/80 px-4 py-3">
              <label htmlFor="sort-mode" className="text-[10px] font-bold uppercase tracking-[0.28em] text-stone-500">
                Sort by
              </label>
              <select
                id="sort-mode"
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="mt-2 w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-sm font-semibold text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.entries(tabGroups) as Array<[TabKey, typeof tabGroups[TabKey]]>).map(([key, tab]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  activeTab === key
                    ? "border-amber-400 bg-amber-500/15 text-amber-100 shadow-lg shadow-amber-950/30"
                    : "border-stone-800 bg-stone-950/70 text-stone-300 hover:border-amber-700 hover:text-amber-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(Object.entries(groupCounts) as Array<[TabKey, number]>).map(([key, count]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-2xl border px-3 py-3 text-left transition ${
                  activeTab === key
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-stone-800 bg-stone-950/75 hover:border-amber-900"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">
                  {tabGroups[key].label}
                </p>
                <p className="mt-1 text-xl font-black text-amber-200">{count}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-stone-800/80 pt-4 text-sm text-stone-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing <span className="font-bold text-amber-200">{filtered.length}</span> of{" "}
              <span className="font-bold text-amber-200">{allItems.length}</span> items
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="self-start text-xs font-bold uppercase tracking-[0.25em] text-amber-400 transition hover:text-amber-200"
              >
                Clear all
              </button>
            )}
          </div>
        </section>

        <div className="mt-5">
          <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
        </div>

        {filtered.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-stone-800 bg-stone-900/40 p-12 text-center">
            <div className="text-4xl">🔮</div>
            <p className="mt-3 text-sm text-stone-300">No items found</p>
            <p className="mt-1 text-xs text-stone-500">Try changing your search or filters.</p>
          </section>
        ) : (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <ItemCard key={item.slug} item={item} />
            ))}
          </section>
        )}

        <footer className="mt-10 border-t border-stone-900 pt-6 text-center text-xs text-stone-500">
          Fan project. Data sourced from{" "}
          <a
            href="https://www.realmeye.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-amber-400 hover:text-amber-300"
          >
            RealmEye
          </a>
          . Not affiliated with DECA Games.
        </footer>
      </main>
    </div>
  );
}
