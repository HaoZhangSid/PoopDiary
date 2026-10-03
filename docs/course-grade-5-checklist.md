# Poop Diary: HAMK grade 5 checklist

## Source and use

- Course: Mobile Programming Autumn 2026, TK00ED02-3002.
- Criteria page: [Evaluation criteria of the Mobile Programming Project](https://learn.hamk.fi/mod/page/view.php?id=1073348).
- Page last modified: Monday, 21 September 2026, 2:12 PM.
- Checked: 2026-10-03, from the currently signed-in Moodle page.
- The requirements below quote the course page; implementation and evidence are this project's delivery plan.

Azure is the current preference; the exact service and cloud scope are still a team decision. Shared team and agent rules are in [PROJECT_GUIDE.md](../PROJECT_GUIDE.md). The course page allows GCloud RESTful or Azure, so the wording below keeps both options.

The grade is cumulative. Grade 5 requires all Basics and Grades 1–5, not just the final sentence. A document or Web prototype is not evidence of completion: each item needs working code, a run result, or a real team-process record. The teacher awards the final grade.

## Required criteria

| ID | Course requirement | Poop Diary delivery | Evidence | Current status |
| --- | --- | --- | --- | --- |
| B1 | More complex than Cross-Platform examples | Six deep logging flows, persistence, edit/delete, diary, and trends | Feature list, mobile demo, comparison with course examples | Web reference retained; native bowel flow implemented; device check pending |
| B2 | Beautiful UI with correct and versatile styling | Shared design tokens/components, light/dark themes, long-text and large-font checks | Component gallery, mobile screenshots, three locales/two themes | Native system, locales, and contrast checks done; device/large-font check pending |
| B3 | Every member has an RN programming part | All three members deliver RN screens, components, or native interaction | Ownership list, RN commits/PRs, run demo | Team evidence pending |
| B4 | If a server app is used, one member may build GCloud/Azure but everyone understands it | Azure is preferred; all members can explain client, SQLite, and API data flow | Deployment, API call, and team walkthrough | No server implementation yet |
| B5 | Use GitHub and a project-management tool | GitHub repository plus Trello or an accepted board; owned tasks with acceptance and PR links | Repository/board links and merged work | Local Git exists; team links/evidence pending |
| B6 | Everyone can explain another member's code | Cross-review, demos, and walkthroughs | Review notes and walkthrough checklist | Team evidence pending |
| G1 | Basics plus SQLite or server reads | Read actual SQLite records | Query code and Diary on a device | SQLite works; restart persistence test passed; device demo pending |
| G2 | SQLite/server read-write and at least one custom component | SQLite create/read and shared Button, Choice, Slider, etc. | Write/read evidence and reuse locations | Components and writes work; device demo pending |
| G3 | SQLite/server CRUD and navigation | Same-record create/read/edit/delete through Expo Router | Full CRUD demo and back/tab behavior | Native bowel CRUD and navigation work; device check pending |
| G4 | SQLite **and** server; at least one has CRUD; one new RN feature | Full local CRUD, deployed API, and a real device capability | Local/cloud run evidence and course-material comparison | SQLite works; server and new native capability pending |
| G5 | Comments, modular code, and several RN features beyond the course | Feature/domain/data/design-system boundaries and documented RN features | Structure, comments, feature comparison, and demo | Modular code and checks work; feature comparison/device check pending |

### Do not misread the criteria

- Grades 1–3 require SQLite **or** a server; Grade 4 requires SQLite **and** a server.
- Grade 4 requires CRUD on at least one side. This project recommends local record CRUD and one appropriately scoped cloud resource.
- “Few or many React Native features” has no fixed number. Camera, gestures, and notifications are candidates, not a stated three-feature minimum.
- Confirm “not covered in the course” against the Cross-Platform material. Do not count tab navigation until checked.
- Location, swipe, radio, and checkbox controls are explicitly optional.
- The page says GCloud RESTful or Azure. Do not assume another cloud platform or a BaaS meets the same requirement without confirmation.
- A camera mock, notification switch, simulated voice input, or fixed AI result is not a real native capability.
- Comments should explain rules, reasons, migrations, permissions, and error handling; do not comment every line mechanically.

## Delivery scope

### 1. Expo app and local records

- [ ] Run a real Expo / React Native project on a phone or emulator.
- [ ] Keep the agreed depth and branches for all six record types.
- [ ] Store records in SQLite with an explicit schema and migrations.
- [ ] Make create, read, edit, and delete operate on SQLite.
- [ ] Use one Editor for create and edit, with correct refill.
- [ ] Show brief save feedback; never show success after failure; prevent duplicate taps.
- [ ] Home, Diary, and Insights read the same records.
- [ ] Records and deletions survive a close and restart.
- [ ] Keep navigation, shared components, and module boundaries runnable and clear.

### 2. Cloud server app (required later)

- [ ] Choose the Azure service, cloud resource, and deployment plan.
- [ ] The native client calls the deployed API; an API-tool demo alone is not enough.
- [ ] Capture request, response, persistence, and failure evidence.
- [ ] Document the cloud responsibility, local/cloud relationship, and cloud-mutating operations.
- [ ] Every member can explain the API and data flow.

A small “cloud backup management” resource is a reasonable scope, or the team can choose an equivalent diary resource. SQLite remains responsible for daily records; do not force automatic multi-device sync into v1. Backup management should demonstrate create, list, update, delete, and restore if selected. This is a project proposal, not a course-mandated backup feature.

Do not count a cloud account, a health endpoint, or an unused server as delivery. Use fictional demo data.

### 3. Candidate native features

| Candidate | Product use | Required behavior | Course coverage |
| --- | --- | --- | --- |
| Real camera | Food photo logging | Permission result, capture, preview, retake, record link, restart view | Confirm against material |
| Diary swipe gesture | Quick edit/delete | Gesture does not fight scrolling; keep explicit action and undo | Confirm; the page lists it as optional |
| Local notifications | User-selected daily reminders | Permission, schedule, replace on edit, cancel on disable | Confirm against material |
| Tab navigation | Home / Diary / Insights / Profile | Native navigation, selected state, back behavior, preserved state | Confirm; the page gives it as an example |

Check the course material before choosing the final set, then add the source and demo path here. Real capture and AI recognition are separate pieces: a working camera must not be presented as real AI.

### 4. Three-member contribution

| Member | RN ownership | RN PR/commit evidence | Cross-review | Full walkthrough |
| --- | --- | --- | --- | --- |
| Member A | To assign | To fill | To fill | To verify |
| Member B | To assign | To fill | To fill | To verify |
| Member C | To assign | To fill | To fill | To verify |

The backend owner must also deliver actual RN code. AI may assist implementation, but the owner must be able to explain, modify, and demo their own and teammates' key code. One member may bootstrap the foundation, but all three still need RN contributions.

Everyone should be able to explain route entry, create/edit reuse, SQLite writes, cross-screen updates, API use, permission failures, and why statistics do not depend on locale.

## Project management and evidence

Recommended board states: To do → In progress → Review → Done. Each card contains an owner, checklist ID, user-visible result, acceptance steps, PR, and run evidence.

| Initial task | Criteria | Done when |
| --- | --- | --- |
| GitHub and board | B3, B5, B6 | Links, three permissions, ownership, and review rules exist |
| Expo foundation and design system | B2, G2, G3, G5 | Routes, themes, locales, components, and checks run |
| SQLite and bowel sample | G1–G4 | Create → view → edit → delete → restart is verified |
| Other five record types | B1, B3, G3 | Deep flow, persistence, and shared editor are verified |
| Cloud feature/API | B4, G4 | Deployment, native call, and failure handling are shown |
| New RN feature/material comparison | G4, G5 | Source comparison, device behavior, permissions, and errors are shown |
| Cross-review | B6, G5 | Module/comment review and every-member walkthrough are done |
| Final demo and submission | All | Gates below pass and evidence links are complete |

Before submission, keep an evidence index with source locations, task/PR, screenshots or video, and demo steps. Record evidence after the check; do not mark unrun tests, unreviewed work, or unsubmitted code as complete.

## Final gates

- [ ] Every B1–B6 and G1–G5 item has an evidence link and reviewer.
- [ ] Device demo covers create → Home → Diary → edit → delete → restart.
- [ ] SQLite and cloud work both show real read/write and persistence.
- [ ] Components, navigation, boundaries, and key comments can be pointed out in code.
- [ ] New RN features have course-material comparison and a live demo.
- [ ] All three members have RN contributions and can explain another member's code.
- [ ] GitHub and the project board are accessible and contain real history.
- [ ] Chinese, English, Finnish, light/dark themes, large text, and key flows are checked.
- [ ] Build, typecheck, lint, and focused tests pass; known issues are written down.
- [ ] The final build, demo, report, and submission notes describe the same version.

Confirm the final deadline, file format, demo format, and submission count from the relevant assignment page. This criteria page does not provide those details; do not apply the earlier “App idea” assignment rules automatically.

## Course source text

The following English text is retained from the course page without rewriting:

### The basics

1. The project may not be any as easy as the examples or tasks in the Cross-Platform development course.
2. The project must have beautiful UI: styles must be used correctly and versatilely. Nothing as ugly as the Cross-Platform course examples.
3. All group members must have their own part in React Native programming.
4. The GCloud RESTful OR Azure part can be done by one group member, but all should know and understand the app (if you have a server app).
5. Projects must be in GitHub and use a project-management tool such as Trello or Jira/Confluence.
6. All group members can explain code created by another member.

### Grades

The criteria are cumulative: to get grade 5, all previous requirements must be met.

- Grade 1: all requirements above plus SQLite or a server app for reading.
- Grade 2: SQLite or a server app for read/write and at least one custom component.
- Grade 3: SQLite or a server app for CRUD and a navigation system.
- Grade 4: SQLite and a server app; at least one has CRUD; at least one new RN feature not used in the Cross-Platform material.
- Grade 5: properly commented, modular code and several RN features not used in the Cross-Platform course (for example, tab navigation).

Location, swiping, radio buttons, and checkboxes are useful but not required.
