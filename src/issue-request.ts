export type Settings = { owner: string; name: string; token: string };
export type Page = { title: string; url: string };
export type Outcome =
  | { kind: "created" }
  | { kind: "unauthorized" }
  | { kind: "failure" };

const MAX_TITLE_UNITS = 256;
const ELLIPSIS = "…";

// Counts UTF-16 code units, the strictest reading of GitHub's limit.
function toIssueTitle(page: Page): string {
  const title = page.title === "" ? page.url : page.title;
  if (title.length <= MAX_TITLE_UNITS) return title;
  let end = MAX_TITLE_UNITS - ELLIPSIS.length;
  const last = title.charCodeAt(end - 1);
  if (last >= 0xd800 && last <= 0xdbff) end -= 1; // would split a surrogate pair
  return title.slice(0, end) + ELLIPSIS;
}

export async function createIssue(
  settings: Settings,
  page: Page,
  fetchFn: typeof fetch = fetch,
): Promise<Outcome> {
  const owner = encodeURIComponent(settings.owner);
  const name = encodeURIComponent(settings.name);
  try {
    const response = await fetchFn(
      `https://api.github.com/repos/${owner}/${name}/issues`,
      {
        method: "POST",
        credentials: "omit",
        headers: {
          Authorization: `Bearer ${settings.token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: toIssueTitle(page), body: page.url }),
      },
    );
    if (response.status === 201) return { kind: "created" };
    if (response.status === 401) return { kind: "unauthorized" };
    console.error(`GitHub issue creation failed: HTTP ${response.status}`);
    return { kind: "failure" };
  } catch (error) {
    console.error("GitHub issue creation failed:", error);
    return { kind: "failure" };
  }
}
