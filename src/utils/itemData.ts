import allItemsData from "../data/all-items.json";

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
  feedPower?: number | string | null;
  fameBonus?: number | string | null;
  description?: string;
  stats?: Record<string, unknown>;
  effects?: string[];
  usableClasses?: string[];
  dropsFrom?: string[];
  notes?: string[] | string;
  sourceUrl?: string;
}

function normalizeItem(item: Partial<Item>): Item {
  const slug = item.slug || item.id || "unknown";

  return {
    id: item.id || slug,
    name: item.name || slug,
    slug,
    category: item.category || "items",
    subCategory: item.subCategory || "",
    sprite: item.sprite || item.spriteUrl || item.icon || `/items/${slug}.png`,
    spriteUrl: item.spriteUrl || "",
    icon: item.icon || "",
    itemType: item.itemType || "",
    tier: item.tier || "",
    bagType: item.bagType || "",
    soulbound: item.soulbound ?? false,
    feedPower: item.feedPower ?? null,
    fameBonus: item.fameBonus ?? null,
    description: item.description || "",
    stats: item.stats || {},
    effects: item.effects || [],
    usableClasses: item.usableClasses || [],
    dropsFrom: item.dropsFrom || [],
    notes: item.notes || [],
    sourceUrl: item.sourceUrl || ""
  };
}

const allItems: Item[] = (allItemsData as Partial<Item>[])
  .map(normalizeItem)
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
  return [...new Set(allItems.map((item) => item.category).filter(Boolean))].sort();
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
