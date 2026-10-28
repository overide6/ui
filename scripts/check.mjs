// Consistency checks for the package; run with `npm test`.
//
// - The two dark-theme blocks in tokens.css (system setting and
//   data-theme="dark") declare exactly the same tokens and values.
// - Every dark token also exists in the light theme.
// - Every token used in base.css, tailwind-preset.js and the styleguide is
//   defined in tokens.css (or is an app token).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

const tokens = read("tokens.css").replace(/\/\*[\s\S]*?\*\//g, "");
const errors = [];

/** Returns the body of the block that starts at the first match of `opener`. */
function block(source, opener) {
  const start = source.search(opener);
  if (start < 0) throw new Error(`block not found: ${opener}`);
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}" && --depth === 0) return source.slice(source.indexOf("{", start) + 1, i);
  }
  throw new Error(`unclosed block: ${opener}`);
}

function declarations(body) {
  const map = new Map();
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    map.set(name, value.trim());
  }
  return map;
}

const darkSystem = declarations(block(block(tokens, /@media \(prefers-color-scheme: dark\)/), /:root/));
const darkForced = declarations(block(tokens, /:root\[data-theme="dark"\]/));
const defined = new Set(tokens.matchAll(/(--[\w-]+)\s*:/g).map((m) => m[1]));
const light = declarations(block(tokens, /:root\s*\{/));

for (const [name, value] of darkSystem) {
  if (darkForced.get(name) !== value) errors.push(`dark blocks differ for ${name}: "${value}" vs "${darkForced.get(name)}"`);
  if (!light.has(name)) errors.push(`dark token ${name} has no light value`);
}
for (const name of darkForced.keys()) {
  if (!darkSystem.has(name)) errors.push(`${name} only in the data-theme="dark" block`);
}

for (const file of ["base.css", "tailwind-preset.js", "styleguide/index.html"]) {
  const source = read(file);
  // Component-local variables such as --panel-pad are defined in the file itself.
  const local = new Set(source.matchAll(/(--[\w-]+)\s*:/g).map((m) => m[1]));
  const undefinedNames = new Set(
    source
      .matchAll(/var\((--[\w-]+)/g)
      .map((m) => m[1])
      .filter((name) => !defined.has(name) && !local.has(name) && !name.startsWith("--app-")),
  );
  for (const name of undefinedNames) errors.push(`${file} uses undefined token ${name}`);
  for (const [, name] of source.matchAll(/triplet\("(--[\w-]+)"\)/g)) {
    if (!defined.has(name)) errors.push(`${file} maps undefined token ${name}`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${defined.size} tokens, dark blocks in sync, all references defined`);
