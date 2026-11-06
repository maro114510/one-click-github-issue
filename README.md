# One-Click GitHub Issue

English | [日本語](README.ja.md)

Save the page you're looking at as a GitHub Issue. One click, no form.

![Clicking the toolbar button turns the page into an Issue](docs/images/demo.gif)

**[⬇ Download the latest version](https://github.com/maro114510/one-click-github-issue/releases/latest/download/one-click-github-issue.zip)**
· Chrome · Setup takes about 5 minutes

| Issue part | Content                                           |
| ---------- | ------------------------------------------------- |
| Title      | Page title, or the URL when the page has no title |
| Body       | Page URL                                          |

Inspired by [One-Click TickTick](https://github.com/chrschorn/one-click-ticktick). Thanks to its author for the idea and the clear design.

## Before you start

- A GitHub account
- A password manager, or another safe place you can copy the token from

> [!IMPORTANT]
> To keep your token off the disk, the extension forgets it when Chrome restarts or the extension updates. Pasting it back takes a few seconds.

> [!NOTE]
> The extension is installed in Developer mode. If your organization manages your Chrome, Developer mode may be blocked; step 1 shows this right away.

## Setup

### 1. Install the extension

1. Download **[one-click-github-issue.zip](https://github.com/maro114510/one-click-github-issue/releases/latest/download/one-click-github-issue.zip)**.
   Not "Source code (zip)" on the Releases page; that one does not load.
2. Unzip it.
   - macOS: double-click the file in Downloads
   - Windows: right-click it, then **Extract All** → **Extract**

   You get a folder named `one-click-github-issue` with `manifest.json` inside.
3. Move that folder to your home folder, or anywhere you won't clean up.
   Chrome runs the extension from this folder, so deleting it removes the extension.
   Avoid folders synced by iCloud Drive or OneDrive, such as Desktop or Documents when syncing is on; files moved to the cloud can't be loaded.
4. Copy this into the address bar and press Enter:

   ```
   chrome://extensions
   ```

5. Turn on **Developer mode** at the top right.
6. Click **Load unpacked**, and select the `one-click-github-issue` folder itself. Don't open it.

   ![Developer mode and Load unpacked on chrome://extensions](docs/images/load-unpacked.png)
7. If the icon isn't in your toolbar, click the puzzle icon, then the pin next to **One-Click GitHub Issue**.

✅ The extension icon is now in your toolbar.

### 2. Create a repository for your Issues

**[Create the repository](https://github.com/new?name=saved-pages&visibility=private&description=Pages+saved+by+One-Click+GitHub+Issue)**: the name and Private visibility are filled in, so just click **Create repository**.

> [!CAUTION]
> In a public repository, anyone can read every page you save.

<details>
<summary>Using an existing repository instead</summary>

Make sure it has an **Issues** tab. Forks have Issues turned off by default; turn them on in the repository's **Settings**, under **Features**.

</details>

✅ Note the repository's `owner/name`, the part after `github.com/` in its address, for example `octocat/saved-pages`.

### 3. Create a token

1. Open **[Create a token](https://github.com/settings/personal-access-tokens/new?name=One-Click+GitHub+Issue&description=Creates+Issues+from+the+One-Click+GitHub+Issue+extension&expires_in=365&issues=write)**.
   The name, a 1-year expiration, and the Issues permission are filled in.
2. Under **Repository access**, choose **Only select repositories**, then pick the repository from step 2.
   This is the only field you set yourself.

   ![Only select repositories, with the repository chosen](docs/images/token-repository-access.png)

   <details>
   <summary>Repository owned by an organization</summary>

   Set **Resource owner** to the organization first. Its admins may need to approve the token, and they may require a shorter expiration.

   </details>
3. Click **Generate token**, then **Generate token** again in the confirmation. Leave the other permissions as they are; **Metadata: Read-only** is added automatically.
4. Copy the token (it starts with `github_pat_`) and save it in your password manager now. GitHub shows it only once.

✅ Your password manager holds a token that starts with `github_pat_`.

### 4. Connect

1. Click the extension icon. The settings page opens.
2. Enter your `owner/name`, paste the token, and click **Save**. **Saved** appears.

   ![Settings page after saving, with the repository filled in and the token set](docs/images/settings.png)
3. Come back to this page and click the extension icon.

✅ A green ✓ appears on the icon, and this page is now an Issue in your repository's **Issues** tab. You're all set.

## Everyday use

Click the icon on any page.

| Badge | Meaning                        |
| ----- | ------------------------------ |
| ✓     | Issue created                  |
| ✗     | Not saved; see Troubleshooting |
| None  | Nothing saved in this tab yet  |

After Chrome restarts, the first click opens the settings page and **does not save that page**. Paste the token, click **Save**, then go back to the page and click again.

Each click creates a new Issue, even on the same page.

## Update

Get notified: **Watch** → **Custom** → **Releases** at the top of this repository.

1. Download and unzip the [latest version](https://github.com/maro114510/one-click-github-issue/releases/latest/download/one-click-github-issue.zip).
2. Replace everything inside your existing `one-click-github-issue` folder with the new files.
   Keep the same folder; loading a different folder installs a second copy that has lost your settings.
3. On `chrome://extensions`, click the reload icon on the extension's card.
4. Paste the token again.

<details>
<summary><b>Troubleshooting</b></summary>

| Symptom                                                    | Fix                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Developer mode can't be turned on                          | Your organization's Chrome policy blocks it; the extension can't be installed on this browser                                                                                                                                                                                     |
| "Manifest file is missing or unreadable"                   | Unzip first, then select the folder that contains `manifest.json`                                                                                                                                                                                                                 |
| No icon in the toolbar                                     | Pin it from the puzzle icon (Setup 1.7)                                                                                                                                                                                                                                           |
| The extension disappeared or shows an error                | The folder was moved or deleted; repeat Setup 1                                                                                                                                                                                                                                   |
| Every click opens the settings page                        | The token is gone after a restart, expired, or revoked; paste it again or [create a new one](https://github.com/settings/personal-access-tokens/new?name=One-Click+GitHub+Issue&description=Creates+Issues+from+the+One-Click+GitHub+Issue+extension&expires_in=365&issues=write) |
| ✗ on `chrome://` pages, the Chrome Web Store, or a new tab | Chrome hides these pages' addresses from extensions; expected                                                                                                                                                                                                                     |
| ✗ on every page                                            | Check the `owner/name` spelling, that the token includes that repository, that the repository has Issues turned on, and, for organizations, that the token is approved                                                                                                            |

</details>

## Privacy and security

- Sends only the page title and URL, only to the GitHub API, only when you click.
- Permissions: `activeTab` (the tab you click on), `storage` (your settings), `api.github.com`.
- The extension keeps the token in memory and never writes it to disk.
- The token can read and write Issues, and read basic metadata, in the one repository you chose. Like every fine-grained token, it can also read public repositories.
- Why Developer mode? The extension isn't on the Chrome Web Store yet, so you load this repository's release directly.

## Uninstall

1. On `chrome://extensions`, click **Remove** on the extension's card.
2. Delete the `one-click-github-issue` folder.
3. Delete the token in [GitHub token settings](https://github.com/settings/personal-access-tokens).

## Development

Requires Node.js 24 and pnpm.

```sh
pnpm install
pnpm build   # outputs dist/, then load it with Load unpacked
```

- [Design doc](docs/design/one-click-github-issue.md)
- [Token ADR](docs/adr/authenticate-with-fine-grained-pat.md)
- [Session storage ADR](docs/adr/keep-the-token-in-session-storage.md)
