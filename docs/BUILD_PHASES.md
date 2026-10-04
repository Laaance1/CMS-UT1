# Build phases and acceptance checks

All paths below are relative to the root `UNIT TEST CMS` folder. On Windows use `npm.cmd` wherever a command says `npm`. Container checks require a running Docker engine. Application checks can use the explicitly labeled demo mode while the CMS is offline. This log separates implemented source from services that actually ran; see VERIFICATION.md for observed results.

## Phase 1 — Root project structure

Created `package.json`, `.gitignore`, `.dockerignore`, and `docs/ARCHITECTURE.md`.

```text
root/
  frontend/ backend/ cms/ content/ scripts/ tests/ docs/
  package.json
```

Run `npm ci`. Verify `npm ls --workspaces --depth=0` lists Angular/Tailwind and Feathers workspaces.

## Phase 2 — PostgreSQL

Created the postgres service in `compose.yaml` and database names in `.env.example`.

```text
root/compose.yaml
root/.env.example
```

Run `npm run setup:env`, then `docker compose up -d postgres`. Verify `docker compose exec postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'`. The named volume preserves data between container restarts.

## Phase 3 — Directus

Added the pinned Directus service, database dependency, health check and uploads volume in `compose.yaml`.

```text
root/compose.yaml → directus service
```

Run `docker compose up -d directus`. Verify `http://localhost:8055/server/health` and `docker compose ps`.

## Phase 4 — Directus administrator

Created `scripts/setup-env.mjs` to generate private credentials without printing or overwriting them.

```text
scripts/setup-env.mjs
.env.example
.env (private, ignored)
```

Run `npm run setup:env`. Set ADMIN_EMAIL before the first Directus start. Sign in at `http://localhost:8055/admin` using ADMIN_EMAIL / ADMIN_PASSWORD. Confirm the PostgreSQL credentials are separate. Changing bootstrap variables after initial creation does not change an existing admin password.

## Phase 5 — Directus collections

Created the eleven collections, relationships, publishing rules, initial curriculum and additive importer.

```text
cms/schema.mjs
cms/bootstrap.mjs
content/catalog.mjs
```

Run `docker compose --profile setup run --rm cms-setup`. Check all collections in Directus. Rerun setup and verify existing records are not duplicated or overwritten. Seed matching uses slugs and child parent/title pairs.

## Phase 6 — Directus media and screenshots

Added file relationships, the Node-RED Guide folder tree, image captions, alt text and published-owner file access.

```text
cms/schema.mjs → media fields and reverse relationships
cms/bootstrap.mjs → folders and file policy
docs/CMS_GUIDE.md
```

Run the phase 5 setup command. Upload a PNG into Interface and attach it to a published lesson. Verify an anonymous asset read succeeds only when a published owner references the file. Verify draft-only files are denied.

## Phase 7 — Directus video fields

Added lesson/step/node/project/troubleshooting YouTube fields and the separate videos collection.

```text
cms/schema.mjs → youtube_url, titles, descriptions, video library
docs/CMS_GUIDE.md → video authoring workflow
```

Run the phase 5 setup command. Add a real YouTube watch URL to a draft video record, upload a thumbnail and enter duration manually. Keep it draft until ready to show it. No scraped or invented videos are seeded.

## Phase 8 — FeathersJS backend

Created the read-only catalog/search services, anonymous CMS client, publication filtering, image proxy and health endpoint.

```text
backend/src/app.mjs
backend/src/index.mjs
backend/src/services/content.mjs
```

For host development set DIRECTUS_URL to `http://127.0.0.1:8055`, then run `npm run dev:api`. For a CMS-free preview run `npm run demo:api` instead. Visit `http://localhost:3030/api/health`. `npm test` verifies read endpoints and public write rejection.

## Phase 9 — Angular

Created a standalone Angular application, lazy page routes and typed content interfaces.

```text
frontend/angular.json
frontend/src/main.ts
frontend/src/app/app.component.ts
frontend/src/app/app.routes.ts
frontend/src/app/core/models/content.ts
```

Run `npm run dev` with the backend running. Open `http://localhost:4200`. Run `npm run build` to validate templates and production compilation.

## Phase 10 — Tailwind CSS

Integrated Tailwind through PostCSS and added the shared light-theme styles, spacing, responsive grids and reduced-motion behavior.

```text
frontend/.postcssrc.json
frontend/src/styles.css
```

Run `npm run build`. Inspect 1440px, 768px and 390px widths, including 200% text zoom. Confirm code scrolls inside its container rather than widening the page.

## Phase 11 — Homepage

Created the flow illustration, learning path cards, feature links, editor screenshot section, featured-video section and first-flow entry point.

```text
frontend/src/app/pages/home/home.component.ts
frontend/src/app/pages/home/home.component.html
```

Run `npm run dev`. Visit `/`, follow Start learning and Installation guide, and verify module lesson counts come from the catalog. The flow drawing is explicitly an illustration; real screenshot slots stay labeled until uploaded.

## Phase 12 — Documentation layout

