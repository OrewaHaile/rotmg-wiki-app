import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Save, RotateCcw, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { Link } from "wouter";

const itemModules = import.meta.glob("../data/items/*.json", { eager: true });
const allItems: any[] = Object.values(itemModules).map((m: any) => m.default ?? m);

const API = "/api";

const ALL_CLASSES = [
  "Archer", "Assassin", "Bard", "Huntress", "Knight", "Mystic",
  "Necromancer", "Ninja", "Paladin", "Priest", "Rogue", "Samurai",
  "Sorcerer", "Trickster", "Warrior", "Wizard",
];

const ITEM_TYPES = [
  "Sword", "Dagger", "Staff", "Wand", "Bow", "Tome", "Shield",
  "Helm", "Seal", "Cloak", "Quiver", "Ring", "Ability", "Other",
];

const BAG_TYPES = ["Brown", "Blue", "Purple", "Orange", "Cyan", "White"];

// ─── Field components ─────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-widest text-amber-600/80 mb-1">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-stone-900 border border-amber-900/50 text-amber-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 placeholder-stone-600 transition-colors"
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full bg-stone-900 border border-amber-900/50 text-amber-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 placeholder-stone-600 transition-colors resize-y"
    />
  );
}

function TagListEditor({
  values,
  onChange,
  suggestions,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
  };

  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="flex items-center gap-1 text-xs text-amber-200 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(v)}
              className="text-amber-600 hover:text-red-400 transition-colors ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {suggestions ? (
        <div className="flex flex-wrap gap-1">
          {suggestions
            .filter((s) => !values.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="text-xs text-stone-400 hover:text-amber-300 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/40 px-2 py-0.5 rounded transition-colors"
              >
                + {s}
              </button>
            ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); add(input); }
            }}
            placeholder={placeholder ?? "Type and press Enter"}
            className="flex-1 bg-stone-900 border border-amber-900/50 text-amber-100 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-amber-600 placeholder-stone-600 transition-colors"
          />
          <button
            type="button"
            onClick={() => add(input)}
            className="text-xs text-amber-600 hover:text-amber-400 border border-amber-800/50 hover:border-amber-600/50 px-3 py-1.5 rounded-md transition-colors"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-stone-900 border border-amber-900/50 text-amber-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-colors"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Status = "idle" | "saving" | "saved" | "error";

