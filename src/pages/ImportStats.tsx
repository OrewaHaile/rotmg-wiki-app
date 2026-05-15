import { BarChart3, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import reportData from "../data/import-report.json";
import { getAllItems, getItemStats } from "../utils/itemData";
import { formatCategoryLabel } from "../utils/labels";

export default function ImportStats() {
  const itemStats = getItemStats();
  const allItems = getAllItems();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-amber-900/40 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-amber-100 mb-2">Import Statistics</h1>
          <p className="text-stone-400 text-sm">Data import progress and status</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Total Loaded */}
          <div className="bg-stone-900/60 border border-amber-900/40 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-sm uppercase tracking-[0.1em]">Total Loaded</p>
                <p className="text-4xl font-bold text-amber-200 mt-2">{allItems.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-amber-600/60" />
            </div>
          </div>

          {/* Duplicates */}
          <div className="bg-stone-900/60 border border-cyan-900/40 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-sm uppercase tracking-[0.1em]">Duplicates</p>
                <p className="text-4xl font-bold text-cyan-300 mt-2">{reportData.duplicates ?? 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-cyan-600/60" />
            </div>
          </div>

          {/* Invalid */}
          <div className="bg-stone-900/60 border border-orange-900/40 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-sm uppercase tracking-[0.1em]">Invalid</p>
                <p className="text-4xl font-bold text-orange-300 mt-2">{reportData.invalid ?? 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600/60" />
            </div>
          </div>

          {/* Imported (Historical) */}
          <div className="bg-stone-900/60 border border-stone-800/40 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-sm uppercase tracking-[0.1em]">Imported</p>
                <p className="text-4xl font-bold text-stone-300 mt-2">{reportData.totalImported ?? 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-stone-600/60" />
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-stone-900/60 border border-amber-900/40 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-amber-100 mb-4">Items by Category</h2>
          <div className="space-y-3">
            {Object.entries(itemStats.categories).map(([category, count]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm capitalize font-medium text-stone-300">{formatCategoryLabel(category)}</span>
                  <span className="text-sm font-bold text-amber-300">{count}</span>
                </div>
                <div className="w-full bg-stone-800/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-700 to-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${(count / Math.max(...Object.values(itemStats.categories))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Import Report Info */}
        <div className="bg-stone-900/40 border border-stone-800/60 rounded-lg p-6">
          <h2 className="text-lg font-bold text-stone-300 mb-3">About This Data</h2>
          <div className="space-y-2 text-sm text-stone-400">
            <p>
              <span className="text-amber-400 font-medium">Total Loaded:</span> Items successfully loaded from JSON data files
            </p>
            <p>
              <span className="text-cyan-400 font-medium">Duplicates:</span> Items with duplicate IDs (cleaned up during import)
            </p>
            <p>
              <span className="text-orange-400 font-medium">Invalid:</span> Data files that failed validation
            </p>
            <p>
              <span className="text-stone-300 font-medium">Imported:</span> Original count from last import batch
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
