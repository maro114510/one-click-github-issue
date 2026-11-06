import { loadSettings, saveSettings } from "./settings.js";

function element<T extends HTMLElement>(id: string, type: new () => T): T {
  const found = document.getElementById(id);
  if (!(found instanceof type)) throw new Error(`Missing #${id}`);
  return found;
}

const form = element("settings", HTMLFormElement);
const repositoryField = element("repository-field", HTMLDivElement);
const repositoryInput = element("repository", HTMLInputElement);
const repositorySupport = element("repository-support", HTMLParagraphElement);
const tokenInput = element("token", HTMLInputElement);
const tokenSupport = element("token-support", HTMLParagraphElement);
const saveButton = element("save", HTMLButtonElement);
const status = element("status", HTMLParagraphElement);

const REPOSITORY_HELP = repositorySupport.textContent ?? "";

function showRepositoryError(message: string | undefined): void {
  if (message === undefined) {
    delete repositoryField.dataset.error;
    repositoryInput.removeAttribute("aria-invalid");
    repositorySupport.textContent = REPOSITORY_HELP;
  } else {
    repositoryField.dataset.error = "";
    repositoryInput.setAttribute("aria-invalid", "true");
    repositorySupport.textContent = message;
  }
}

// Shows only whether a token is present; its value is never put back on the page.
async function render(): Promise<void> {
  const settings = await loadSettings();
  if (settings.repository !== undefined) {
    repositoryInput.value = `${settings.repository.owner}/${settings.repository.name}`;
  }
  tokenSupport.textContent =
    settings.token === undefined
      ? "Token not set. Paste it again after Chrome restarts."
      : "Token set. Leave this empty to keep it.";
}

repositoryInput.addEventListener("input", () => {
  showRepositoryError(undefined);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "";
  saveButton.disabled = true;
  try {
    const result = await saveSettings({
      repository: repositoryInput.value,
      token: tokenInput.value,
    });
    if (!result.ok) {
      showRepositoryError(
        "Enter the repository as owner/name, for example octocat/hello-world",
      );
      repositoryInput.focus();
      return;
    }
    showRepositoryError(undefined);
    tokenInput.value = "";
    await render();
    status.textContent = "Saved";
  } catch {
    status.textContent = "Could not save the settings";
  } finally {
    saveButton.disabled = false;
  }
});

await render();
