# Poop Diary — Current Expo app

Expo SDK 57 / React Native / TypeScript / Expo Router. Read [the shared guide](../../PROJECT_GUIDE.md).

This is the current development app. Root `src/`, CSS, Vite configs and translation scripts belong to the [legacy Web reference](../../src/README.md). Expo Web on port 8081 runs this app; the original Vite prototype runs on port 5173.

Run these commands from `apps/mobile`; its dependencies are installed separately from the root prototype. Stop Expo/Metro before reinstalling dependencies on Windows.

```sh
npm ci
npm start                 # LAN; development build
npm start -- --go          # compatible Expo Go for early UI testing
npm run web               # http://localhost:8081
npm run check             # types, lint, tests
npx expo-doctor
npm run export:web        # dist/web
npm run export:native     # Android/iOS JS bundles; not an installed native build
```

Implemented: Home, Diary, Profile, component gallery, three languages, light/dark/system themes, SQLite, all six logging flows, Insights, Report, and shared add/edit/delete editors. Azure integration and native device verification remain pending.

`src/app` contains routes; `features` owns screens; `domain` owns types/rules; `data` owns SQLite; `state` owns shared caches; `design-system` owns themes and controls. Translations use feature namespaces. Cross-feature imports use public indexes.

Theme values live in `src/design-system/tokens/theme.ts`. Lint rejects feature color/size literals, deep feature imports and direct database access. Tests cover contrast, translation coverage, these rules and real SQLite persistence/rollback.

Android/iOS use SQLite. Expo Web currently uses `LocalStorageDiaryRepository` with `poop-diary.*` keys; this adapter belongs to the current app. The legacy prototype uses different `gutlog-*` keys. Data is separate across these apps, browser origins and native devices; there is no automatic migration.

Native projects follow Expo CNG. `eas.json` defines development/preview profiles; cloud builds need the team's EAS account configuration. Native device behavior and Azure still require team verification. Upstream Expo toolchain dependency advisories remain in `npm audit`; resolve them before production release.

Previous checks (2026-10-04): TypeScript, ESLint and 85 tests passed; Expo Doctor passed 21/21 checks. Tests cover the SQLite repository. Browser smoke testing covered all six flows, create/edit/delete/undo, browser persistence, warning stop, sliders, three languages and light/dark layouts at mobile width. Web and Android/iOS JS exports passed. These checks do not replace device testing or the remaining course deliverables.
