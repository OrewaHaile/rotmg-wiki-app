/**
 * Converts a display name into a URL-safe slug.
 * e.g. "Spellblade of the Sun" → "spellblade-of-the-sun"
 */
export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
