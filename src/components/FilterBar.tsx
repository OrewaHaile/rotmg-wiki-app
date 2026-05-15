import { ChevronDown, SlidersHorizontal } from "lucide-react";

export interface FilterState {
  category: string;
  subCategory: string;
  itemType: string;
  tier: string;
  bagType: string;
  usableClass: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  options: {
    categories: string[];
    subCategories: string[];
    itemTypes: string[];
    tiers: string[];
    bagTypes: string[];
    classes: string[];
  };
}

interface SelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function formatLabel(value: string) {
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

  return labels[value] || value;
}

function FilterSelect({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-xl border border-stone-800/80 bg-stone-950/80 px-3 pr-8 text-sm text-stone-200 outline-none transition hover:border-amber-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-500" />
    </div>
  );
}

export default function FilterBar({ filters, onChange, options }: FilterBarProps) {
  const update = (key: keyof FilterState) => (value: string) =>
    onChange({ ...filters, [key]: value });

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <section className="rounded-2xl border border-stone-800/80 bg-stone-900/35 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-stone-400">
            Advanced filters
          </h2>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() =>
              onChange({
                category: "",
                subCategory: "",
                itemType: "",
                tier: "",
                bagType: "",
                usableClass: "",
              })
            }
            className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400 transition hover:text-amber-200"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <FilterSelect
          label="Category"
          value={filters.category}
          options={options.categories}
          onChange={update("category")}
        />
        <FilterSelect
          label="Subcategory"
          value={filters.subCategory}
          options={options.subCategories}
          onChange={update("subCategory")}
        />
        <FilterSelect
          label="Type"
          value={filters.itemType}
          options={options.itemTypes}
          onChange={update("itemType")}
        />
        <FilterSelect
          label="Tier"
          value={filters.tier}
          options={options.tiers}
          onChange={update("tier")}
        />
        <FilterSelect
          label="Bag"
          value={filters.bagType}
          options={options.bagTypes}
          onChange={update("bagType")}
        />
        <FilterSelect
          label="Class"
          value={filters.usableClass}
          options={options.classes}
          onChange={update("usableClass")}
        />
      </div>
    </section>
  );
}
