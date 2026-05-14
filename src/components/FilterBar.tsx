import { ChevronDown } from "lucide-react";

export interface FilterState {
  category: string;
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

function FilterSelect({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="relative flex-1 min-w-[120px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-stone-900 border border-amber-900/60 text-amber-100 rounded-md px-3 py-2 text-sm pr-7 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/40 transition-colors cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-600 pointer-events-none" />
    </div>
  );
}

export default function FilterBar({ filters, onChange, options }: FilterBarProps) {
  const update = (key: keyof FilterState) => (val: string) =>
    onChange({ ...filters, [key]: val });

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <FilterSelect
          label="Category"
          value={filters.category}
          options={options.categories}
          onChange={update("category")}
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
      {hasFilters && (
        <button
          onClick={() =>
            onChange({ category: "", itemType: "", tier: "", bagType: "", usableClass: "" })
          }
          className="text-xs text-amber-600 hover:text-amber-400 transition-colors underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
