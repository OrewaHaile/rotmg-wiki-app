import { Link } from "wouter";

export default function Dungeons() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 px-4 py-8">
      <main className="max-w-5xl mx-auto">
        <section className="rounded-3xl border border-amber-900/50 bg-stone-900/40 p-6 mb-6">
          <p className="text-amber-500 uppercase tracking-[0.35em] text-xs font-bold">
            RotMG Wiki
          </p>

          <h1 className="text-4xl font-bold text-amber-100 mt-3">
            Dungeons
          </h1>

          <p className="text-stone-400 mt-3">
            Dungeon database is being prepared. We are still fixing the importer to pull real dungeon pages and drops from RealmEye.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6">
          <h2 className="text-xl font-bold text-amber-200 mb-3">
            Coming next
          </h2>

          <ul className="space-y-2 text-stone-400 text-sm">
            <li>• Real dungeon list</li>
            <li>• Bosses</li>
            <li>• Drops / loot tables</li>
            <li>• Dungeon detail pages</li>
          </ul>

          <Link href="/">
            <button className="mt-6 rounded-xl border border-amber-800 bg-amber-950/50 px-4 py-2 text-amber-200 hover:bg-amber-900/60 transition">
              Back to Items
            </button>
          </Link>
        </section>
      </main>
    </div>
  );
}
