const fs = require("fs");

const file = "src/pages/Sets.tsx";

if (!fs.existsSync(file)) {
  console.error("Arquivo não encontrado:", file);
  process.exit(1);
}

let content = fs.readFileSync(file, "utf8");

if (content.includes('href={`/item/${item.slug}`}')) {
  console.log("Os itens dos sets já parecem estar linkados.");
  process.exit(0);
}

fs.writeFileSync(`${file}.bak-link-items`, content);

function ensureLinkImport(source) {
  const wouterImport = source.match(/import\s+\{([^}]+)\}\s+from\s+["']wouter["'];?/);

  if (wouterImport) {
    const imports = wouterImport[1]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!imports.includes("Link")) {
      imports.unshift("Link");
      return source.replace(wouterImport[0], `import { ${imports.join(", ")} } from "wouter";`);
    }

    return source;
  }

  return `import { Link } from "wouter";\n${source}`;
}

function findMatchingBrace(source, start) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const ch = source[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }

  return -1;
}

const conditionalPatterns = [
  "{set.items && set.items.length > 0 ?",
  "{Array.isArray(set.items) && set.items.length > 0 ?",
  "{set.items?.length ?",
];

const fullConditionalReplacement = String.raw`{Array.isArray(set.items) && set.items.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {set.items.slice(0, 4).map((item) => {
                      const itemCard = (
                        <div
                          className="flex h-16 items-center justify-center rounded-xl border border-stone-800 bg-stone-950 transition hover:border-amber-500 hover:bg-stone-900"
                          title={item.name}
                        >
                          {item.sprite ? (
                            <img
                              src={item.sprite}
                              alt={item.name}
                              className="h-11 w-11 object-contain"
                              style={{ imageRendering: "pixelated" }}
                            />
                          ) : (
                            <span className="text-xs text-stone-500">?</span>
                          )}
                        </div>
                      );

                      return item.slug ? (
                        <Link key={item.slug} href={\`/item/${item.slug}\`}>
                          {itemCard}
                        </Link>
                      ) : (
                        <div key={item.name}>{itemCard}</div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-xl border border-stone-800 bg-stone-950/80 px-3 py-3 text-sm text-stone-500">
                    Items will appear here after the ST set import.
                  </p>
                )}`;

let replaced = false;

for (const pattern of conditionalPatterns) {
  const start = content.indexOf(pattern);
  if (start !== -1) {
    const end = findMatchingBrace(content, start);
    if (end === -1) {
      console.error("Não consegui encontrar o fim do bloco de itens do set.");
      process.exit(1);
    }

    content = content.slice(0, start) + fullConditionalReplacement + content.slice(end);
    replaced = true;
    break;
  }
}

if (!replaced) {
  const mapPatterns = [
    "{set.items.map(",
    "{set.items.slice(0, 4).map(",
    "{(set.items || []).map(",
  ];

  const mapReplacement = String.raw`{(Array.isArray(set.items) ? set.items : []).slice(0, 4).map((item) => {
                    const itemCard = (
                      <div
                        className="flex h-16 items-center justify-center rounded-xl border border-stone-800 bg-stone-950 transition hover:border-amber-500 hover:bg-stone-900"
                        title={item.name}
                      >
                        {item.sprite ? (
                          <img
                            src={item.sprite}
                            alt={item.name}
                            className="h-11 w-11 object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                        ) : (
                          <span className="text-xs text-stone-500">?</span>
                        )}
                      </div>
                    );

                    return item.slug ? (
                      <Link key={item.slug} href={\`/item/${item.slug}\`}>
                        {itemCard}
                      </Link>
                    ) : (
                      <div key={item.name}>{itemCard}</div>
                    );
                  })}`;

  for (const pattern of mapPatterns) {
    const start = content.indexOf(pattern);
    if (start !== -1) {
      const end = findMatchingBrace(content, start);
      if (end === -1) {
        console.error("Não consegui encontrar o fim do map de itens do set.");
        process.exit(1);
      }

      content = content.slice(0, start) + mapReplacement + content.slice(end);
      replaced = true;
      break;
    }
  }
}

if (!replaced) {
  console.error("Não encontrei o bloco de itens em src/pages/Sets.tsx.");
  console.error("Backup criado em src/pages/Sets.tsx.bak-link-items");
  process.exit(1);
}

content = ensureLinkImport(content);

fs.writeFileSync(file, content);
console.log("Pronto: itens dos ST Sets agora linkam para /item/{slug}");
