# Privacy Policy

**Site Data Cleaner does NOT collect, transmit, or store any personal data on external servers.**

Last updated: 2026-04-28

## What it accesses

- **Cookies, localStorage, sessionStorage, IndexedDB, and cache** for the active tab — only when you trigger a clear action (toolbar click, F5 on silent-list site, or keyboard shortcut).
- **Silent list** — the list of hostnames you opt-in to. Stored locally via `chrome.storage.sync`, synchronized only by your own Google Account across your devices.

## What it does NOT do

- ❌ Send any data to remote servers
- ❌ Track your browsing history
- ❌ Display ads or recommendations
- ❌ Modify website content (other than the clear/reload action you triggered)
- ❌ Read or analyze the contents of cookies / storage before clearing

## Permissions justification

| Permission | Purpose |
|---|---|
| `cookies` | Enumerate and remove cookies for the current site |
| `browsingData` | Clear localStorage / IndexedDB / cache per origin |
| `scripting` | Inject the reload script into the active tab |
| `activeTab` | Access the currently focused tab |
| `storage` | Persist the silent list locally |
| `tabs` | Read the active tab's URL to determine the hostname |
| `<all_urls>` | Required because the extension can be invoked on any site you visit |

## Open source

The full source code is available at <https://github.com/Jascenn/site-data-cleaner>. Anyone can audit the code to verify these claims.

## Contact

Questions or concerns? Open an issue at <https://github.com/Jascenn/site-data-cleaner/issues>.
