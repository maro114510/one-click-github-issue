import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const script = join(import.meta.dirname, "check-version.mjs");
const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true });
});

// A checkout whose package.json and static/manifest.json carry these versions.
function checkoutWithVersions(versions: { pkg: string; manifest: string }) {
  const dir = mkdtempSync(join(tmpdir(), "check-version-"));
  dirs.push(dir);
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ version: versions.pkg }),
  );
  mkdirSync(join(dir, "static"));
  writeFileSync(
    join(dir, "static", "manifest.json"),
    JSON.stringify({ version: versions.manifest }),
  );
  return dir;
}

function checkVersion(cwd: string, tag: string) {
  return spawnSync(process.execPath, [script, tag], { cwd, encoding: "utf8" });
}

describe("check-version", () => {
  it("exits 0 when the tag, package.json, and manifest.json all carry the same version", () => {
    const cwd = checkoutWithVersions({ pkg: "0.1.0", manifest: "0.1.0" });

    expect(checkVersion(cwd, "v0.1.0").status).toBe(0);
  });

  it("fails naming package.json when its version differs from the tag", () => {
    const cwd = checkoutWithVersions({ pkg: "0.0.0", manifest: "0.1.0" });

    const result = checkVersion(cwd, "v0.1.0");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("package.json");
  });

  it("fails naming manifest.json when its version differs from the tag", () => {
    const cwd = checkoutWithVersions({ pkg: "0.1.0", manifest: "0.0.1" });

    const result = checkVersion(cwd, "v0.1.0");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("manifest.json");
  });
});
