# Contributing

Thanks for considering a contribution to Site Data Cleaner.

## How to propose a change

1. Open an issue first for bugs or feature ideas so we can agree on scope.
2. Fork the repository and create a branch from `main`:
   - `fix/<topic>` for bug fixes
   - `feat/<topic>` for new features
   - `docs/<topic>` for documentation only
3. Keep one topic per pull request.

## Local development

1. Load the repository as an unpacked extension in Chrome or Edge (`chrome://extensions/`, developer mode).
2. After edits, run the build/verify script:

   ```bash
   ./build.sh --all
   ```

   This validates `manifest.json` and produces the Chrome/Edge zips in `dist/`.
3. Test the affected flows manually: popup clear, silent list clear, F5 interception, and the keyboard shortcut.

## Rules

- No network calls or telemetry: the extension must keep working fully locally.
- Do not add permissions beyond what the feature strictly requires.
- Do not commit `dist/` output or local test archives.
- Keep `manifest.json` version and `CHANGELOG.md` in sync for user-facing releases.

## Pull requests

- Fill in the PR template and describe verification steps.
- CI must pass before review.
