# Poop Diary: Expo foundation plan

Date: 2026-10-04. The foundation lives in `apps/mobile` and already includes themes, three languages, SQLite, CRUD for all six record types, Diary, Insights, Report, and the component gallery. Azure and device verification remain for the team to connect and confirm. This document records the architecture constraints and course requirements; commands are in the [mobile README](../apps/mobile/README.md).

Daily rules for the team and agents live in [PROJECT_GUIDE.md](../PROJECT_GUIDE.md).

## Goals

Three members should be able to use Codex or Claude Code on separate features while keeping visual, interaction, and data rules consistent. Changing one semantic theme value should update every component that uses it. Create and edit should share one editor. Changing language must not change record meaning or statistics.

The course delivery also follows the [HAMK grade 5 checklist](./course-grade-5-checklist.md). The grade is cumulative: the final submission needs both SQLite and a server app, real additional RN features, and RN work from every member. “Phase 1” here means the foundation only, not the final course submission.

## Recommended stack

| Purpose | Decision |
| --- | --- |
| App foundation | Current Expo stable template, React Native default architecture, TypeScript strict mode |
| Navigation | Expo Router; `src/app` contains routes, layouts, and parameter forwarding only |
| Styling | React Native StyleSheet, typed theme, and shared components |
| Local state | React `useState` / `useReducer`, kept inside the owning feature |
| Cross-screen state | Small Zustand store for settings, loading state, and record cache; the database is the source of persistence |
| Local records | `expo-sqlite` through one repository with schema migrations |
| Cloud work | Required for the course; Azure is the current preference, with an actual client call |
| Localisation | i18next / react-i18next with stable keys for English, Finnish, and Chinese |
| Baseline checks | ESLint, TypeScript, focused business/storage tests, and Expo dependency checks |

Install Expo-compatible dependency versions and commit the lockfile. Target development builds for normal work; Expo Go is acceptable for early UI checks. Keep Expo CNG and maintain native configuration through app config and config plugins.

Do not add a generic CRUD framework, a complex dependency-injection container, or a full offline-sync system before it is needed. Decide API caching and sync rules when the real backend is connected; replacing one function does not make SQLite cloud-synchronised.

The server is a required later deliverable, not an optional idea. After the foundation, implement and deploy a small cloud feature such as backup management. Keep daily records in SQLite and do not force automatic multi-device sync into the first version. Azure services, server scope, hosting, and cloud database are team decisions, but the client must call the deployed service; an account, health endpoint, or mock-only server is not enough.

## Structure and boundaries

The paths below are relative to `apps/mobile/`, not the legacy root `src/`.

```text
src/
  app/                         Expo Router routes and root layout
  features/                    Screens and complete feature flows
    home/
    diary/
    food/
    bowel/
    symptoms/
    water/
    exercise/
    sleep/
    insights/
    profile/
  design-system/
    tokens/                    Colors, type, spacing, radius, motion
    components/                Button, Text, Card, Choice, Slider, Sheet, Toast
    ThemeProvider.tsx
  domain/
    records/                   Six record types, codes, validation, date and unit rules
    analytics/                 UI- and language-independent statistics
  data/
    repositories/              Shared read/write interfaces and implementations
    sqlite/                    Database setup, queries, and migrations
    api/                       Cloud requests, response validation, and errors
  state/                       Shared state and record cache
  i18n/
    locales/                   en / fi / zh, grouped by feature namespace
assets/
docs/
tooling/                       Required checks and ESLint rules
```

Create folders with their implementation; do not create empty placeholder trees. Each feature exposes its screens or explicit public interfaces. Other features must not import its internal files.

Routes call features. Features call the design system, domain rules, and shared record service. The data layer owns persistence. The domain layer must not depend on React, Expo, the database, or the translation library. Screens must not read SQLite directly or maintain a second record state.

Complex record flows keep typed steps and back behavior inside their feature. Navigation owns screens and sheets; the flow owns the draft. Keep the six branches distinct instead of forcing every feature into one generic form.

## Design system: three layers

### 1. Foundation values

Define raw colors and dimensions only here: warm canvas, brown text, rose accents, spacing, type sizes, and radii. Keep the prototype's warm direction with a beige canvas, cream cards, dark brown text, and feature colors such as water blue, coffee brown, and tea brown. Confirm exact values with component previews and contrast checks.

### 2. Semantic theme

Screens use purpose-based names rather than raw color names. Support light and dark themes, with system mode selecting one.

```text
colors.surface.canvas / card
colors.text.primary / secondary / disabled
colors.action.primary.background / foreground / pressed
colors.border.default / selected
colors.feedback.success / warning / danger
colors.entry.food / bowel / symptom / water / exercise / sleep
colors.beverage.water / coffee / tea / juice / milk / alcohol
colors.severity.mild / moderate / severe
spacing / typography / radius / motion
```

Every colored background also defines its text color, border, and selected state. Severity colors and record-category colors are separate. Never use color alone to communicate selection or severity; retain text, an icon, or a selected marker.

### 3. Shared components

Screens use `Button variant="primary"`, `Choice selected`, and `Text variant="body"` instead of rewriting colors, type, and pressed states. One Button change should update every save action.

