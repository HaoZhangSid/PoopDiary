# Legacy Web prototype

**Reference only. Current app development is in [`apps/mobile/src`](../apps/mobile/src).**
This directory is the original React DOM / Vite prototype, retained for layout and interaction comparisons.

| Files | Legacy role |
| --- | --- |
| `main.tsx`, `App.tsx` | Browser entry, pages and logging flows |
| `styles.css` | Original CSS and Tailwind styles |
| `data.ts`, `types.ts`, `analytics.ts` | Demo data, prototype records and statistics |
| `i18n/` | Prototype translations; separate from Expo feature namespaces |
| `vite-env.d.ts` | Vite environment types |

Browser records use the old `gutlog-*` localStorage keys. They are separate from the Expo app's data.
See the [project guide](../PROJECT_GUIDE.md) for current development boundaries.
