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

export function isComplete(_settings: Settings): _settings is CompleteSettings {
  return false;
}

export async function loadSettings(): Promise<Settings> {
  return { repository: undefined, token: undefined };
}

export async function saveSettings(_input: {
  repository: string;
  token: string;
}): Promise<SaveResult> {
  return { ok: true };
}
