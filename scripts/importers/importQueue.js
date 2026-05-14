/**
 * Import queue helper.
 * Runs one category at a time and saves queue state to import-progress.json.
 *
 * Usage:
 *   node scripts/importers/importQueue.js --batch 25
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const categories = [
  "/wiki/daggers",
  "/wiki/swords",
  "/wiki/wands",
  "/wiki/staves",
  "/wiki/spellblades",
];

const MAX_RETRIES = 3;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QUEUE_PROGRESS_FILE = path.join(__dirname, "import-progress.json");
const IMPORTER_PROGRESS_FILE = path.join(__dirname, "progress.json");

const args = process.argv.slice(2);
const argVal = (flag) => {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : null;
};

const BATCH_SIZE = argVal("--batch") ?? "25";
const RESET_QUEUE = args.includes("--reset-queue");

function loadQueueProgress() {
  if (RESET_QUEUE || !fs.existsSync(QUEUE_PROGRESS_FILE)) {
    return { completed: [], current: null };
  }

  try {
    const data = JSON.parse(fs.readFileSync(QUEUE_PROGRESS_FILE, "utf-8"));
    return {
      completed: Array.isArray(data.completed) ? data.completed : [],
      current: typeof data.current === "string" ? data.current : null,
    };
  } catch {
    return { completed: [], current: null };
  }
}

function saveQueueProgress(progress) {
  fs.writeFileSync(QUEUE_PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function loadImporterProgress() {
  if (!fs.existsSync(IMPORTER_PROGRESS_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(IMPORTER_PROGRESS_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function titleForCategory(category) {
  return category
    .replace("/wiki/", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function categoryIsComplete(category) {
  const state = loadImporterProgress();
  if (!state || state.categoryUrl !== `https://www.realmeye.com${category}`) return false;
  return Array.isArray(state.urls) && state.nextIndex >= state.urls.length;
}

function runImporter(category) {
  return spawnSync("node", ["scripts/importers/realmeyeImporter.js", "--url", category, "--batch", BATCH_SIZE], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

function pickNextCategory(progress) {
  if (progress.current && !progress.completed.includes(progress.current)) {
    return progress.current;
  }
  return categories.find((category) => !progress.completed.includes(category)) ?? null;
}

function setQueueCurrent(progress, category) {
  progress.current = category;
  saveQueueProgress(progress);
}

function ensureQueueProgress() {
  if (!fs.existsSync(QUEUE_PROGRESS_FILE)) {
    saveQueueProgress({ completed: [], current: null });
  }
}

function printIntro(category) {
  const categoryName = titleForCategory(category);
  console.log(`\nStarting category: ${categoryName}`);
}

function printRetryInfo() {
  console.log("Retry failed items");
  console.log(`Max retries: ${MAX_RETRIES}`);
}

function printCategoryComplete() {
  console.log("Category complete\n");
}

function printQueueComplete() {
  console.log("Queue complete.");
}

function collectCategoriesToProcess(progress) {
  const queue = [];
  const current = pickNextCategory(progress);
  if (!current) return queue;

  const startIndex = categories.indexOf(current);
  for (let i = startIndex; i < categories.length; i += 1) {
    const category = categories[i];
    if (!progress.completed.includes(category)) {
      queue.push(category);
    }
  }
  return queue;
}

function runCategory(category) {
  setQueueCurrent(queueProgress, category);
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    attempts += 1;
    const result = runImporter(category);

    if (result.status === 0 && categoryIsComplete(category)) {
      printCategoryComplete();
      queueProgress.completed.push(category);
      queueProgress.current = null;
      saveQueueProgress(queueProgress);
      return true;
    }

    if (result.status !== 0) {
      printRetryInfo();
      if (attempts >= MAX_RETRIES) {
        console.error("Import queue failed after maximum retries.");
        process.exit(1);
      }
      continue;
    }

    console.log("Imported batch. Continuing category...");
  }

  return false;
}

let queueProgress = loadQueueProgress();
ensureQueueProgress();
const categoriesToProcess = collectCategoriesToProcess(queueProgress);

if (categoriesToProcess.length === 0) {
  console.log("All queue categories are complete.");
  queueProgress.current = null;
  saveQueueProgress(queueProgress);
} else {
  for (const category of categoriesToProcess) {
    printIntro(category);
    runCategory(category);
  }
  queueProgress.current = null;
  saveQueueProgress(queueProgress);
  printQueueComplete();
}

