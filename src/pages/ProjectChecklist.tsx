import { Link } from "wouter";
import { CheckCircle, Circle, Clock3, Flag } from "lucide-react";
import { getAllItems } from "../utils/itemData";
import stSetsData from "../data/st-sets.json";
import classSkinsData from "../data/class-skins.json";
import gameUpdatesData from "../data/game-updates.json";
import checklistData from "../data/project-checklist.json";

interface ChecklistItem {
  title: string;
  status: "done" | "progress" | "todo" | "review";
  notes: string;
}

interface ChecklistGroup {
  group: string;
  items: ChecklistItem[];
}

function getStatusIcon(status: ChecklistItem["status"]) {
  switch (status) {
    case "done":
      return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    case "progress":
      return <Clock3 className="h-4 w-4 text-amber-300" />;
    case "review":
      return <Flag className="h-4 w-4 text-sky-300" />;
    default:
      return <Circle className="h-4 w-4 text-stone-500" />;
  }
}

function getStatusStyles(status: ChecklistItem["status"]) {
  switch (status) {
    case "done":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "progress":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "review":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200";
    default:
      return "border-stone-700 bg-stone-950 text-stone-300";
  }
}

function isChecklistGroup(data: unknown): data is ChecklistGroup[] {
  return Array.isArray(data);
}

function normalizeChecklist(data: unknown): ChecklistGroup[] {
  if (!isChecklistGroup(data)) {
    return [];
  }

  return data.map((group) => ({
    group: typeof group.group === "string" ? group.group : "Unknown",
    items: Array.isArray(group.items)
      ? group.items.map((item) => ({
          title: typeof item === "object" && item !== null && typeof (item as any).title === "string" ? (item as any).title : "Untitled",
          status:
            typeof item === "object" && item !== null && typeof (item as any).status === "string"
              ? (item as any).status
              : "todo",
          notes: typeof item === "object" && item !== null && typeof (item as any).notes === "string" ? (item as any).notes : "",
        }))
      : [],
  }));
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

export default function ProjectChecklist() {
  const checklist = normalizeChecklist(checklistData);
  const allItems = getAllItems();
  const stSetsCount = Array.isArray(stSetsData) ? stSetsData.filter((set: any) => set?.id !== "example-st-set").length : 0;
  const classSkinsCount = Array.isArray(classSkinsData) ? classSkinsData.filter((skin: any) => skin && typeof skin === "object" && "id" in skin).length : 0;
  const currentVersion = typeof gameUpdatesData.currentVersion === "string" ? gameUpdatesData.currentVersion : "Unknown";

  const totalItems = checklist.reduce((sum, group) => sum + group.items.length, 0);
  const doneCount = checklist.reduce((sum, group) => sum + group.items.filter((item) => item.status === "done").length, 0);
  const progressCount = checklist.reduce((sum, group) => sum + group.items.filter((item) => item.status === "progress").length, 0);
  const reviewCount = checklist.reduce((sum, group) => sum + group.items.filter((item) => item.status === "review").length, 0);
  const todoCount = checklist.reduce((sum, group) => sum + group.items.filter((item) => item.status === "todo").length, 0);
  const completionPercent = totalItems ? Math.round((doneCount / totalItems) * 100) : 0;

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-amber-900/40 bg-stone-900/80 p-6 sm:p-8 shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-400/70">Temporary development checklist — safe to remove later.</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-black text-amber-100">Project Checklist</h1>
              <p className="mt-3 text-sm leading-6 text-stone-300">Track current implementation status and project progress for the RotMG Wiki app.</p>
            </div>
            <Link href="/">
              <button className="rounded-full border border-amber-800/50 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20">
                Back to Home
              </button>
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-stone-800 bg-stone-950/90 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Total items</p>
              <p className="mt-3 text-3xl font-black text-amber-200">{formatNumber(allItems.length)}</p>
            </div>
            <div className="rounded-3xl border border-stone-800 bg-stone-950/90 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">ST sets</p>
              <p className="mt-3 text-3xl font-black text-amber-200">{formatNumber(stSetsCount)}</p>
            </div>
            <div className="rounded-3xl border border-stone-800 bg-stone-950/90 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Class skins</p>
              <p className="mt-3 text-3xl font-black text-amber-200">{formatNumber(classSkinsCount)}</p>
            </div>
            <div className="rounded-3xl border border-stone-800 bg-stone-950/90 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Current version</p>
              <p className="mt-3 text-3xl font-black text-amber-200">{currentVersion}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-800 bg-stone-900/80 p-6 sm:p-8 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-amber-100">Checklist Summary</h2>
              <p className="mt-2 text-sm text-stone-400">Review current progress and item status for each development area.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-emerald-200">Done {doneCount}</span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-amber-200">In progress {progressCount}</span>
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-sky-200">Review {reviewCount}</span>
              <span className="rounded-full border border-stone-700/50 bg-stone-950/80 px-3 py-1 text-xs uppercase tracking-[0.25em] text-stone-300">To do {todoCount}</span>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-stone-800 bg-stone-950/90 p-4">
            <div className="overflow-hidden rounded-full bg-stone-900/80">
              <div className="h-3 rounded-full bg-amber-400 transition-all" style={{ width: `${completionPercent}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-stone-400">
              <span>{doneCount} of {totalItems} done</span>
              <span>{completionPercent}% complete</span>
            </div>
          </div>
        </section>

        <div className="grid gap-5">
          {checklist.map((group) => (
            <section key={group.group} className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-5 sm:p-6">
              <h3 className="text-xl font-black text-amber-100">{group.group}</h3>
              <div className="mt-4 grid gap-3">
                {group.items.map((item) => (
                  <div key={item.title} className="flex flex-col gap-3 rounded-3xl border border-stone-800 bg-stone-950/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${getStatusStyles(item.status)}`}>
                        {getStatusIcon(item.status)}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-amber-100">{item.title}</p>
                        <p className="mt-1 text-sm text-stone-400">{item.notes}</p>
                      </div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${getStatusStyles(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
