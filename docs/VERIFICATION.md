# Verification record

Verified on the Windows development machine using Node.js 22.23.2 and npm 10.9.8.

## Passed

- Dependency installation with a committed lockfile.
- Angular production compilation, strict template checks and bundle budget.
- Seven automated tests: valid/unsafe YouTube URLs, parent publication filtering, child draft filtering, cross-type search, explicit CMS failure, paginated CMS reads without administrator credentials, and live Feathers read/write HTTP behavior.
- Content validation: all fields exist in the schema, IDs/slugs are unique within collections, foreign keys reference existing seed records, and every lesson has a practice task, expected result and tutorial step.
- `docker compose config --quiet` with generated private environment values.
- Development frontend serves a nested lesson URL successfully.
- Frontend `/api/catalog` proxy reaches the live Feathers demo API and returns the 73-lesson catalog.

The generated `.env` was excluded from source control and its credentials were not printed. Local preview uses explicit demo mode with a visible banner. Production Compose forces Directus mode and never substitutes the seed curriculum on a CMS failure.

## Environment blocks and unverified checks

Docker Desktop's Linux engine could not start. `wsl --status` reported that Windows Subsystem for Linux is not installed. Docker engine requests returned an internal error. Therefore no claim is made that PostgreSQL, Directus bootstrap, real uploads, public CMS permissions, container image builds or backup/restore have passed live integration tests on this machine.

The Browser tool reported no available browser. Desktop/mobile visual inspection, real screenshot dialog interaction, clipboard behavior, keyboard focus checks and real YouTube playback are not browser-verified in this session.

The Raspberry Pi instructions and Dockerfiles are prepared for ARM64, but no Raspberry Pi hardware was available. GPIO/project briefs have not been hardware-tested.

## Finish verification after enabling Docker

1. Follow Docker Desktop's WSL 2 setup instructions. This can require Windows administrator access and a reboot. Start Docker Desktop and verify `docker info` works.
2. Run the README first-run sequence, including `cms-setup` before starting the complete stack.
3. In Directus create a fresh module/lesson, publish both and verify the frontend.
4. Upload your own PNG to a draft lesson. Check the anonymous asset URL is denied. Publish the parent module and lesson and check that it becomes visible.
5. Keep one tutorial step and one gallery item in draft; verify those remain absent.
6. Archive the parent module; verify its lesson, children and linked videos disappear.
7. Add a valid YouTube URL; check the embed, external link, responsive aspect ratio and missing-URL behavior.
8. Verify there is no other public policy granting wider access to these collections.
9. Restart containers, confirm persisted edits/uploads, then perform the backup/restore drill on a fresh target.
10. Inspect homepage, lesson, search and video library at desktop, tablet and phone widths, including keyboard navigation and 200% text zoom.

## User-provided media still needed

All screenshot placeholders are intentional. No random stock image or fabricated Node-RED screenshot was added. The video library remains empty until real URLs and optional thumbnails are added through Directus.
