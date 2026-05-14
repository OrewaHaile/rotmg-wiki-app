# RotMG Wiki App

A fan-made Realm of the Mad God wiki built with React + Vite. Data is stored locally in JSON files — no backend required.

---

## How to Add Items

All item data lives in:

```
src/data/items.json
```

This file is an array of item objects. To add a new item, copy the template below and paste it as a new entry in the array (before or after the existing items). Fill in what you know and mark anything unknown as `"Unknown"`.

---

## Item Template

```json
{
  "id": 2,
  "name": "Item Name Here",
  "slug": "item-name-here",
  "spriteUrl": "https://www.realmeye.com/s/a/img/wiki/item-name-here.png",
  "itemType": "Sword",
  "tier": "T12",
  "bagType": "Blue",
  "soulbound": false,
  "fameBonus": "4%",
  "feedPower": 500,
  "description": "Flavour text from the game.",
  "stats": {
    "damage": "150-200",
    "range": "3.5",
    "rateOfFire": "100%"
  },
  "shots": 1,
  "projectiles": 1,
  "rateOfFire": "100%",
  "damage": "150-200",
  "range": "3.5",
  "effects": ["Armor Piercing", "Ignores defense of target"],
  "usableClasses": ["Warrior", "Knight", "Paladin"],
  "dropsFrom": ["Oryx the Mad God 3", "Shatters"],
  "notes": "Any extra info about this item.",
  "sourceUrl": "https://www.realmeye.com/wiki/item-name-here"
}
```

---

## Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique incrementing ID (don't reuse) |
| `name` | string | Full display name of the item |
| `slug` | string | URL-safe name (lowercase, hyphens). Must be unique. |
| `spriteUrl` | string | URL or local path to the pixel art sprite |
| `itemType` | string | `Sword`, `Dagger`, `Staff`, `Wand`, `Bow`, `Tome`, `Shield`, `Helm`, `Seal`, `Cloak`, `Quiver`, `Ring`, etc. |
| `tier` | string | `T1` through `T14`, `UT`, `ST` |
| `bagType` | string | `Brown`, `Blue`, `Purple`, `Orange`, `Cyan`, `White` |
| `soulbound` | boolean | `true` or `false` |
| `fameBonus` | string/number | e.g. `"4%"` or `"Unknown"` |
| `feedPower` | string/number | e.g. `500` or `"Unknown"` |
| `description` | string | In-game tooltip description |
| `stats` | object | `{ damage, range, rateOfFire }` |
| `shots` | string/number | Number of projectiles per use, or `"Unknown"` |
| `projectiles` | string/number | Same as shots for most weapons |
| `rateOfFire` | string/number | e.g. `"130%"` or `"Unknown"` |
| `damage` | string/number | e.g. `"120-185"` or `"Unknown"` |
| `range` | string/number | e.g. `4.0` or `"Unknown"` |
| `effects` | string[] | List of effects; use `["Unknown"]` if none confirmed |
| `usableClasses` | string[] | List of classes that can equip this item |
| `dropsFrom` | string[] | Enemy/dungeon names; use `["Unknown"]` if not confirmed |
| `notes` | string | Extra notes, caveats, or placeholder warnings |
| `sourceUrl` | string | Link to RealmEye wiki page |

---

## Bag Type Color Reference

| Bag | Typical Contents |
|-----|-----------------|
| Brown | T1–T5 gear |
| Blue | T6–T9 gear |
| Purple | T10–T12 gear |
| Orange | T13–T14 gear |
| Cyan | UT items |
| White | ST and top-tier UT items |

---

## Slug Rules

- Must be lowercase
- Use hyphens instead of spaces
- No special characters
- Must match the URL path: `/item/your-slug-here`

**Example:** `"Spellblade of the Sun"` → `"spellblade-of-the-sun"`

---

## Local Sprite Images

If you have a sprite image locally, place it in:

```
src/assets/sprites/
```

Then reference it in `spriteUrl` as:

```json
"spriteUrl": "/src/assets/sprites/your-item.png"
```

For best results, use the original 8×8 or 16×16 pixel art files. The app renders them with `image-rendering: pixelated` to preserve the crisp look.

---

## Future Importer

The JSON structure is designed to be compatible with a future RealmEye scraper. Each item has a `sourceUrl` field pointing to its RealmEye page so the importer will be able to match and update entries automatically.
