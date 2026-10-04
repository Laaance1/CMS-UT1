# Node-RED Complete Guide

A visual learning platform built with **Angular, Tailwind CSS, TypeScript, FeathersJS, Directus and PostgreSQL**, packaged for a development computer or Raspberry Pi 5.

The initial curriculum includes 16 modules, 73 lessons, 79 tutorial steps, 13 node guides, 10 project briefs and 6 troubleshooting guides. Screenshots intentionally remain placeholders until you upload real Node-RED captures. The video library starts empty so you can select the actual tutorials yourself.

## Architecture

```text
Browser → Angular / Nginx → FeathersJS → Directus → PostgreSQL
                                             └→ uploads volume
Administrator ───────────────────────→ Directus Admin
```

Angular never receives a CMS administrator token or database password. Feathers reads published CMS records through the anonymous public policy. Nginx proxies `/api`, so moving to a different Pi IP does not require rebuilding the frontend.

## Folder structure

```text
frontend/
  src/app/core/             Models, content services, progress, YouTube validation
  src/app/shared/components/ Images, videos, code, callouts, icons
  src/app/pages/            Home, catalogs, lessons, search, about
  src/environments/        Central same-origin API configuration
  nginx.conf               Production routing and security headers
backend/src/
  app.mjs                  Feathers application and image proxy
  services/content.mjs     Published-content aggregation and search
cms/
  schema.mjs               Collection fields, relations, publication rules
  bootstrap.mjs            Additive setup and non-overwriting content import
content/catalog.mjs        Initial curriculum, imported into the CMS
scripts/                   Environment setup and content validation
tests/                     API and content-security tests
docs/                      Architecture, CMS instructions, implementation phases
compose.yaml               Persistent local/Pi deployment
RASPBERRY_PI_SETUP.md       Professor's deployment and recovery guide
```

## Prerequisites

- Docker Desktop running **Linux containers** on Windows, or Docker Engine with Compose v2 on Linux.
- Node.js **22.12+ in the Node 22 release line** and npm for local development. Node 22.23.2 was used here.
- Git and a browser. Docker supplies PostgreSQL and Directus; no host database installation is required.
- A separate Node-RED installation for doing the exercises and capturing screenshots.

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked. You do not need to change the machine's execution policy.

## First run: full CMS-backed stack

Run all commands from this project's root:

```powershell
npm.cmd ci
npm.cmd run setup:env
```

Open `.env` privately in your editor. Set `ADMIN_EMAIL` before starting Directus. The setup script generated separate random database and admin passwords and did not print them. It will not overwrite an existing `.env`.

```powershell
docker compose up -d postgres directus
docker compose ps
docker compose --profile setup run --rm cms-setup
docker compose up -d --build
```

Visit:

- Website: `http://localhost/`
- Directus administrator: `http://localhost:8055/admin`
- API health: `http://localhost/api/health`

Sign in to Directus with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. PostgreSQL uses `POSTGRES_USER` / `POSTGRES_PASSWORD`, which are **not** the CMS login. Bootstrap creates the administrator only for a fresh Directus database. Editing `.env` later does not reset an existing administrator password.

The CMS setup command creates missing collections/fields and imports records absent by slug (or parent/title for child records). It preserves existing administrator edits. Avoid renaming seeded slugs if you plan to rerun the seed importer: renamed records will be treated as separate content.

## Preview without Docker

This is an explicitly labeled curriculum preview. It does not persist edits or replace the CMS-backed deployment.

```powershell
npm.cmd ci
npm.cmd run demo:api
```

In another terminal:

```powershell
npm.cmd run dev
```

Open `http://localhost:4200`. Stop each process with Ctrl+C. Do not run a second backend on the same port.

## Local Angular with a real Directus instance

Start PostgreSQL and Directus and run `cms-setup` as above. Change **only the host-development value** of `DIRECTUS_URL` in `.env` to `http://127.0.0.1:8055`, then:

```powershell
npm.cmd run dev:api
npm.cmd run dev
```