Created the desktop course sidebar, readable central article, generated table of contents, mobile lesson drawer and back-to-top action.

```text
frontend/src/app/pages/lesson/lesson.component.ts
frontend/src/app/pages/lesson/lesson.component.html
frontend/src/styles.css → docs layout
```

Open `/lesson/creating-your-first-flow`. On desktop check three columns; on tablet check the collapsible contents; on mobile open and close lesson navigation using keyboard and pointer. Escape should close the native drawer.

## Phase 13 — Directus API integration

Created HttpClient services, central environment configuration, explicit loading/error states and a development API proxy.

```text
frontend/src/app/core/services/content.service.ts
frontend/src/environments/environment.ts
frontend/proxy.conf.json
```

Use real Directus mode, edit a published lesson, wait five seconds and reload. Stop the CMS and confirm a readable error appears instead of silently showing seed data.

## Phase 14 — Lesson pages

Added objectives, prerequisites, content sections, numbered steps, expected results, practice, source links, previous/next navigation and browser-local completion.

```text
frontend/src/app/pages/lesson/
frontend/src/app/core/services/progress.service.ts
frontend/src/app/shared/components/info-box.component.ts
```

Open a lesson, mark it complete and reload. Check progress on `/learn`. Verify a draft parent module hides its lessons. `npm test` checks parent/child publication rules.

## Phase 15 — Screenshot components

Created `<app-tutorial-image>` with placeholder, title, description, caption, alt text, optional step number and image preview.

```text
frontend/src/app/shared/components/tutorial-image.component.ts
```

Upload a screenshot using the CMS guide. Click or keyboard-activate it; close with Escape and confirm focus returns. Check the editor lesson gallery. No stock screenshots are used.

## Phase 16 — YouTube components

Created a strict YouTube parser, privacy-enhanced video player and video library cards.

```text
frontend/src/app/core/youtube.ts
frontend/src/app/shared/components/video-player.component.ts
frontend/src/app/shared/components/video-card.component.ts
```

Run `npm test`. Publish a valid library video, confirm its player and related lesson, then remove the lesson's URL and verify the lesson player disappears. Test that a deceptive non-YouTube host never embeds.

## Phase 17 — Node guide pages

Added 13 node cards and details covering input/output, purpose, configuration, examples, mistakes and practice.

```text
frontend/src/app/pages/learn/catalog.component.*
frontend/src/app/pages/lesson/lesson.component.*
content/catalog.mjs → node_guides
```

Visit `/nodes`, filter by category and open `/nodes/inject`. Confirm links, configuration screenshot slots and optional video rendering.

## Phase 18 — Search

Added query-string search across lessons, modules, nodes, projects, videos and troubleshooting. Tutorial lessons use the canonical lesson result type.

```text
frontend/src/app/pages/search/search.component.ts
backend/src/services/content.mjs → searchCatalog
```

Visit `/search?q=MQTT`; check mixed result types and navigation. Try an empty query and a no-match query. `npm test` covers search and input validation.

## Phase 19 — Projects

Added ten CMS-managed project briefs, difficulty filtering, requirements, build sections and practice outcomes.

```text
content/catalog.mjs → projects
frontend/src/app/pages/learn/catalog.component.*
frontend/src/app/pages/lesson/lesson.component.*
```

Visit `/projects` and `/projects/mqtt-sensor-monitor`. Edit one project's content in Directus and check the page after reloading. Hardware exercises require testing on the actual devices.

## Phase 20 — Raspberry Pi setup

Created the 64-bit Pi installation, networking, administrator, reboot, backup and restore guide.

```text
RASPBERRY_PI_SETUP.md
```

Follow its numbered sequence on a Pi 5. Verify `uname -m`, Docker service startup, LAN access and one real backup/restore. Actual Pi hardware verification cannot be replaced by desktop compilation.

## Phase 21 — Docker packaging

Created workspace-aware Dockerfiles, Nginx SPA/API routing, persistent volumes, service dependencies and health checks.

```text
compose.yaml
backend/Dockerfile
frontend/Dockerfile
frontend/nginx.conf
.dockerignore
```

Run `docker compose config --quiet`, then the first-run sequence in README. Open a nested lesson URL directly. Restart containers and verify uploaded images and CMS edits persist.

## Phase 22 — Testing

Created focused URL, publication, CMS-failure/pagination, search and HTTP API tests plus seed validation.

```text
tests/content.test.mjs
scripts/check-content.mjs
docs/VERIFICATION.md
```

Run `npm test`, `npm run check:content`, `npm run build`, and `docker compose config --quiet`. Browser checks and real CMS tests are tracked separately from these automated checks.

## Phase 23 — Documentation

Created the main README, architecture overview, CMS workflow, phase log, verification log and Raspberry Pi operations guide.

```text
README.md
RASPBERRY_PI_SETUP.md
docs/ARCHITECTURE.md
docs/CMS_GUIDE.md
docs/BUILD_PHASES.md
docs/VERIFICATION.md
```

Perform the README first-run steps on a clean machine, then publish one new lesson without changing Angular source. Give the professor the Pi setup guide and private credentials separately.
