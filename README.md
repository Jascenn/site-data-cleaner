# 🧹 Site Data Cleaner

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![Chrome](https://img.shields.io/badge/Chrome-supported-brightgreen)

> A minimal Chrome extension that instantly clears cookies, localStorage, sessionStorage, IndexedDB, and cache for the current site — with an optional **silent list** for one-click and F5 auto-clear behavior.
>
> 一个极简的 Chrome 扩展。一键清除当前网站的 cookies、localStorage、sessionStorage、IndexedDB 与缓存，并支持「静默名单」实现单击或 F5 自动清理。

---

## ✨ Features

- 🧹 **One-click clear & reload** — toolbar button cleans cookies + storage + cache, then reloads the page
- 🤫 **Silent list** — sites in the silent list trigger instant clear without any confirmation popup
- ⌨️ **F5 / ⌘R interception** — on silent-list sites, page reloads are intercepted to clear data first
- ⚡ **Keyboard shortcut** — `⌘+Shift+Y` (customizable; only acts on silent-list sites to prevent accidents)
- 🔒 **Zero data collection** — everything runs locally, no network requests
- 🌐 **Works on any site** — no preset domains, you fully control the silent list

## 💡 Use cases

- Web developers testing login flows or session-based features
- Debugging cookie / localStorage related bugs
- Quickly switching test accounts on staging environments
- Privacy-conscious users clearing tracking data per-site

## 🚀 Installation

### From source (developer mode)

1. Download or clone this repository:
   ```bash
   git clone https://github.com/Jascenn/site-data-cleaner.git
   ```
2. Open Chrome and visit `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the cloned folder
5. Pin the 🧹 icon to your toolbar (Chrome jigsaw icon → 📌)

### From Chrome Web Store

> Not yet published.

## 📖 Usage

### Normal mode (default for any site)

Click the toolbar icon → confirm in the popup → site data cleared and page reloaded.

### Silent mode (for trusted / frequently-cleared sites)

1. Visit a site you want to manage frequently
2. Click the toolbar icon → click **+ Silent**
3. From now on, on this site:
   - Click toolbar icon → instant clear, **no popup**
   - Press <kbd>F5</kbd> / <kbd>⌘R</kbd> → intercepted, clear before reload
   - Press <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>Y</kbd> → instant clear

### Manage the silent list

Right-click the toolbar icon → **Options**, or click "Manage silent list" link in the popup.

## 🔧 Permissions explained

| Permission | Why it's needed |
|---|---|
| `cookies` | Remove cookies for the current site |
| `browsingData` | Clear localStorage / IndexedDB / cache per origin |
| `scripting` / `activeTab` | Inject reload script in the active tab |
| `storage` | Save your silent list locally (synced via your Google Account) |
| `tabs` | Read the active tab's URL |
| `<all_urls>` | Operate on any site you choose to clean |

Full privacy policy: [PRIVACY.md](PRIVACY.md)

## 📦 Project structure

```
site-data-cleaner/
├── manifest.json            Extension manifest (MV3)
├── background.js            Service worker — silent list + clear logic
├── content.js               F5 interception (only injected on silent-list sites)
├── popup.html / popup.js    Popup UI for non-silent sites
├── options.html / options.js   Silent list management page
└── icons/                   Extension icons
```

## 🛠️ Development

This extension is plain JavaScript with no build step. To iterate:

1. Edit any file
2. Go to `chrome://extensions/`
3. Click the 🔄 reload button on the extension card

## 📝 License

[MIT](LICENSE) © Jascen

## 🤝 Contributing

Issues and PRs welcome. See [CHANGELOG.md](CHANGELOG.md) for version history.
