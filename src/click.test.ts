import { describe, expect, it } from "vitest";
import { type ClickDeps, handleClick, type Tab } from "./click.js";
import type { Outcome, Page, Settings } from "./issue-request.js";
import type { Settings as StoredSettings } from "./settings.js";

const completeSettings: StoredSettings = {
  repository: { owner: "octocat", name: "inbox" },
  token: "github_pat_example",
};
const settingsWithoutToken: StoredSettings = {
  repository: { owner: "octocat", name: "inbox" },
  token: undefined,
};
const articleTab: Tab = {
  id: 7,
  title: "An article",
  url: "https://example.com/article",
};

const SUCCESS = { text: "✓", color: "#1a7f37" };
const FAILURE = { text: "✗", color: "#d1242f" };

type Badge = { text: string; color?: string };

// Stands in for the Chrome APIs, keeping per-tab badges, opened settings
// pages, and sent requests inspectable.
function fakeChrome(options: {
  settings: StoredSettings;
  outcome?: Outcome;
  badges?: Record<number, Badge>;
}) {
  const state = {
    badges: { ...options.badges } as Record<number, Badge>,
    settingsPagesOpened: 0,
    requests: [] as { settings: Settings; page: Page }[],
  };
  const deps: ClickDeps = {
    loadSettings: async () => options.settings,
    createIssue: async (settings, page) => {
      state.requests.push({ settings, page });
      return options.outcome ?? { kind: "created" };
    },
    setBadgeText: async ({ tabId, text }) => {
      state.badges[tabId] = { ...state.badges[tabId], text };
    },
    setBadgeBackgroundColor: async ({ tabId, color }) => {
      state.badges[tabId] = { text: "", ...state.badges[tabId], color };
    },
    openOptionsPage: async () => {
      state.settingsPagesOpened += 1;
    },
  };
  return { deps, state };
}

function badgeText(state: { badges: Record<number, Badge> }, tabId: number) {
  return state.badges[tabId]?.text ?? "";
}

describe("incomplete settings", () => {
  it("opens the settings page, sends no request, and clears the tab's previous badge", async () => {
    const { deps, state } = fakeChrome({
      settings: settingsWithoutToken,
      badges: { 7: SUCCESS },
    });

    await handleClick(articleTab, deps);

    expect(state.settingsPagesOpened).toBe(1);
    expect(state.requests).toEqual([]);
    expect(badgeText(state, 7)).toBe("");
  });
});

describe("a page without a URL", () => {
  it.each([
    ["a withheld URL", undefined],
    ["an empty URL", ""],
  ])(
    "with %s shows failure on the tab and sends no request",
    async (_case, url) => {
      const { deps, state } = fakeChrome({ settings: completeSettings });

      await handleClick({ id: 7, title: "Extensions", url }, deps);

      expect(state.badges[7]).toEqual(FAILURE);
      expect(state.requests).toEqual([]);
      expect(state.settingsPagesOpened).toBe(0);
    },
  );
});

describe("a page with a URL and complete settings", () => {
  it("sends one request for the page to the target repository with the token", async () => {
    const { deps, state } = fakeChrome({ settings: completeSettings });

    await handleClick(articleTab, deps);

    expect(state.requests).toEqual([
      {
        settings: {
          owner: "octocat",
          name: "inbox",
          token: "github_pat_example",
        },
        page: { title: "An article", url: "https://example.com/article" },
      },
    ]);
  });

  it("sends an empty title when the tab has none, leaving the URL fallback to the request", async () => {
    const { deps, state } = fakeChrome({ settings: completeSettings });

    await handleClick({ id: 7, url: "https://example.com/article" }, deps);

    expect(state.requests[0]?.page).toEqual({
      title: "",
      url: "https://example.com/article",
    });
  });

  it("shows success on the tab when the issue is created", async () => {
    const { deps, state } = fakeChrome({
      settings: completeSettings,
      outcome: { kind: "created" },
    });

    await handleClick(articleTab, deps);

    expect(state.badges[7]).toEqual(SUCCESS);
    expect(state.settingsPagesOpened).toBe(0);
  });

  it("opens the settings page and leaves no badge when the token is rejected", async () => {
    const { deps, state } = fakeChrome({
      settings: completeSettings,
      outcome: { kind: "unauthorized" },
      badges: { 7: FAILURE },
    });

    await handleClick(articleTab, deps);

    expect(state.settingsPagesOpened).toBe(1);
    expect(badgeText(state, 7)).toBe("");
  });

  it("shows failure on the tab when creation fails otherwise", async () => {
    const { deps, state } = fakeChrome({
      settings: completeSettings,
      outcome: { kind: "failure" },
      badges: { 7: SUCCESS },
    });

    await handleClick(articleTab, deps);

    expect(state.badges[7]).toEqual(FAILURE);
    expect(state.settingsPagesOpened).toBe(0);
  });

  it("leaves another tab's badge untouched", async () => {
    const { deps, state } = fakeChrome({
      settings: completeSettings,
      outcome: { kind: "failure" },
      badges: { 3: SUCCESS },
    });

    await handleClick(articleTab, deps);

    expect(state.badges[3]).toEqual(SUCCESS);
  });
});
