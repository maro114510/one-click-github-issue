# Keep the token in session storage

## Context

The token lets anyone who holds it create and edit Issues in the Target Repository, so where the extension keeps it decides who can take it.

Chrome isolates an extension's storage from web pages and from other extensions, and this extension has no content scripts, so neither can read the token wherever it is kept. The remaining exposure is the disk: `chrome.storage.local` and `chrome.storage.sync` write their data, unencrypted, into the browser profile, where malware running as the user, a stolen disk, or a backup of the profile can read it.

`chrome.storage.session` holds its data in memory and never writes it to disk. Chrome clears it when the browser restarts or the extension is disabled, reloaded, or updated, and does not expose it to content scripts unless the extension changes its access level.

## Decision

The extension keeps the token only in `chrome.storage.session`, at its default access level. The Target Repository is not a secret and stays in `chrome.storage.local`.

## Rationale

- Session storage removes the disk exposure without adding code or dependencies. The cost, entering the token again after a restart, is small when the user pastes it from a password manager.
- **Encrypting the token with a passphrase**, with the ciphertext in local storage and the derived key in session storage, was rejected. It also needs input after every restart, a passphrase instead of the token, and adds cryptographic code of our own without protecting anything session storage leaves exposed.
- **A non-extractable key in IndexedDB** was rejected. The key is stored in the same profile as the ciphertext, so reading the disk yields both, and the encryption only obscures the token.
- **The OS keychain through Native Messaging** was rejected. It is the strongest option that keeps the token across restarts, but it needs a native host program installed on every machine, which goes against keeping the extension minimal and complicates Chrome Web Store distribution.

## Consequences

- The user enters the token again after the browser restarts or the extension is disabled, reloaded, or updated. Until then, a click opens the settings page.
- The token is never written to disk, which replaces the "stored unencrypted on the device" consequence of [Authenticate with a fine-grained PAT until store publication](authenticate-with-fine-grained-pat.md).
- Malware that reads the browser's memory or captures keystrokes as the same user can still take the token. No storage an extension controls prevents that, so limiting the token to one repository, to Issues, and to an expiration date remains the main limit on what a leak exposes.
