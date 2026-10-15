# Deployment guide — screenshots

Shoot these while writing the pages in the structure plan. Store files at `src/assets/deployment/` and embed them next to the step they prove. A page without a UI step does not get a screenshot.

Terminal commands stay as code blocks. Do not screenshot a terminal unless the pass condition is visual and a one-line sample cannot show it (`docker compose ps` is a code block, not a shot).

## How to shoot

- DHIS2 2.41 or newer, English locale, default DHIS2 header, CAPS app at a normal laptop width (about 1440×900). Crop to the app content. Leave enough of the DHIS2 header that the reader can see this is inside DHIS2, and cut the browser chrome.
- Use a throwaway instance. User `admin` is acceptable on a demo. No real facility names, no patient data, no live tokens.
- The backend URL in the welcome field must be an obvious example (`https://caps.example.org`) or a lab host you are willing to publish. Do not photograph a `.env` file, the RabbitMQ password, or `CHAP_API_TOKEN`.
- One idea per image. If a shot needs an arrow, add it in the editor and keep the original unannotated file beside it (`name.png` and `name-annotated.png`). Publish the annotated one.
- Retake when a label in `materials.md` changes. Stale button text is worse than no image.
- Prefer PNG. Name files with the page order so the folder sorts like the sidebar.

Starlight image syntax, after the asset exists:

```md
![Welcome screen with the CAPS backend base URL field](../../../assets/deployment/05-welcome-url.png)
```

Adjust the relative path from the page file. Alt text states what the reader should notice, not “screenshot of”.

## Shot list

| File | Page | What must be in frame | Do not include |
| --- | --- | --- | --- |
| `04-app-management-caps.png` | DHIS2 app | App Management list or install dialog showing the app name **CAPS** and a successful install | Other apps’ secrets, the server URL if it is a private host you cannot share |
| `04-apps-menu-caps.png` | DHIS2 app | DHIS2 apps menu with **CAPS** visible, so the reader knows where to open it | A crowded menu cropped so the CAPS entry is ambiguous |
| `05-welcome-url.png` | Connect the app | **Welcome to CAPS**, the lead text, empty or example **CAPS backend base URL**, help text, **Save and continue** | A validation error, unless you also shoot the error as its own file |
| `05-welcome-saved.png` | Connect the app | Success alert **CAPS route saved.** | The alert only, with no page context. Keep the heading in frame |
| `05-settings-connected.png` | Connect the app | **Settings**, card **Backend connection**, tag **Connected**, field showing the example base URL, **Save changes** | The `/**` suffix if the field hides it. The form shows the base URL; do not paint `/**` into this shot |
| `05-maintenance-route.png` | Connect the app | DHIS2 Maintenance (or the Routes API screen the instance actually uses) with code `caps`, name **CAPS API**, and URL ending in `/**` | Unrelated routes, auth headers |
| `06-dashboard-empty.png` | Check the install | **Dashboard** after the Route works, including the left menu (**Dashboard**, **Pipelines**, **Executions**, **Climate data**, **Settings**, **About**) | A manufactured chart. An empty dashboard is the honest first-run picture |
| `06-about-health.png` | Check the install | **About** with the connected-systems / health block in a success state | A stack trace |

Optional, only if the troubleshooting page is showing that exact failure:

| File | When |
| --- | --- |
| `08-welcome-invalid-url.png` | Field error “Enter a valid HTTP or HTTPS URL.” |
| `08-settings-not-configured.png` | Tag **Not configured** before a route exists. Useful beside **Connected** so the two states are not confused |

## Annotated callouts

Use at most two callouts on an image.

| Image | Callout |
| --- | --- |
| `05-welcome-url.png` | Point at the field: “Base URL the DHIS2 server can reach. No trailing slash.” |
| `05-maintenance-route.png` | Point at the URL: “The app appends `/**`. You do not type that on the welcome form.” |
| `05-settings-connected.png` | Point at **Connected**: “This tag is the install check.” |

Do not annotate the dashboard menu. The labels are already the point of that shot.

## Diagrams instead of screenshots

Do not photograph these. Draw them (Mermaid or a small SVG under `src/assets/deployment/`):

| File | Replaces a screenshot of |
| --- | --- |
| `diagram-processes.mmd` or SVG | Container list, scheduler ×1, workers ×N, Postgres, RabbitMQ, CHAP, climate, DHIS2 |
| `diagram-route.mmd` or SVG | Browser → DHIS2 → Route `caps` → API. The Settings page already draws **DHIS2 instance** / proxies to / **CAPS service**; the diagram can mirror that, the screenshot of Settings does not replace it |
| `diagram-layouts.mmd` or SVG | Own Postgres and RabbitMQ versus `make up-chap` sharing CHAP’s |

## What we will not shoot

- RabbitMQ management UI. It invites people to publish port 15672 and to treat the broker as the admin console.
- Prisma Studio, `make db-shell`, or a database GUI.
- The OpenAPI page, until the path is confirmed. Then one shot is enough on the engine page, and only if it helps an admin see the API is up. `GET /system/info` is the real check.
- Pipeline create, schedule, execution detail, climate dataset screens. Those are User Guide shots.
- `pnpm start` on port 3000. Development Guide.
- GHCR or GitHub Actions logs.

## Capture session

One lab session can collect the whole set:

1. Engine up with a pinned image and a URL DHIS2 can reach.
2. Install the zip → shoot `04-*` before leaving App Management.
3. Open CAPS → shoot `05-welcome-url.png` before saving.
4. Save → shoot `05-welcome-saved.png`.
5. Open Maintenance routes → shoot `05-maintenance-route.png`.
6. Open **Settings** → shoot `05-settings-connected.png`.
7. Open **Dashboard** and **About** → shoot `06-*`.

Shoot `08-*` on a second pass with a fresh app install or a cleared route, so the welcome form is empty again.
