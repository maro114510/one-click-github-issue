# Authenticate with a fine-grained PAT until store publication

## Context

The extension creates Issues on the user's behalf, so it needs a credential GitHub accepts for that account. It cannot reuse the browser's github.com session: the GitHub REST API does not accept that session.

GitHub's OAuth web flow requires the client secret when exchanging the authorization code for a token, even with PKCE. An extension can only send the secret if it ships it in its own code, where every user can read it. One-Click TickTick does exactly this for its TickTick secret.

The extension starts as a personal tool loaded unpacked, and is meant to be published on the Chrome Web Store later.

## Decision

The user creates a fine-grained personal access token limited to the Target Repository with the Issues read and write permission, and pastes it into the extension's settings.

Before the extension is published on the Chrome Web Store, a new ADR replaces this one with the GitHub App device flow.

## Rationale

- The product's value is saving a page in one click, with creation running in the background. A token lets the extension call the API directly, with no server and no client secret.
- A fine-grained token can be limited to one repository and to Issues, so a leaked token exposes little.
- **Opening a prefilled `issues/new` page** was rejected. It needs no credential and uses whichever account is signed in, and the user can review the Issue before submitting it. But it needs a second click to submit. It also cannot close the tab after saving or carry page content, because a URL has a length limit. That makes it a dead end for catching up with One-Click TickTick.
- **OAuth web flow** was rejected because it leaks the client secret.
- **GitHub App device flow** was deferred. It needs no secret and suits public distribution. But it requires registering a GitHub App and refreshing user tokens, which by default expire after 8 hours. That is more than a personal first version needs.

## Consequences

- Creating a token is a manual step in GitHub's settings. That is acceptable for the author, but not for store users.
- The token is stored unencrypted on the device. Anyone who can read the browser profile can create and edit Issues in the Target Repository. [Keep the token in session storage](keep-the-token-in-session-storage.md) replaces this consequence: the token is no longer written to disk.
- The token expires on the date chosen when it was created. A repository owned by a personal account can use a token with no expiration, but organizations cap tokens at 366 days by default. An expired or revoked token makes GitHub return 401, and the user must paste a new one.
- Issues are authored by the account that owns the token, not by whichever account is signed in to github.com in the browser.
