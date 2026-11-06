export type Repository = { owner: string; name: string };

export type Settings = {
  repository: Repository | undefined;
  token: string | undefined;
};

export type CompleteSettings = { repository: Repository; token: string };

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "invalid-repository" };

// GitHub username rules: alphanumerics and single hyphens, not at either end.
const OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
const NAME = /^[A-Za-z0-9._-]{1,100}$/;

export function parseRepository(input: string): Repository | undefined {
  const parts = input.trim().split("/");
  if (parts.length !== 2) return undefined;
  const [owner = "", name = ""] = parts;
  if (!OWNER.test(owner) || !NAME.test(name)) return undefined;
  if (name === "." || name === "..") return undefined;
  return { owner, name };
}

export function isComplete(settings: Settings): settings is CompleteSettings {
  return settings.repository !== undefined && settings.token !== undefined;
}

const REPOSITORY_KEY = "repository";
const TOKEN_KEY = "token";

// The token lives only in session storage, which Chrome keeps in memory and
// never writes to disk; local and sync storage persist to the profile.
export async function loadSettings(): Promise<Settings> {
  const [local, session] = await Promise.all([
    chrome.storage.local.get(REPOSITORY_KEY),
    chrome.storage.session.get(TOKEN_KEY),
  ]);
  const repository = local[REPOSITORY_KEY];
  const token = session[TOKEN_KEY];
  return {
    repository:
      typeof repository === "string" ? parseRepository(repository) : undefined,
    token: typeof token === "string" && token !== "" ? token : undefined,
  };
}

export async function saveSettings(input: {
  repository: string;
  token: string;
}): Promise<SaveResult> {
  const repository = parseRepository(input.repository);
  if (repository === undefined) {
    return { ok: false, reason: "invalid-repository" };
  }
  await chrome.storage.local.set({
    [REPOSITORY_KEY]: `${repository.owner}/${repository.name}`,
  });
  const token = input.token.trim();
  if (token !== "") {
    await chrome.storage.session.set({ [TOKEN_KEY]: token });
  }
  return { ok: true };
}
