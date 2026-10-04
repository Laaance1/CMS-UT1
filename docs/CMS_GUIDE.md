# Administrator guide

## Create the CMS

From the root, run `npm run setup:env`, edit ADMIN_EMAIL in `.env`, then:

```sh
docker compose up -d postgres directus
docker compose --profile setup run --rm cms-setup
```

Open `http://localhost:8055/admin`. The admin login is separate from the PostgreSQL account. Initial credentials come from your private `.env`.

## Collection map

The exact, executable field definitions are in `cms/schema.mjs`. All requested fields are included. The following additions support publishing and structured presentation:

- `lessons`: `practice`, `expected_result`, `source_url`; `content` is a JSON array of sections.
- `tutorial_steps`: `status`, `alt_text`, `language`.
- `code_examples`: `status`.
- `lesson_images`: `callouts`, a JSON array of numbered explanations.
- `node_guides`: `practice`, `configuration_image`, `example_image`.
- `projects`: `practice`, `expected_result`, `source_url`.
- `site_settings`: `editor_image`, `homepage_intro`, `editor_description`, `editor_highlights`, `features`, `sort_order`, `status`. Homepage feature entries use `{ "icon": "flow", "title": "Visual programming", "text": "Build a connected flow.", "path": "/learn/introduction" }`.

| Collection | Main fields and relationships |
|---|---|
| categories | name, slug, description, icon, sort_order, status; contains lessons |
| modules | title, slug, description, module_number, thumbnail, difficulty, estimated_time, sort_order, status; contains lessons |
| lessons | module_id, category_id, title, slug, summary, content, learning_objectives, prerequisites, difficulty, estimated_time, featured_image, image_caption, youtube_url, youtube_title, youtube_description, sort_order, status, published_at |
| tutorial_steps | lesson_id, step_number, title, description, command, code, expected_output, image, image_title, image_caption, youtube_url, tip, warning, sort_order |
| lesson_images | lesson_id, image, title, description, caption, alt_text, image_type, sort_order, status |
| node_guides | name, slug, category, description, purpose, input_description, output_description, configuration, example, common_errors, image, youtube_url, sort_order, status |
| projects | title, slug, description, difficulty, requirements, content, thumbnail, youtube_url, sort_order, status |
| code_examples | lesson_id, title, language, code, description, sort_order |
| troubleshooting | title, slug, problem, cause, solution, commands, category, image, youtube_url, sort_order, status |
| videos | title, slug, description, youtube_url, thumbnail, category, lesson_id, duration, featured, sort_order, status, published_at |
| site_settings | website_name, tagline, logo, favicon, hero_title, hero_description, footer_text |

Every collection has an `id`. Use short unique lowercase hyphen-separated slugs, such as `installing-node-red`. A lesson needs a published module to appear. The first published site_settings record controls homepage text.

## Write a lesson

1. Create or select a module. Fill title, slug, module number, description, duration and difficulty.
2. Add a lesson from the module's `lessons` relationship, or choose the module in the lessons collection.
3. Write a two- or three-sentence summary.
4. Enter objectives and prerequisites as JSON arrays of short strings:

```json
["Start Node-RED", "Open the editor", "Inspect the Debug sidebar"]
```

5. Enter content sections as:

```json
[
  {"heading":"Understand the idea","body":"An Inject node creates a message when you press its button."},
  {"heading":"Make a connection","body":"Connect the Inject output to the Debug input."}
]
```

The frontend renders text safely and generates section links. Arbitrary HTML, scripts and iframe markup are not rendered.

6. Add tutorial_steps using the lesson's relationship. Enter step number, description, command or code, language, expected_output, image, optional video, tip and warning. Use `sort_order` to control display order.
7. Set child records and the lesson to `published`. Save. Reload the website after five seconds.

All 73 starter lessons are concise introductory exercises. Project records are expandable project briefs, not hardware-tested implementations. Expand them with your own captures, measured results and professor's requirements.

## Upload application screenshots

Take screenshots from your actual Node-RED installation. Capture only the area relevant to the step, and remove visible tokens/passwords before uploading.

The importer creates:

```text
Node-RED Guide/
  Interface/
  Installation/
  Nodes/
  MQTT/
  API/
  Raspberry Pi/
  Projects/
  Troubleshooting/
```

Upload PNG, JPEG, WebP, GIF or AVIF through Files. Choose the matching folder. The files live in the persistent `directus_uploads` Docker volume, while file metadata lives in PostgreSQL.

- Homepage: `site_settings.editor_image`.
- Lesson header: `lessons.featured_image` and `image_caption`.
- Step: `tutorial_steps.image`, `image_title`, `image_caption`, `alt_text`.
- Gallery: create `lesson_images` records; choose interface/tutorial/example/result/diagram/other and set `sort_order`.
- Node guide: main, configuration and example images.

Image cards use the supplied title as an alt-text fallback. Gallery and step images have dedicated alt text. Select an informative title for header/node screenshots. Image clicks open a native dialog; Escape closes it and focus returns to the trigger.

Public file reads are restricted to files attached to published content. Merely placing a file in a folder does not make it public. A file shared between a draft and a published record is public because the published record uses it. Avoid sharing private draft media with published records.

Optional callouts are numbered explanations below gallery images, entered as `["Node Palette: find nodes here", "Workspace: connect nodes here"]`. The app does not draw arbitrary coordinate overlays on your screenshots.

## Add YouTube videos

Paste a complete HTTPS URL into `youtube_url`, for example a watch URL copied from YouTube. Supported forms:

```text
https://www.youtube.com/watch?v=<11-character-video-id>
https://youtu.be/<11-character-video-id>
https://www.youtube.com/shorts/<11-character-video-id>
```

The frontend validates the host and identifier and constructs a `youtube-nocookie.com` embed. Invalid URLs are hidden, not inserted into the page. No YouTube scraping occurs.

For the library, create a videos record, add category, related lesson (optional), duration (manually entered), thumbnail (manually uploaded), and `status=published`. Mark `featured=true` to include it in the homepage's first three featured records, ordered by sort_order.

Suggested categories: Getting Started, Installation, Flows, Nodes, APIs, MQTT, Raspberry Pi, Projects. New category strings also work.

## Publication and permissions

Directus creates the full-access Administrator on first startup. The setup script adds a `Node-RED published reading` public policy with read access only. It grants no create/update/delete permissions. The existing built-in Public role represents anonymous visitors; no visitor account is created.

Public parent/child rules:

- Draft/archived modules hide their lessons.
- Draft/archived lessons hide their steps, gallery images, code and linked library videos.
- Child records also need their own `status=published`.
- Standalone videos may be published without a related lesson.
- File access follows the publication of its owning content.

Do not add a second permissive public policy: Directus policy grants are additive. On a preexisting instance, review other public policies before importing. The bootstrap intentionally does not delete or weaken your existing policies.

## Updating schema and content

Back up first. Rerun `cms-setup` to add missing fields. Existing fields are never deleted or type-changed. If an existing project uses incompatible field types or IDs, review and migrate those deliberately rather than assuming this bootstrap converts them. Seed records matched by slug or parent/title are not overwritten.
