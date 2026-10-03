# Poop Diary — Expo

Expo SDK 57 / React Native / TypeScript / Expo Router. Read [the shared guide](../../PROJECT_GUIDE.md).

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

Implemented: Home, Diary, Profile, component gallery, three languages, light/dark/system themes, SQLite, and complete bowel, symptom, and water CRUD editors. Food, exercise, sleep, insights, and Azure remain pending.

`src/app` contains routes; `features` owns screens; `domain` owns types/rules; `data` owns SQLite; `state` owns shared caches; `design-system` owns themes and controls. Translations use feature namespaces. Cross-feature imports use public indexes.

Theme values live in `src/design-system/tokens/theme.ts`. Lint rejects feature color/size literals, deep feature imports and direct database access. Tests cover contrast, translation coverage, these rules and real SQLite persistence/rollback.

Browser verification uses SQLite WASM, not localStorage. Hosting browser exports requires COOP `same-origin` and COEP `require-corp`; Metro supplies these headers. Browser data and native device data are separate.

Keep one Expo Web tab open at a time: SDK 57's SQLite Web worker holds an exclusive OPFS handle. If another tab fails to open the diary, close that tab and reload after closing the first. Native SQLite does not use this browser backend.

Native projects follow Expo CNG. `eas.json` defines development/preview profiles; cloud builds need the team's EAS account configuration. Native device behavior and Azure still require team verification. Upstream Expo toolchain dependency advisories remain in `npm audit`; resolve them before production release.

Verified 2026-10-03: TypeScript, ESLint and 85 tests passed; Expo Doctor passed 21/21 checks. Browser smoke testing covered bowel create/edit/cancel/delete/undo, symptom and water editor models, SQLite persistence, warning stop, keyboard slider, three languages and light/dark layouts at 390 px. Web and Android/iOS JS exports passed. These checks do not replace device testing or the remaining course deliverables.
