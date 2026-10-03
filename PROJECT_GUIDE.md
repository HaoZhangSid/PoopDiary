# Poop Diary — Team & agent guide

Updated: 2026-10-03.

**Now:** Vite/React Web prototype with localStorage. Expo, SQLite and the server are not implemented yet.

**Direction:** Expo + TypeScript + Expo Router; shared themed components; SQLite; Azure. Azure services and cloud scope remain open. Apply the native plan to native tasks; ordinary Web fixes stay within their requested scope.

## Core rules

1. Keep all six flows: food, bowel, symptoms, drinks, exercise and sleep, including their branches.
2. Use short copy, sensible defaults and quick controls. Avoid unnecessary explanation and steps.
3. Creation and editing share one editor. Save, edit and delete update all pages; saving gives brief feedback.
4. Support Chinese, English and Finnish; light/dark/system themes; larger system text.
5. Use shared components and semantic design tokens. Target WCAG 2.2 AA for contrast and use of color. Feature screens do not define their own fixed colors, font sizes or spacing.
6. Keep routes thin, business rules independent of UI, and database/API access in the data layer.
7. Store stable choice codes, not translated labels. Preserve user-written text. Derive summaries and statistics from records.
8. Use one record-write path and versioned storage migrations. Failed writes must not display success.
9. Keep comments meaningful and dependencies compatible with Expo and the lockfile.
10. Give each task one owner and acceptance steps. Every member contributes RN code and can explain others' code.
11. Verify actual behavior. Mock screens, planned features and unrun tests are not completion evidence.
12. The app is a diary, not a diagnosis tool. Preserve the agreed safety-stop flow without inventing medical rules.

## Current commands

```sh
npm ci
npm run dev
npm run build
```

Expo, lint and test commands are not configured yet; use actual package scripts when added.

## Details

- [Expo foundation](docs/expo-foundation-plan.md): architecture and design-system plan.
- [Grade 5 checklist](docs/course-grade-5-checklist.md): SQLite **and** server, RN features, team contributions and evidence.