export default function ItemEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const original = allItems.find((i) => i.slug === slug);

  const [form, setForm] = useState<any>(original ? { ...original } : null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (original) setForm({ ...original });
  }, [slug]);

  if (!original || !form) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4 text-center space-y-4">
        <div className="text-5xl">⚔️</div>
        <h2 className="text-amber-200 text-lg font-semibold">Item Not Found</h2>
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-amber-500 border border-amber-800/50 px-4 py-2 rounded-lg">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>
        </Link>
      </div>
    );
  }

  const field = (key: string) => (v: string) => setForm((f: any) => ({ ...f, [key]: v }));
  const reset = () => setForm({ ...original });

  const save = async () => {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`${API}/items/${form.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: Number(form.id),
          soulbound: Boolean(form.soulbound),
          stats: form.stats ?? {},
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message ?? "Unknown error");
    }
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-5 pb-28">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <Link href={`/item/${slug}`}>
            <button className="flex items-center gap-1.5 text-stone-400 hover:text-amber-400 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
          <h1 className="flex-1 text-amber-100 font-bold truncate">{form.name}</h1>
          <span className="text-xs text-amber-600 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
            Editing
          </span>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); save(); }}
          className="space-y-5"
        >
          {/* Identity */}
          <section className="bg-stone-950 border border-amber-900/40 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600/80">Identity</h2>
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={field("name")} />
            </div>
            <div>
              <Label>Sprite URL</Label>
              <Input value={form.spriteUrl} onChange={field("spriteUrl")} placeholder="https://..." />
            </div>
            {form.spriteUrl && form.spriteUrl !== "Unknown" && (
              <img
                src={form.spriteUrl}
                alt="Sprite preview"
                className="w-12 h-12 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            )}
            <div>
              <Label>Source URL</Label>
              <Input value={form.sourceUrl} onChange={field("sourceUrl")} placeholder="https://www.realmeye.com/wiki/..." />
            </div>
          </section>

          {/* Classification */}
          <section className="bg-stone-950 border border-amber-900/40 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600/80">Classification</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Item Type</Label>
                <SelectField value={form.itemType} onChange={field("itemType")} options={ITEM_TYPES} />
              </div>
              <div>
                <Label>Tier</Label>
                <Input value={form.tier} onChange={field("tier")} placeholder="T12 / UT / ST" />
              </div>
              <div>
                <Label>Bag Type</Label>
                <SelectField value={form.bagType} onChange={field("bagType")} options={BAG_TYPES} />
              </div>
              <div>
                <Label>Soulbound</Label>
                <SelectField
                  value={form.soulbound ? "true" : "false"}
                  onChange={(v) => setForm((f: any) => ({ ...f, soulbound: v === "true" }))}
                  options={["true", "false"]}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fame Bonus</Label>
                <Input value={form.fameBonus} onChange={field("fameBonus")} placeholder="4%" />
              </div>
              <div>
                <Label>Feed Power</Label>
                <Input value={form.feedPower} onChange={field("feedPower")} placeholder="500" />
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-stone-950 border border-amber-900/40 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600/80">Description</h2>
            <Textarea value={form.description} onChange={field("description")} rows={3} />
          </section>

          {/* Combat Stats */}
          <section className="bg-stone-950 border border-amber-900/40 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600/80">Combat Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Damage</Label>
                <Input value={form.damage} onChange={field("damage")} placeholder="120-185" />
              </div>
              <div>
                <Label>Range</Label>
                <Input value={form.range} onChange={field("range")} placeholder="4.0" />
              </div>
              <div>
                <Label>Rate of Fire</Label>
                <Input value={form.rateOfFire} onChange={field("rateOfFire")} placeholder="130%" />
              </div>
              <div>
                <Label>Shots</Label>
                <Input value={form.shots} onChange={field("shots")} placeholder="1" />
              </div>
              <div>
                <Label>Projectiles</Label>
                <Input value={form.projectiles} onChange={field("projectiles")} placeholder="1" />
              </div>
            </div>
          </section>

          {/* Effects */}
          <section className="bg-stone-950 border border-amber-900/40 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600/80">Effects</h2>
            <TagListEditor
              values={form.effects ?? []}
              onChange={(v) => setForm((f: any) => ({ ...f, effects: v }))}
              placeholder="e.g. Armor Piercing"
            />
          </section>

          {/* Usable Classes */}
          <section className="bg-stone-950 border border-amber-900/40 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600/80">Usable Classes</h2>
            <TagListEditor
              values={form.usableClasses ?? []}
              onChange={(v) => setForm((f: any) => ({ ...f, usableClasses: v }))}
              suggestions={ALL_CLASSES}
            />
          </section>

          {/* Drops From */}
          <section className="bg-stone-950 border border-amber-900/40 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600/80">Drops From</h2>
            <TagListEditor
              values={form.dropsFrom ?? []}
              onChange={(v) => setForm((f: any) => ({ ...f, dropsFrom: v }))}
              placeholder="e.g. Oryx the Mad God 3"
            />
          </section>

          {/* Notes */}
          <section className="bg-stone-950 border border-amber-900/40 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600/80">Notes</h2>
            <Textarea value={form.notes ?? ""} onChange={field("notes")} rows={2} />
          </section>
        </form>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-stone-950/95 backdrop-blur border-t border-amber-900/40 px-4 py-3 z-20">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {status === "error" && (
            <div className="flex-1 flex items-center gap-1.5 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">{errorMsg}</span>
            </div>
          )}
          {status === "saved" && (
            <div className="flex-1 flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Saved to disk
            </div>
          )}
          {(status === "idle" || status === "saving") && (
            <p className="flex-1 text-xs text-stone-500">
              {isDirty ? "Unsaved changes" : "No changes"}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            disabled={!isDirty || status === "saving"}
            className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg border border-stone-800 hover:border-amber-800/50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            type="button"
            onClick={save}
            disabled={!isDirty || status === "saving"}
            className="flex items-center gap-1.5 text-sm font-medium text-stone-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg"
          >
            {status === "saving" ? (
              <Loader className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
