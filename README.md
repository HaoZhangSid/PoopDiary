# Poop Diary

**Develop the Expo / React Native app in [`apps/mobile`](apps/mobile/README.md).**
The root `src/` is the **legacy Web prototype**, retained as a visual and interaction reference.

| Location | Status | Purpose |
| --- | --- | --- |
| [`apps/mobile/`](apps/mobile/README.md) | **Current app** | Expo, React Native, TypeScript and Expo Router |
| [`src/`](src/README.md) | **Legacy prototype** | React DOM, Vite, Tailwind and browser localStorage |
| [`scripts/`](scripts/README.md) | **Legacy tooling** | One-off Web prototype translation scripts |
| Root `package*.json`, `index.html`, Vite/Tailwind/PostCSS/TS configs | **Legacy prototype** | Install and build the original Web app; root `mobile*` commands forward to Expo |
| [`PROJECT_GUIDE.md`](PROJECT_GUIDE.md), `docs/`, `.github/` | **Shared** | Team rules, course requirements and CI |

## Run the current app

```sh
cd apps/mobile
npm ci
npm start -- --go   # Expo Go on a compatible phone
# or: npm run web   # Expo Web at http://localhost:8081
```

Stop any running Expo/Metro processes before running `npm ci` on Windows.
See the [mobile README](apps/mobile/README.md) for development builds and checks.

## Run the legacy reference

From the repository root:

```sh
npm ci
npm run dev         # Original Web prototype at http://localhost:5173
```

The two apps have separate dependencies and data. Installing at the root does not install Expo dependencies.
Read [PROJECT_GUIDE.md](PROJECT_GUIDE.md) before contributing.
