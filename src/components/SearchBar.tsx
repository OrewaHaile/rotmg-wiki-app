import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4 pointer-events-none" />
      <input
        type="search"
        placeholder="Search items..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-stone-900 border border-amber-900/60 text-amber-100 placeholder-stone-500 rounded-md pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/40 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
