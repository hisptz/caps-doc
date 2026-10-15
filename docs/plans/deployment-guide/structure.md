# Deployment guide — structure

Proposed sidebar for `src/content/docs/deployment-guide/`. Write the pages in the order below. Later pages assume earlier checks passed.

The index file already exists and should stay at `sidebar.order: 0`. Other files are new.

| Order | File | Sidebar label | Reader can… |
| ---: | --- | --- | --- |
| 0 | `index.md` | Set up CAPS | Choose this guide and see the path to a working install |
| 1 | `requirements.md` | Requirements | Tell whether the servers, DHIS2 version, and accounts are enough |
| 2 | `engine.md` | Engine | Start API, workers, scheduler, Postgres, and RabbitMQ from published images |
| 3 | `connections.md` | CHAP, climate, and DHIS2 | Point the engine at CHAP, the climate service, and the DHIS2 instance workers call |
| 4 | `app.md` | DHIS2 app | Install the CAPS zip on DHIS2 |
| 5 | `route.md` | Connect the app | Save the Route from **Welcome to CAPS** or **Settings** and see **Connected** |
| 6 | `check.md` | Check the install | Prove the proxy, the scheduler count, and a trivial API read |
| 7 | `operate.md` | Run and upgrade | Back up, upgrade images, read logs, and scale workers without cloning the scheduler |
| 8 | `troubleshooting.md` | Troubleshooting | Match a symptom to the URL viewer or the service that owns it |

## Page briefs

### Set up CAPS (`index.md`)

Already at `sidebar.order: 0` with label “Set up CAPS”. Replace the “being written” note.

Include the audience, the five “finished” conditions from the design plan, and links to the next pages. No commands.

### Requirements (`requirements.md`)

Before you start: nothing else in this guide.

Cover:

- DHIS2 **2.41 or newer**. `d2.config.js` sets `minDHIS2Version: '2.41'` because the Route API gained non-GET methods in 2.41. The e2e stack pins `dhis2/core:2.41.10`. Say 2.41+; do not imply 2.43 is required (that tag appears only in the optional dev compose file).
- Docker 24+ and Compose v2, on a host that can pull `ghcr.io/hisptz/caps-engine/*`.
- A DHIS2 user who can install apps (App Management) and a user who can create Routes. **Confirm the Route authority name** in a DHIS2 2.41 instance before naming it. Do not invent an authority code.
- Accounts the engine itself uses: a DHIS2 user for worker imports, a CHAP base URL (required), an optional CHAP token, and climate API / climate data base URLs.
- Ports the default Compose file publishes: API `${API_PORT:-4000}`, Postgres `127.0.0.1:5432`, RabbitMQ `5672` and management `15672`. Recommend not publishing Postgres and RabbitMQ management on a production host.
- Resource sketch, labeled as a starting point rather than a benchmark: API and scheduler are light; workers need disk for `/tmp/caps-outputs`; DHIS2 and CHAP dominate RAM when they share the host.

Out of scope: Bun, pnpm, and Node. Those are for people building from source.

### Engine (`engine.md`)

Before you start: Requirements.

Lead with pulling images, not compiling:

| Image | Role |
| --- | --- |
| `ghcr.io/hisptz/caps-engine/migrate` | One-shot `prisma migrate deploy` (`oven/bun:1-slim`) |
| `ghcr.io/hisptz/caps-engine/api` | HTTP API, distroless |
| `ghcr.io/hisptz/caps-engine/worker` | Pipeline workers, distroless, two replicas in the default file |
| `ghcr.io/hisptz/caps-engine/scheduler` | Cron, distroless, **exactly one** |

Images are published for `linux/amd64` and `linux/arm64` by `.github/workflows/docker.yml`. Tags to mention: a released semver pin, plus `latest` only as a trial tag. Tell the reader to record the tag they deployed.

Steps to write after the **confirm** items in the materials plan:

