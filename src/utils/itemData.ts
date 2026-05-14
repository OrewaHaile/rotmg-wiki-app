/**
 * Item data loader using import.meta.glob
 * Loads JSON files from src/data/{category}/*.json
 */

interface ItemStats {
  damage?: string | null;
  range?: string | null;
  rateOfFire?: string | null;
  shots?: string | null;
  projectiles?: string | null;
  [key: string]: string | null | undefined;
}

export interface Item {
  id: string;
  name: string;
  slug: string;
  category?: string;
  sprite?: string;
  spriteUrl?: string;
  icon?: string;
  itemType: string;
  tier: string;
  bagType: string;
  soulbound?: boolean;
  fameBonus?: string | number | null;
  feedPower?: string | number | null;
  description?: string;
  stats?: ItemStats;
  effects?: string[];
  usableClasses?: string[];
  dropsFrom?: string[];
  notes?: string;
  sourceUrl?: string;
}

// Import all JSON files from data directory
const itemModules = import.meta.glob<{ default: Item }>(
  "../data/*/*.json",
  { eager: true }
);

// Cache for loaded items
let cachedItems: Item[] | null = null;

/**
 * Load and normalize item data from JSON modules
 */
function loadAllItemsFromModules(): Item[] {
  const items: Item[] = [];

  for (const [path, module] of Object.entries(itemModules)) {
    try {
      if (!module.default) continue;

      const item = module.default as Item;

      // Ensure sprite fallback chain
      if (!item.sprite && !item.spriteUrl && !item.icon) {
        item.sprite = `/items/${item.slug}.png`;
      }

      items.push(item);
    } catch (err) {
      console.warn(`Failed to load item from ${path}:`, err);
    }
  }

  return items;
}

/**
 * Get all items from all categories
 */
export function getAllItems(): Item[] {
  if (cachedItems === null) {
    cachedItems = loadAllItemsFromModules();
  }
  return cachedItems;
}

/**
 * Get a single item by its slug
 */
export function getItemBySlug(slug: string): Item | undefined {
  return getAllItems().find((item) => item.slug === slug);
}

/**
 * Get items filtered by category
 */
export function getItemsByCategory(category: string): Item[] {
  return getAllItems().filter((item) => item.category === category);
}

/**
 * Get items filtered by item type
 */
export function getItemsByType(itemType: string): Item[] {
  return getAllItems().filter((item) => item.itemType === itemType);
}

/**
 * Get items filtered by tier
 */
export function getItemsByTier(tier: string): Item[] {
  return getAllItems().filter((item) => item.tier === tier);
}

/**
 * Get items filtered by bag type
 */
export function getItemsByBagType(bagType: string): Item[] {
  return getAllItems().filter((item) => item.bagType === bagType);
}

/**
 * Get items usable by a specific class
 */
export function getItemsByClass(className: string): Item[] {
  return getAllItems().filter(
    (item) =>
      item.usableClasses &&
      item.usableClasses.includes(className) &&
      item.usableClasses.length > 0
  );
}

/**
 * Get unique values for a specific field across all items
 */
function getUniqueValues(field: keyof Item): string[] {
  const values = new Set<string>();
  getAllItems().forEach((item) => {
    const value = item[field];
    if (value && typeof value === "string") {
      values.add(value);
    }
  });
  return Array.from(values).sort();
}

/**
 * Get unique classes from usableClasses arrays
 */
function getUniqueClasses(): string[] {
  const classes = new Set<string>();
  getAllItems().forEach((item) => {
    if (item.usableClasses && Array.isArray(item.usableClasses)) {
      item.usableClasses.forEach((cls) => {
        if (cls && cls !== "Unknown") {
          classes.add(cls);
        }
      });
    }
  });
  return Array.from(classes).sort();
}

/**
 * Get all filter options for UI dropdowns
 */
export function getFilterOptions() {
  return {
    categories: getUniqueValues("category"),
    itemTypes: getUniqueValues("itemType"),
    tiers: getUniqueValues("tier"),
    bagTypes: getUniqueValues("bagType"),
    classes: getUniqueClasses(),
  };
}

/**
 * Get statistics about loaded items
 */
export function getItemStats() {
  const items = getAllItems();
  const categories = new Map<string, number>();

  items.forEach((item) => {
    const cat = item.category || "uncategorized";
    categories.set(cat, (categories.get(cat) || 0) + 1);
  });

  return {
    total: items.length,
    categories: Object.fromEntries(categories),
  };
}