Run those commands in separate terminals. Compose explicitly uses `http://directus:8055` inside its network, so its internal connection remains correct. Angular's development proxy forwards `/api` to port 3030. Production Nginx does the equivalent.

## Environment variables

| Variables | Purpose |
|---|---|
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Canonical Compose database configuration |
| `DB_CLIENT`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` | Equivalent settings for a non-container Directus installation; keep aligned if using them |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First-run Directus administrator |
| `DIRECTUS_KEY`, `DIRECTUS_SECRET` | Directus application secrets |
| `DIRECTUS_URL` | Backend-to-CMS address during host development |
| `DIRECTUS_PUBLIC_URL` | Browser-visible CMS URL |
| `FRONTEND_URL` | Documented browser-visible site address; API access is same-origin |
| `BACKEND_PORT`, `SITE_PORT` | Host development API port and published website port |
| `CMS_BIND_ADDRESS` | Localhost by default; `0.0.0.0` for trusted-LAN administration |
| `CONTENT_MODE` | `directus` normally; demo is disabled in production |

Never commit `.env`, uploads, database files, or backups. `.gitignore` and `.dockerignore` exclude private environment files.

## Content, screenshots and YouTube management

Use [docs/CMS_GUIDE.md](docs/CMS_GUIDE.md) for the complete workflow and field map.

1. Publish a module, then its lessons.
2. Add focused content sections, objectives and prerequisites.
3. Add tutorial steps and code examples; set their status to `published` as well.
4. Upload your own screenshots and select them in image fields.
5. Add image titles, captions and alt text.
6. Paste a supported YouTube URL into a lesson, step, node guide, project or video record.
7. Save and publish; reload the website after the five-second API cache expires.

Video library records support categories, related lessons, custom thumbnails, duration and `featured`. The homepage displays up to three published featured videos. YouTube iframe HTML is never accepted. Invalid or missing URLs produce no player. Published content uses uploaded screenshots; missing images have explicit placeholders.

## Checks

```powershell
npm.cmd test
npm.cmd run check:content
npm.cmd run build
docker compose config --quiet
```

See [docs/BUILD_PHASES.md](docs/BUILD_PHASES.md) for exact per-phase files, commands and acceptance checks. See [docs/VERIFICATION.md](docs/VERIFICATION.md) for actual results and pending environment checks.

## Troubleshooting the website

| Symptom | Check |
|---|---|
| Cannot connect to Docker engine | Start Docker Desktop; verify Linux containers and `docker info` |
| Directus is unhealthy | `docker compose logs --tail 80 directus postgres`; verify initial credentials and database connectivity |
| Website says content unavailable | Run `cms-setup`; check `docker compose logs --tail 80 backend`; verify public policy and published parent module |
| CMS edits do not show | Publish both the record and its parents, wait five seconds, then reload |
| Port 80 already used | Set `SITE_PORT=8080`, restart Compose and visit port 8080 |
| Missing screenshot | Upload/select an image, publish its owning record, and check file permissions |
| Video missing | Use a complete HTTPS YouTube URL with a valid 11-character video ID |
| Lesson progress disappears | Progress is device-local; private browsing or clearing browser data can remove it |

## Raspberry Pi, backup and restore

Follow [RASPBERRY_PI_SETUP.md](RASPBERRY_PI_SETUP.md). PostgreSQL and uploads use named volumes. `docker compose down` preserves them; **do not use `down -v`** on data you want to keep. Back up the database, uploads and private `.env` together and test recovery in a separate environment.

## Reference sources

Implementation follows [Angular compatibility](https://angular.dev/reference/versions), [Feathers Express services](https://feathersjs.com/api/express), [Directus permissions](https://directus.com/docs/api/permissions) and [Docker's Debian installation guidance](https://docs.docker.com/engine/install/debian/). Teaching references include [Node-RED documentation](https://nodered.org/docs/), [the official Pi guide](https://nodered.org/docs/getting-started/raspberrypi) and [FlowFuse Dashboard](https://dashboard.flowfuse.com/getting-started.html).

This is an independent educational project, not an official Node-RED product.
