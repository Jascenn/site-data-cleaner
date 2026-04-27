# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-28

### Added
- **Silent list**: opt-in per-site list for skip-confirmation behavior
- **F5 / ⌘R interception** on silent-list sites — page reload triggers automatic clear
- **Options page** for managing the silent list (add / remove hosts)
- **Keyboard shortcut** `⌘+Shift+Y` (acts only on silent-list sites)
- Per-tab dynamic popup toggling (no popup on silent-list sites)

### Changed
- Toolbar click now adapts to silent state — popup for normal sites, instant clear for silent-list sites
- Keyboard shortcut limited to silent-list sites to prevent accidental wipes on Gmail / banks / etc.

## [1.0.0] - 2026-04-27

### Added
- Initial release
- One-click clear for cookies, localStorage, sessionStorage, IndexedDB, and cache
- Confirmation popup with current hostname display
- Auto-reload after clear
