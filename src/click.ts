import type {
  Settings as IssueSettings,
  Outcome,
  Page,
} from "./issue-request.js";
import type { Settings } from "./settings.js";

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

export async function handleClick(_tab: Tab, _deps: ClickDeps): Promise<void> {}
