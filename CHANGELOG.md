# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-10-12

### Fixed
- HTTP disk cache is now cleared along with Cache API storage — "clear & reload" no longer serves stale cached assets
- Registrable-domain detection: two-part public suffixes (e.g. `bbc.co.uk`, `com.cn`) no longer produce a bare-suffix root domain

## [1.1.1] - 2026-10-12

### Fixed
- Manifest description trimmed to 87 chars (was 190, over the store limit of 132)
- Icons regenerated at declared sizes: 16 / 48 / 128 px (were 32 / 96 / 256)
- Screenshots regenerated at 1280×800 (store requirement; were 664×480 and 1400×1274)

### Added
- `build.sh` — one-command build & verify producing Chrome and Edge zips with structural checks

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