The first component set covers the real flows: Screen, Text, Button, IconButton, Card, Choice/ChoiceGroup, Slider, Stepper, Sheet, Toast, and required inputs. Components own hit targets, loading, disabled, selected, feedback, and accessibility behavior.

Theme shape example:

```ts
// Raw values live only in the theme definition.
const lightTheme = {
  colors: {
    surface: { canvas: '#F6F1E9', card: '#FFFCF7' },
    text: { primary: '#2B1F19', secondary: '#766A5F' },
    action: {
      primary: { background: '#2B1F19', foreground: '#FFFCF7' },
    },
  },
} as const;

// Shared Button reads the theme; feature screens provide no raw color.
// <Button variant="primary" onPress={save}>{t('common.save')}</Button>
```

This illustrates the structure, not a complete theme. Use a spacing scale and named type styles such as `caption`, `label`, `body`, `sectionTitle`, and `pageTitle`. Gesture coordinates, progress values, and calculated dimensions are dynamic values, not fixed design tokens.

Light and dark themes share one `Theme` type. The type describes purpose, not a light-theme color literal. Start with system fonts, 16 or larger for body text, and 14 or larger for supporting text. Interactive areas should be at least 48 RN layout units. Let the platform handle font scaling and centralise motion-reduction behavior.

Target WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text, and 3:1 for essential control icons, borders, and adjacent colors. Check default, pressed, selected, and error foreground/background pairs in both themes.

## Data before display text

The early prototype used a broad `Record` with translated meal, symptom, and feeling strings; some statistics matched titles. Migrate to a union of six explicit record types with required fields.

Store stable codes such as `symptomCode: 'bloating'`; render the active locale's label (for example, English “Bloating” or Finnish “Turvotus”). Severity, meal, and drink type also use stable codes. Preserve user-entered food names and notes as entered; they are not translation keys.

Define IDs, event time, diary date, timezone, modified time, and `schemaVersion`. Store water in ml and sleep duration in minutes; convert only for display. Define which diary date owns sleep across midnight. Derive titles and summaries from records instead of storing stale display strings. Food pattern analysis should use category data, not regular expressions over translated text.

## Rules to enforce

1. Screens do not contain raw colors, private type sizes, radii, or spacing; use theme tokens.
2. Buttons, choices, sliders, sheets, and save feedback use shared components.
3. Create and edit share one Editor; only the initial values and save target differ.
4. Keep drafts inside the feature; derive summaries and charts from records instead of a second aggregate state.
5. All writes go through the shared record service; update the shared cache only after a successful database write.
6. Built-in labels use stable translation keys; business data never depends on display language.
7. Support Finnish wrapping and system font scaling; do not disable scaling or clip text to hide layout problems.
8. A named teammate reviews changes to shared themes, components, and data contracts.

Use ESLint import boundaries plus checks for color literals and restricted style properties. Apply rules to feature files, with explicit exceptions for theme definitions, shared component internals, and documented dynamic calculations. Documentation alone cannot prevent duplicate styles.

`AGENTS.md` and `CLAUDE.md` point to `PROJECT_GUIDE.md`; read this plan and the course checklist as needed instead of copying the rules.

## Phase 1 delivery and acceptance

Build the foundation first, then the complete bowel flow, and let the team migrate the other features in parallel.

Foundation: Expo routes, theme switching, localisation, component gallery, SQLite setup and record interface, check commands, and CI. The gallery shows default, pressed, selected, disabled, loading, and error states in both themes and with long text.

First complete path: create bowel entry -> brief save feedback -> view on Home/Diary -> edit in the same form -> delete -> verify after restart.

The later course delivery must also include the cloud feature and native API call, a real RN feature not covered in class, the other record flows, GitHub and a task board, and RN contributions plus cross-explanations from all three members. Keep evidence against the course checklist.

Acceptance checks:

- Changing the primary action token updates every primary action.
- Foreground/background contrast meets the target in light and dark states; selected and severity states have a non-color cue.
- Chinese, English, Finnish, both themes, and larger text remain readable and usable.
- Create/edit share the flow, refill existing values, and cancel without overwriting saved data.
- Failed saves do not show success; repeated taps do not create duplicates; data survives restart.
- Language changes do not change statistics; schema migration and reads are tested.
- Checks detect raw feature colors and invalid imports.

Do not treat empty folders or many installed libraries as foundation completion.

## Official references

- WCAG 2.2 contrast: [1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).
- React Native environment: [Environment setup](https://reactnative.dev/docs/environment-setup)
- Expo Router: [Introduction](https://docs.expo.dev/router/introduction/)
- Expo TypeScript: [Guide](https://docs.expo.dev/guides/typescript/)
- Expo native project management: [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/)
- Expo local storage: [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- Expo development builds: [Introduction](https://docs.expo.dev/develop/development-builds/introduction/)
- React Native styling: [Style](https://reactnative.dev/docs/style)
- Unistyles 3 and Expo Go limits: [Getting started](https://www.unistyl.es/v3/start/getting-started/)

This plan prefers React Native's built-in styling. NativeWind, Unistyles, and Tamagui can solve specific needs, but none replaces tokens, shared components, and enforceable checks.
