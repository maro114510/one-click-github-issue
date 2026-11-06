export type Repository = { owner: string; name: string };

export type Settings = {
  repository: Repository | undefined;
  token: string | undefined;
};

export type CompleteSettings = { repository: Repository; token: string };

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "invalid-repository" };

export function parseRepository(_input: string): Repository | undefined {
  return undefined;
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
