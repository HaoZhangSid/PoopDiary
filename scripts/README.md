# Legacy prototype tooling

These scripts belong to the original Web prototype, not the current Expo app:

- `localize-jsx.mjs`: rewrites Chinese JSX strings in root `src/App.tsx`.
- `generate-locales.mjs`: calls Google Translate and overwrites root `src/i18n/locales/en.json` and `fi.json`.

They were one-off migration tools, not part of normal setup or CI.
Current app translations live in `apps/mobile/src/i18n/` and feature `messages/` directories.
See [PROJECT_GUIDE.md](../PROJECT_GUIDE.md).
