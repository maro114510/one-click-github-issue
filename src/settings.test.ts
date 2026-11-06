import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isComplete,
  loadSettings,
  parseRepository,
  saveSettings,
} from "./settings.js";

type Area = Record<string, unknown>;

// Stands in for chrome.storage, keeping each area's contents inspectable.
function stubChromeStorage(initial: {
  local?: Area;
  session?: Area;
  sync?: Area;
}) {
  const areas = {
    local: { ...initial.local },
    session: { ...initial.session },
    sync: { ...initial.sync },
  };
  const area = (contents: Area) => ({
    get: async (keys?: string | string[] | null) => {
      if (keys == null) return { ...contents };
      const wanted = typeof keys === "string" ? [keys] : keys;
      return Object.fromEntries(
        wanted.filter((k) => k in contents).map((k) => [k, contents[k]]),
      );
    },
    set: async (items: Area) => {
      Object.assign(contents, items);
    },
  });
  vi.stubGlobal("chrome", {
    storage: {
      local: area(areas.local),
      session: area(areas.session),
      sync: area(areas.sync),
    },
  });
  return areas;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseRepository", () => {
  it("returns the owner and name of an owner/name input", () => {
    expect(parseRepository("octo-cat/my.repo_1")).toEqual({
      owner: "octo-cat",
      name: "my.repo_1",
    });
  });

  it("ignores whitespace around a pasted input", () => {
    expect(parseRepository("  octocat/hello  ")).toEqual({
      owner: "octocat",
      name: "hello",
    });
  });

  const ownerOf39Chars = "a".repeat(39);
  const nameOf100Chars = "n".repeat(100);

  it("accepts the longest owner and name GitHub allows", () => {
    expect(parseRepository(`${ownerOf39Chars}/${nameOf100Chars}`)).toEqual({
      owner: ownerOf39Chars,
      name: nameOf100Chars,
    });
  });

  it.each([
    ["an empty input", ""],
    ["a path climbing out of the repository", "../x"],
    ["three path segments", "a/b/c"],
    ["a single dot", "."],
    ["two dots", ".."],
    ["a name of a single dot", "octocat/."],
    ["a name of two dots", "octocat/.."],
    ["a missing name", "octocat/"],
    ["a missing owner", "/hello"],
    ["an owner starting with a hyphen", "-octocat/hello"],
    ["an owner ending with a hyphen", "octocat-/hello"],
    ["an owner with consecutive hyphens", "octo--cat/hello"],
    ["an owner with an underscore", "octo_cat/hello"],
    ["an owner of 40 characters", `${"a".repeat(40)}/hello`],
    ["a name of 101 characters", `octocat/${"n".repeat(101)}`],
    ["a name with a space", "octocat/hello world"],
    ["a name with a percent sign", "octocat/hello%2F"],
  ])("rejects %s", (_case, input) => {
    expect(parseRepository(input)).toBeUndefined();
  });
});

describe("isComplete", () => {
  const repository = { owner: "octocat", name: "hello" };

  it("is true when both the repository and the token are present", () => {
    expect(isComplete({ repository, token: "token-value" })).toBe(true);
  });

  it("is false when the token is missing", () => {
    expect(isComplete({ repository, token: undefined })).toBe(false);
  });

  it("is false when the repository is missing", () => {
    expect(isComplete({ repository: undefined, token: "token-value" })).toBe(
      false,
    );
  });
});

describe("saveSettings and loadSettings", () => {
  const token = "github_pat_example";

  it("loads back the repository and token that were saved", async () => {
    stubChromeStorage({});

    const result = await saveSettings({ repository: "octocat/hello", token });

    expect(result).toEqual({ ok: true });
    expect(await loadSettings()).toEqual({
      repository: { owner: "octocat", name: "hello" },
      token,
    });
  });

  it("writes the token only to session storage, never to local or sync", async () => {
    const areas = stubChromeStorage({});

    await saveSettings({ repository: "octocat/hello", token });

    expect(JSON.stringify(areas.session)).toContain(token);
    expect(JSON.stringify(areas.local)).not.toContain(token);
    expect(JSON.stringify(areas.sync)).not.toContain(token);
  });

  it("keeps the repository but not the token once session storage is cleared, as after a browser restart", async () => {
    const areas = stubChromeStorage({});
    await saveSettings({ repository: "octocat/hello", token });
    for (const key of Object.keys(areas.session)) delete areas.session[key];

    expect(await loadSettings()).toEqual({
      repository: { owner: "octocat", name: "hello" },
      token: undefined,
    });
  });

  it("keeps the current token when saved with an empty token", async () => {
    stubChromeStorage({});
    await saveSettings({ repository: "octocat/hello", token });

    await saveSettings({ repository: "octocat/other", token: "" });

    expect(await loadSettings()).toEqual({
      repository: { owner: "octocat", name: "other" },
      token,
    });
  });

  it("rejects an invalid repository and saves nothing", async () => {
    const areas = stubChromeStorage({});

    const result = await saveSettings({ repository: "../x", token });

    expect(result).toEqual({ ok: false, reason: "invalid-repository" });
    expect(areas).toEqual({ local: {}, session: {}, sync: {} });
  });
});
