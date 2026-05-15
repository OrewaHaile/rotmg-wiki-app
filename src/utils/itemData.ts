export interface Item {
  id: string;
  name: string;
  slug: string;
  category: string;
  subCategory?: string;
  sprite?: string;
  spriteUrl?: string;
  icon?: string;
  itemType: string;
  tier: string;
  bagType: string;
  soulbound?: boolean;
  description?: string;
  stats?: Record<string, unknown>;
  effects?: string[];
  usableClasses?: string[];
  dropsFrom?: string[];
  notes?: string[] | string;
  sourceUrl?: string;
}

const itemModules = import.meta.glob<Partial<Item>>(
  [
    "../data/daggers/*.json",
    "../data/swords/*.json",
    "../data/bows/*.json",
    "../data/wands/*.json",
    "../data/staves/*.json",
    "../data/katanas/*.json",
    "../data/spellblades/*.json",
    "../data/armors/*.json",
    "../data/rings/*.json",
    "../data/abilities/*.json",
    "../data/pets/*.json"
  ],
  {
    eager: true,
    import: "default"
  }
);

function getCategoryFromPath(path: string): string {
  const match = path.match(/data\/([^/]+)\//);
  return match?.[1] ?? "items";
}

function getSlugFromPath(path: string): string {
  return path.split("/").pop()?.replace(".json", "") ?? "";
}

function normalizeItem(item: Partial<Item>, path: string): Item {
  const slug = item.slug || getSlugFromPath(path);
  const category = item.category || getCategoryFromPath(path);
  const subCategory = item.subCategory || "";

  return {
    id: item.id || slug,
    name: item.name || slug,
    slug,
    category,
    subCategory,
    sprite: item.sprite || item.spriteUrl || item.icon || `/items/${slug}.png`,
    spriteUrl: item.spriteUrl,
    icon: item.icon,
    itemType: item.itemType || "Unknown",
    tier: item.tier || "",
    bagType: item.bagType || "",
    soulbound: item.soulbound ?? false,
    description: item.description || "",
    stats: item.stats || {},
    effects: item.effects || [],
    usableClasses: item.usableClasses || [],
    dropsFrom: item.dropsFrom || [],
    notes: item.notes || [],
    sourceUrl: item.sourceUrl || ""
  };
}

const allItems: Item[] = Object.entries(itemModules)
  .map(([path, item]) => normalizeItem(item, path))
  .filter((item) => item.name && item.slug)
  .sort((a, b) => a.name.localeCompare(b.name));

export function getAllItems(): Item[] {
  return allItems;
}

export function getItemBySlug(slug: string): Item | undefined {
  return allItems.find((item) => item.slug === slug);
}

export function getItemsByCategory(category: string): Item[] {
  return allItems.filter((item) => item.category === category);
}

export function getCategories(): string[] {
  return [...new Set(allItems.map((item) => item.category))].sort();
}

export function getFilterOptions() {
  const categories = [...new Set(allItems.map((item) => item.category).filter(Boolean))].sort();
  const subCategories = [...new Set(allItems.map((item) => item.subCategory || "").filter(Boolean))].sort();
  const itemTypes = [...new Set(allItems.map((item) => item.itemType).filter(Boolean))].sort();
  const tiers = [...new Set(allItems.map((item) => item.tier).filter(Boolean))].sort();
  const bagTypes = [...new Set(allItems.map((item) => item.bagType).filter(Boolean))].sort();
  const classes = [
    ...new Set(allItems.flatMap((item) => item.usableClasses || []).filter(Boolean))
  ].sort();

  return {
    categories,
    subCategories,
    itemTypes,
    tiers,
    bagTypes,
    classes,
    usableClasses: classes
  };
}

export function getItemStats() {
  const categories: Record<string, number> = {};

  for (const item of allItems) {
    categories[item.category] = (categories[item.category] || 0) + 1;
  }

  return {
    total: allItems.length,
    categories
  };
}
