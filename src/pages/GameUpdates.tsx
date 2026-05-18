import { ExternalLink } from "lucide-react";
import gameUpdatesData from "../data/game-updates.json";

interface GameUpdateLink {
  text: string;
  href: string;
}

interface GameUpdateChange {
  title: string;
  date: string;
  content: string[];
  links: GameUpdateLink[];
}

interface GameUpdatesData {
  currentVersion: string;
  lastImported: string;
  sourceUrl: string;
  changes: GameUpdateChange[];
}

function normalizeGameUpdates(data: unknown): GameUpdatesData {
  const raw = (data as GameUpdatesData) ?? {};
  return {
    currentVersion: typeof raw.currentVersion === "string" ? raw.currentVersion : "",
    lastImported: typeof raw.lastImported === "string" ? raw.lastImported : "",
    sourceUrl:
      typeof raw.sourceUrl === "string"
        ? raw.sourceUrl
        : "https://www.realmeye.com/wiki/realm-of-the-mad-god",
    changes: Array.isArray(raw.changes)
      ? raw.changes.map((change) => ({
          title:
            typeof change === "object" && change !== null && typeof (change as any).title === "string"
              ? (change as any).title
              : "",
          date:
            typeof change === "object" && change !== null && typeof (change as any).date === "string"
              ? (change as any).date
              : "",
          content: Array.isArray((change as any).content)
            ? (change as any).content.filter((item) => typeof item === "string")
            : [],
          links: Array.isArray((change as any).links)
            ? (change as any).links
                .filter(
                  (link) =>
                    typeof link === "object" &&
                    link !== null &&
                    typeof (link as any).text === "string" &&
                    typeof (link as any).href === "string"
                )
                .map((link) => ({
                  text: (link as any).text,
                  href: (link as any).href,
                }))
            : [],
        }))
      : [],
  };
}

function formatImportedDate(value: string) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GameUpdates() {
  const source = normalizeGameUpdates(gameUpdatesData);
  const hasChanges = source.changes.length > 0;

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-amber-900/40 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_36%),linear-gradient(180deg,_#0c0a09_0%,_#110f0d_100%)] p-6 sm:p-8 shadow-2xl shadow-black/40">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-400/80 font-bold">RotMG Wiki</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-amber-100 sm:text-4xl">Game Updates</h1>
              <p className="mt-3 text-sm leading-6 text-stone-300 sm:text-base">
                Track current version and recent RealmEye changes.
              </p>
            </div>
            <a
              href={source.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-800/50 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20"
            >
              View on RealmEye
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Current Version</p>
              <p className="mt-3 text-2xl font-black text-amber-200 break-words">{source.currentVersion || "Unknown"}</p>
              <p className="mt-2 text-sm text-stone-400">
                Imported on {formatImportedDate(source.lastImported)}
              </p>
            </div>
            <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Imported data</p>
              <p className="mt-3 text-2xl font-black text-amber-200">{source.changes.length}</p>
              <p className="mt-2 text-sm text-stone-400">change entries</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-800 bg-stone-900/80 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-amber-100">Recent changes</h2>
              <p className="mt-2 text-sm text-stone-400">A summary of the most recent imported RealmEye update information.</p>
            </div>
            <span className="inline-flex shrink-0 rounded-full border border-amber-700/50 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-amber-200">
              {source.changes.length} entries
            </span>
          </div>

          {hasChanges ? (
            <div className="mt-6 grid gap-4">
              {source.changes.map((change, index) => (
                <article
                  key={`${change.title}-${index}`}
                  className="rounded-3xl border border-stone-800 bg-stone-900/70 p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-amber-100">{change.title || "Update"}</h3>
                      {change.date && <p className="mt-1 text-sm text-stone-400">{change.date}</p>}
                    </div>
                    {change.links.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {change.links.slice(0, 3).map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-amber-800/50 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20"
                          >
                            {link.text}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {change.content.length > 0 ? (
                    <ul className="mt-5 space-y-2 pl-5 text-sm leading-6 text-stone-300 list-disc">
                      {change.content.map((line, idx) => (
                        <li key={`${line}-${idx}`}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-5 text-sm text-stone-400">No detailed change lines could be extracted.</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-stone-800 bg-stone-950/60 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-800/50 bg-amber-500/10 text-3xl text-amber-300">
                📜
              </div>
              <h3 className="mt-5 text-2xl font-black text-amber-100">No update details found</h3>
              <p className="mt-3 text-sm leading-6 text-stone-400">
                The importer did not find recent change details. Run the import script again to refresh the static JSON.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
