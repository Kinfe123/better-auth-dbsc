/**
 * Checks the package as npm would publish it: every `exports` target is in the tarball,
 * and every entry loads. Run after `pnpm build`.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

type Target = string | { types?: string; default?: string };

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
  exports: Record<string, Target>;
};
const [packed] = JSON.parse(
  execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { encoding: "utf8" }),
) as [{ files: { path: string }[] }];
const files = new Set(packed.files.map((file) => file.path));

const problems: string[] = [];
const entries: string[] = [];
for (const [subpath, target] of Object.entries(pkg.exports)) {
  const paths = typeof target === "string" ? [target] : [target.types, target.default];
  for (const path of paths) {
    if (!path) {
      problems.push(`\`exports["${subpath}"]\` needs both \`types\` and \`default\`.`);
      continue;
    }
    if (!files.has(path.replace(/^\.\//, ""))) {
      problems.push(`\`exports["${subpath}"]\` points at ${path}, which is not in the tarball.`);
    }
  }
  if (typeof target !== "string" && target.default) entries.push(target.default);
}

for (const entry of entries) {
  try {
    await import(pathToFileURL(entry).href);
  } catch (error) {
    problems.push(`${entry} does not load: ${error instanceof Error ? error.message : error}`);
  }
}

if (problems.length > 0) {
  console.error(`The package is not ready to publish:\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}
console.log(`${files.size} files packed; ${entries.length} entries load.`);
