export type Settings = { owner: string; name: string; token: string };
export type Page = { title: string; url: string };
export type Outcome =
  | { kind: "created" }
  | { kind: "unauthorized" }
  | { kind: "failure" };

export async function createIssue(
  _settings: Settings,
  _page: Page,
  _fetchFn: typeof fetch = fetch,
): Promise<Outcome> {
  return { kind: "failure" };
}
