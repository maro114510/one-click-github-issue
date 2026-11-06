// Usage: node scripts/check-version.mjs <tag>
// Fails unless the tag is vX.Y.Z and package.json and static/manifest.json
// both carry its version.
import { readFileSync } from "node:fs";

const tag = process.argv[2] ?? "";
const files = ["package.json", "static/manifest.json"];

let ok = true;
// Chrome accepts only dot-separated integers as a manifest version.
if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error(`tag ${tag} is not of the form vX.Y.Z`);
  ok = false;
}
for (const file of files) {
  const { version } = JSON.parse(readFileSync(file, "utf8"));
  if (`v${version}` !== tag) {
    console.error(`${file} version ${version} does not match tag ${tag}`);
    ok = false;
  }
}
process.exit(ok ? 0 : 1);
