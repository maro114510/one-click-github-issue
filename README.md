# One-Click GitHub Issue

A Chrome extension that saves the page in the active tab as a GitHub Issue in one repository you choose, with a single click on the extension button.

- **Title**: the page title, or the page URL when the title is empty. Titles over 256 characters are cut with a trailing `…`.
- **Body**: the page URL.

## Setup

### 1. Build

Requires Node.js 24 (see `.tool-versions`) and [pnpm](https://pnpm.io/).

```sh
pnpm install
pnpm build
```

The extension is written to `dist/`.

### 2. Load it in Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select the `dist/` directory.

### 3. Create a fine-grained token

1. On GitHub, open **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Set an **Expiration**.
3. Under **Repository access**, choose **Only select repositories** and select the repository that will receive the Issues (the Target Repository).
4. Under **Repository permissions**, set **Issues** to **Read and write**. Leave every other permission unset.
5. Generate the token and copy it.

Keep the token limited like this so a leaked token exposes little.

### 4. Configure the extension

1. Click the extension button. With no settings saved, the settings page opens. (You can also open it from the extension's **Options**.)
2. Enter the Target Repository as `owner/name`.
3. Paste the token into **Personal access token**.
4. Click **Save**.

## Usage

Click the extension button on any page. An Issue is created in the Target Repository, and a badge on the button shows the result for that tab:

| Badge | Meaning |
|---|---|
| ✓ | The Issue was created. |
| ✗ | It failed: the page has no URL (for example `chrome://` pages and the Chrome Web Store), or GitHub or the network returned an error. |
| none | Nothing has been saved from this tab yet; the badge is cleared at the start of each click. |

If the settings are incomplete, or GitHub rejects the token (expired or revoked), the settings page opens instead.

Each click creates a new Issue. Clicking twice on a page creates two Issues.

## Token storage

- The token is **not stored on disk**. It is kept only in memory (session storage), so you must paste it again after a browser restart or an extension update, reload, or re-enable. Keeping the token in a password manager makes this quick.
- The token is sent only to the GitHub API.

## Privacy

Saved titles and URLs follow the Target Repository's visibility. In a public repository anyone can read them. The extension does not check whether the repository is public or private.

## More

- [Design doc](docs/design/one-click-github-issue.md)
- [ADR: Authenticate with a fine-grained PAT](docs/adr/authenticate-with-fine-grained-pat.md)
- [ADR: Keep the token in session storage](docs/adr/keep-the-token-in-session-storage.md)