1. Create the external Docker network named `chap` (`docker-compose.yml` declares `chap` as `external: true`, so `make up` fails without it even when CHAP is not used).
2. Copy `.env.example` to `.env` and replace passwords.
3. Set `DATABASE_URL` and `RABBITMQ_URL` to hostnames that resolve **inside** the Compose network (`postgres`, `rabbitmq`), not `localhost`.
4. Set `IMAGE_TAG` to the pin.
5. Start migrate, then api, worker-1, worker-2, and scheduler.
6. Show `docker compose ps` with migrate exited 0 and the others running.

Subsection **Local trial from the git repository**: `cp .env.example .env`, `docker network create chap`, `make up`. Warn that `make up` is `docker compose up -d --build` and compiles. That path belongs, briefly, so HISP staff can reproduce the README, and then the page returns to the pinned-image path.

Subsection **CAPS beside an existing CHAP**: `make up-chap` with `CHAP_NETWORK`, `CHAP_DATABASE_URL`, `CHAP_RABBITMQ_URL`. This disables the CAPS Postgres and RabbitMQ services. Link to Connections for the URL values.

Check: `docker compose ps` and a `GET /system/info` from **inside the API network**, not only from the operator laptop.

### CHAP, climate, and DHIS2 (`connections.md`)

Before you start: the engine containers are up.

This page is configuration, not a second install. Three blocks:

1. **DHIS2, as seen by workers.** `DHIS2_BASE_URL`, `DHIS2_USERNAME`, `DHIS2_PASSWORD`. The URL must be reachable from the worker container (`http://dhis2:8080` on a shared network, or a real host URL). This user is the import account, which can be different from the person who installs the app.
2. **CHAP.** `CHAP_BASE_URL` is required by `src/shared/schemas/env.ts`. `CHAP_API_TOKEN` when CHAP reports `auth_required`. Separate this from the optional “share CHAP’s Postgres and RabbitMQ” overlay, which is an engine layout, not a prediction URL.
3. **Climate service.** `CLIMATE_API_BASE_URL` (default in the example file `http://localhost:8001`) and `CLIMATE_DATA_BASE_URL` (`http://localhost:8081`). Repeat the container-hostname warning.

Do not document `docker-compose.dev.yml` as a production install. It is a developer stack (DHIS2, CHAP, climate images, different Postgres tags). One sentence and a link to the Development Guide is enough.

Check: worker logs do not show connection refused to those three hosts. Exact log lines must be captured from a real run before they are quoted.

### DHIS2 app (`app.md`)

Before you start: DHIS2 2.41+ and a user with App Management.

Two equivalent installs:

1. **Upload the release zip** in DHIS2 App Management. The built artifact is the zip under `build/bundle/` after `pnpm build`.
2. **CLI**, for the same zip: `pnpm deploy` prompts for the server URL and an App Management user. The GitHub workflow `.github/workflows/deploy.yml` runs on a published release (and `workflow_dispatch`) with secrets `DHIS2_USERNAME` and `DHIS2_PASSWORD` and variable `DHIS2_INSTANCE_URL`. Document the workflow as how the project publishes, not as something every ministry must copy.

The app title in `d2.config.js` is **CAPS**. After install it appears in the DHIS2 apps menu.

Dev server (`pnpm start` on port 3000, proxy to DHIS2) is one sentence plus a link to the Development Guide.

Check: screenshot of the installed app (see the screenshot plan).

### Connect the app (`route.md`)

Before you start: the API URL is reachable **from the DHIS2 server**, and the signed-in user can create Routes.

Walk the first-run screen exactly:

- Heading **Welcome to CAPS**.
- Field **CAPS backend base URL**. Help text: full URL, scheme and host, no trailing slash. Placeholder `https://caps.example.org`.
- Button **Save and continue**.
- Success alert **CAPS route saved.**

