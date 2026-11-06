import type {
  Settings as IssueSettings,
  Outcome,
  Page,
} from "./issue-request.js";
import { isComplete, type Settings } from "./settings.js";

export type Tab = { id: number; title?: string; url?: string };

export type ClickDeps = {
  loadSettings: () => Promise<Settings>;
  createIssue: (settings: IssueSettings, page: Page) => Promise<Outcome>;
  setBadgeText: (details: { tabId: number; text: string }) => Promise<void>;
  setBadgeBackgroundColor: (details: {
    tabId: number;
    color: string;
  }) => Promise<void>;
  openOptionsPage: () => Promise<void>;
};

const SUCCESS = { text: "✓", color: "#1a7f37" };
const FAILURE = { text: "✗", color: "#d1242f" };

export async function handleClick(tab: Tab, deps: ClickDeps): Promise<void> {
  const tabId = tab.id;
  const showBadge = async (badge: { text: string; color: string }) => {
    await deps.setBadgeBackgroundColor({ tabId, color: badge.color });
    await deps.setBadgeText({ tabId, text: badge.text });
  };

  await deps.setBadgeText({ tabId, text: "" });
  const settings = await deps.loadSettings();
  if (!isComplete(settings)) {
    await deps.openOptionsPage();
    return;
  }
  // Chrome withholds the URL on restricted pages such as chrome:// pages.
  if (tab.url === undefined || tab.url === "") {
    await showBadge(FAILURE);
    return;
  }
  const outcome = await deps.createIssue(
    {
      owner: settings.repository.owner,
      name: settings.repository.name,
      token: settings.token,
    },
    { title: tab.title ?? "", url: tab.url },
  );
  if (outcome.kind === "created") await showBadge(SUCCESS);
  else if (outcome.kind === "unauthorized") await deps.openOptionsPage();
  else await showBadge(FAILURE);
}
