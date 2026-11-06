// Usage: node scripts/check-version.mjs <tag>
// Fails unless package.json and static/manifest.json both carry the tag's version.
import { readFileSync } from "node:fs";

const tag = process.argv[2] ?? "";
const files = ["package.json", "static/manifest.json"];

let ok = true;
for (const file of files) {
  const { version } = JSON.parse(readFileSync(file, "utf8"));
  if (`v${version}` !== tag) {
    console.error(`${file} version ${version} does not match tag ${tag}`);
    ok = false;
  }
}
process.exit(ok ? 0 : 1);
