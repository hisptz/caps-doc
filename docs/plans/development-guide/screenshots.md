# Development guide — screenshots

This guide is mostly commands and file paths. Shoot a screen only when the reader must recognize the local app. Do not screenshot an editor, a terminal, GitHub, or CI.

Store files at `src/assets/development/`. Alt text says what to notice.

```md
![Local CAPS app on the welcome screen](../../../assets/development/03-welcome-local.png)
```

## How to shoot

- App at `http://localhost:3000`, English locale, about 1440×900. Include the address bar when the hash route is the point of the shot. Crop other browser chrome.
- Use a demo DHIS2 and the example backend URL you are willing to publish (`http://localhost:4000` only if that DHIS2 really runs on the same host). No `.env` file, no tokens, no patient data.
- One idea per image. Annotate a copy (`name-annotated.png`) and publish that copy. At most two callouts.

## Shot list

| File | Page | What must be in frame | Do not include |
| --- | --- | --- | --- |
| `03-dev-server.png` | DHIS2 app | Address bar on `localhost:3000`, CAPS shell, left menu | A production hostname |
| `03-welcome-local.png` | DHIS2 app | **Welcome to CAPS**, **CAPS backend base URL** filled with the local API URL, **Save and continue** | A password manager, the proxy URL to a private server |
| `03-hash-route.png` | DHIS2 app | Address bar showing `/#/pipelines` (or `/#/settings`) inside the CAPS shell | A cropped bar that hides the hash |
| `05-handler-form.png` | Pipeline steps | The pipeline step form for one existing handler, so a new form has a visual target | Every handler’s fields. One clear example is enough |

`03-dev-server.png` and `03-welcome-local.png` can be the same capture if the welcome screen is what a first `pnpm start` shows. Keep both filenames only if both states are real. If the route already exists, the first paint is the shell, and the welcome shot needs a DHIS2 without the `caps` route.

## Annotated callouts

| Image | Callout |
| --- | --- |
| `03-hash-route.png` | Point at `#/pipelines`: “Routes stay after the hash.” |
| `03-welcome-local.png` | Point at the field: “This URL is fetched by DHIS2, not by the browser.” |

Skip callouts on `05-handler-form.png`. The page text names the component folder.

## Figures that are not screenshots

| File | Use |
| --- | --- |
| `diagram-request.mmd` or SVG | Browser → DHIS2 Route `caps` → API → Postgres outbox → worker → step queue. Same story as the deployment diagram, drawn for someone about to edit a module. Put it on the code map page |

A directory tree in a fenced block is enough for the repo layout. Do not draw a file-explorer screenshot.

## What we will not shoot

- `bun` or `pnpm` output.
- Prisma Studio, RabbitMQ management, or coverage HTML.
- GitHub pull request or Actions pages.
- The e2e stack booting.
- Production App Management. That shot belongs to the Deployment Guide (`src/assets/deployment/`).

## Capture session

Do this after the app page’s proxy **confirm** item is settled, so the address bar matches the documented URL.

1. Start the engine API on port 4000 and `pnpm start`.
2. If welcome is showing, shoot `03-welcome-local.png`, save the route, then shoot `03-dev-server.png` and `03-hash-route.png`.
3. Open a pipeline step that already has a form and shoot `05-handler-form.png`.
