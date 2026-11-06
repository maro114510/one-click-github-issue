import { handleClick } from "./click.js";
import { createIssue } from "./issue-request.js";
import { loadSettings } from "./settings.js";

chrome.action.onClicked.addListener(async (tab) => {
  // A badge set without a tab ID would apply to every tab.
  if (tab.id === undefined) return;
  await handleClick(
    { id: tab.id, title: tab.title, url: tab.url },
    {
      loadSettings,
      createIssue,
      setBadgeText: (details) => chrome.action.setBadgeText(details),
      setBadgeBackgroundColor: (details) =>
        chrome.action.setBadgeBackgroundColor(details),
      openOptionsPage: () => chrome.runtime.openOptionsPage(),
    },
  );
});