Explain what the app writes: Route code `caps`, name **CAPS API**, description “Proxy target for the CAPS monitoring API”, URL with `/**` appended. Changing it later is **Settings** → **Backend connection** → **Save changes**, with tag **Connected** or **Not configured**.

Show the bad case: a URL that opens in the admin’s browser but is unreachable from the DHIS2 process.

Check: **Settings** shows **Connected**. Maintenance → Routes shows code `caps` if the reader wants to confirm the stored `/**` URL.

### Check the install (`check.md`)

A single checklist, each row with the command or screen and the pass condition:

| Check | Pass |
| --- | --- |
| `docker compose ps` | `migrate` exited 0; `api`, `worker-1`, `worker-2`, `scheduler` running; no second scheduler |
| API from the DHIS2 network | `GET /system/info` returns 200 |
| App | **Settings** tag **Connected** |
| Menu | **Dashboard**, **Pipelines**, **Executions**, **Climate data**, **Settings**, **About** render without a route error |
| About | Connected-systems section loads (core health plus any source routes) |

Then link to the User Guide for the first pipeline. Do not make them create one here.

### Run and upgrade (`operate.md`)

- **Logs.** `docker compose logs -f api` (and worker, scheduler). No shell in distroless images.
- **Scheduler.** Never scale it. Workers are stateless and may be scaled; the default file starts two.
- **Upgrade.** Pin a new `IMAGE_TAG`, pull, run migrate to completion, then recreate api, workers, and the single scheduler. Migrate must finish before the app services start (the Compose file already encodes that with `service_completed_successfully`).
- **Back up.** Postgres volume `postgres_data`. RabbitMQ is a delivery queue, not the system of record; still note `rabbitmq_data` if they want in-flight messages. Worker output volume `caps_outputs` (`/tmp/caps-outputs`).
- **Secrets.** Rotate `POSTGRES_PASSWORD`, `RABBITMQ_PASSWORD`, `DHIS2_PASSWORD`, and `CHAP_API_TOKEN` by changing `.env` and recreating the services that read them. Do not commit `.env`.
- **Clock.** Cron is 5-field and uses the host timezone. Missed ticks during downtime are not replayed. Say that so an upgrade window is not mistaken for a bug.

### Troubleshooting (`troubleshooting.md`)

Symptom → likely viewer → where to look. Keep each entry to a few lines. Add a row only after someone has hit it, but seed the table with the failures the source already implies:

| Symptom | Look at |
| --- | --- |
| `make up` fails: network `chap` not found | Create the external network, or use the CHAP overlay with `CHAP_NETWORK` |
| API container restarts at once | `CHAP_BASE_URL` missing (required), or `DATABASE_URL` / `RABBITMQ_URL` using `localhost` |
| migrate restarts | Postgres not reachable at `DATABASE_URL`; on the CHAP overlay, `CHAP_DATABASE_URL` |
| Welcome save returns an error | User cannot create Routes, or the URL fails validation (must be http or https) |
| **Connected**, but lists never load | Route host is wrong **from the DHIS2 server**; confirm code `caps` and the `/**` suffix |
| Pipelines run twice | Two scheduler containers |
| `docker exec` fails | Distroless image; use `docker logs` |
| Climate or CHAP step fails later | Connections page URLs, from the worker network |

User-facing pipeline errors (a step failed, a dead letter) stay in the User Guide. Link across.

## Writing order

1. Requirements and Engine, after the confirm items in the materials plan are resolved.
2. Route and DHIS2 app, because the screenshots are the long pole.
3. Connections, Check, Operate, Troubleshooting.
4. Landing page last, so its checklist matches the pages that exist.

## Pages we are not adding

- A handler catalog. User Guide.
- OpenAPI field reference. Link to the API’s OpenAPI page once its public path is confirmed; do not duplicate it.
- Kubernetes manifests. They do not exist in caps-engine. Do not sketch a Helm chart in the guide.
- A copy of `docker-compose.dev.yml`. Development Guide.
