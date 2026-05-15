import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import reportData from "../data/import-report.json";
import { getAllItems } from "../utils/itemData";

const weaponCategories = [
  "daggers",
  "swords",
  "bows",
  "wands",
  "staves",
  "katanas",
  "spellblades",
];

export default function ImportStats() {
  const allItems = getAllItems();

  const groupCounts = {
    Weapons: allItems.filter((item) => weaponCategories.includes(item.category)).length,
    Abilities: allItems.filter((item) => item.category === "abilities").length,
    Armors: allItems.filter((item) => item.category === "armors").length,
    Rings: allItems.filter((item) => item.category === "rings").length,
    Pets: allItems.filter((item) => item.category === "pets").length,
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-amber-900/40 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-400/70">RotMG Wiki</p>
          <h1 className="text-4xl font-bold text-amber-100 mb-2">Database Stats</h1>
          <p className="text-stone-400 text-sm">A simplified view of the beta database and item coverage.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-amber-900/40 bg-stone-900/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-stone-400">Total items</p>
                <p className="mt-3 text-4xl font-semibold text-amber-200">{allItems.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-amber-500/90" />
            </div>
            <p className="mt-4 text-sm text-stone-500">All available weapon, armor, ring, ability and pet entries loaded for browse.</p>
          </div>

          <div className="rounded-3xl border border-amber-900/40 bg-stone-900/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-stone-400">Data flags</p>
                <p className="mt-3 text-4xl font-semibold text-amber-200">{reportData.duplicates ?? 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500/90" />
            </div>
            <p className="mt-4 text-sm text-stone-500">Duplicate or overlapping entries identified during data review.</p>
          </div>

          <div className="rounded-3xl border border-amber-900/40 bg-stone-900/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-stone-400">Validation issues</p>
                <p className="mt-3 text-4xl font-semibold text-amber-200">{reportData.invalid ?? 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-400/90" />
            </div>
            <p className="mt-4 text-sm text-stone-500">Items with missing or invalid fields that still need review.</p>
          </div>
        </div>

        <section className="rounded-3xl border border-stone-800/70 bg-stone-900/70 p-6">
          <h2 className="text-xl font-semibold text-amber-100">Coverage by group</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(groupCounts).map(([label, count]) => (
              <div key={label} className="rounded-3xl border border-stone-800/60 bg-stone-950/80 p-4">
                <p className="text-sm text-stone-400 uppercase tracking-[0.25em]">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-amber-200">{count}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-stone-800/70 bg-stone-900/70 p-6">
          <h2 className="text-lg font-semibold text-amber-100 mb-3">About this database</h2>
          <div className="space-y-3 text-sm text-stone-400">
            <p>
              This beta view summarizes the current item database and content coverage for weapons, abilities, armors, rings, and pets.
            </p>
            <p>
              Source data is collected from RealmEye and curated for this fan project. Dungeon content is still under preparation.
            </p>
            {reportData.totalImported !== undefined && (
              <p>
                <span className="font-semibold text-amber-200">Latest import size:</span> {reportData.totalImported}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
