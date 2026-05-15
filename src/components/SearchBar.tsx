import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search items...",
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4 pointer-events-none" />

      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-12 rounded-2xl border border-amber-900/50 bg-stone-950/80 pl-11 pr-11 text-sm text-amber-100 placeholder:text-stone-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-amber-300"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
