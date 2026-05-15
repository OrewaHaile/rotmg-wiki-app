import { Link } from "wouter";

export default function Dungeons() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 px-4 py-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <section className="rounded-[2rem] border border-amber-900/40 bg-stone-900/70 p-8 shadow-xl shadow-amber-900/10">
          <p className="text-amber-500 uppercase tracking-[0.35em] text-xs font-bold">RotMG Wiki</p>
          <h1 className="text-5xl font-bold text-amber-100 mt-4">Dungeons</h1>
          <p className="mt-4 max-w-2xl text-stone-300 text-base leading-7">
            Dungeon pages, bosses, and loot tables are being prepared. The dungeon database is currently under review for the next beta release.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-900/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Coming soon
          </div>
        </section>

        <section className="rounded-3xl border border-stone-800/60 bg-stone-900/60 p-6">
          <h2 className="text-xl font-semibold text-amber-200">What’s coming next</h2>
          <p className="mt-3 text-stone-400">We are preparing the dungeon content, including RealmEye dungeon pages, boss encounters, and drop tables for future browsing.</p>

          <ul className="mt-5 space-y-3 text-stone-400 text-sm">
            <li>• Dungeon list with descriptions and access requirements</li>
            <li>• Boss details, locations, and loot sources</li>
            <li>• Drops, table info, and item rewards</li>
            <li>• Full dungeon detail pages for in-depth reference</li>
          </ul>

          <Link href="/">
            <button className="mt-7 rounded-2xl border border-amber-800 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15">
              Back to Home
            </button>
          </Link>
        </section>
      </main>
    </div>
  );
}
