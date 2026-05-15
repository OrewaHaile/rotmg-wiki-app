export function formatCategoryLabel(category: string = ""): string {
  const labels: Record<string, string> = {
    daggers: "Daggers",
    swords: "Swords",
    bows: "Bows",
    wands: "Wands",
    staves: "Staffs",
    staffs: "Staffs",
    katanas: "Katanas",
    spellblades: "Spellblades",
  };

  return labels[category.toLowerCase()] || category;
}
