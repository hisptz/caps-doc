# Deployment guide — materials

Facts to reuse when writing `src/content/docs/deployment-guide/`. Each row names the source. If a cell says **confirm**, read that file again in the same change and do not publish a guess.

Repos:

- Engine: [hisptz/caps-engine](https://github.com/hisptz/caps-engine)
- App: [hisptz/caps-app](https://github.com/hisptz/caps-app)
- This site: `src/content/docs/deployment-guide/`, base path `/caps-doc`

## Engine install

| Fact | Value to write | Source |
| --- | --- | --- |
| Standalone start | `make up` → `docker compose up -d --build` | `caps-engine/Makefile` |
| Stop, keep volumes | `make down` | Makefile |
| Stop and delete volumes | `make reset` (`docker compose down -v`) | Makefile |
| CHAP overlay | `make up-chap` / `make down-chap` | Makefile, `docker-compose.chap.yml` |
| Logs | `make logs` (`docker compose logs -f`) | Makefile |
| Migrate once | `make migrate` (`docker compose run --rm migrate`) | Makefile |
| Postgres shell | `make db-shell` | Makefile |
| RabbitMQ UI shortcut | `make rabbit` opens `http://localhost:15672` | Makefile. Local trial only |
| External network | Compose expects an external network named `chap`. Create it with `docker network create chap` when CHAP is not providing one | `docker-compose.yml` `networks.chap.external`, `docs/GETTING_STARTED.md` |
| Default services | `postgres`, `rabbitmq`, `migrate`, `worker-1`, `worker-2`, `scheduler`, `api` | `docker-compose.yml` |
| Postgres image | `postgres:16-alpine` | `docker-compose.yml` |
| RabbitMQ image | `rabbitmq:3.13-management-alpine` | `docker-compose.yml` |
| API host port | `${API_PORT:-4000}:4000` | `docker-compose.yml` |
| Postgres publish | `127.0.0.1:5432:5432` | `docker-compose.yml` |
| RabbitMQ publish | `5672`, management `15672` | `docker-compose.yml` |
| Worker output | volume `caps_outputs` at `/tmp/caps-outputs` | `docker-compose.yml` |
| Volumes to back up | `postgres_data`, and optionally `rabbitmq_data`, `caps_outputs` | `docker-compose.yml` |
| Scheduler rule | Exactly one replica. Comment in the compose file and the README | `docker-compose.yml` service `scheduler` |
| Distroless | api, worker, scheduler use `gcr.io/distroless/cc-debian12`. No shell | README, `docs/GETTING_STARTED.md` |
| Migrate runtime | `oven/bun:1-slim`, one-shot, `restart: on-failure` | README, compose |
| Image names | `ghcr.io/hisptz/caps-engine/{api,worker,scheduler,migrate}` | README, `.github/workflows/docker.yml` |
| Tag variable | `IMAGE_TAG`, default `latest` in compose | `docker-compose.yml` |
| Published tags | `latest` on the default branch, `sha-…`, semver, major.minor | `.github/workflows/docker.yml` |
| Platforms | `linux/amd64`, `linux/arm64` | docker workflow |

### Environment variables the engine page may name

Only these. They exist in `.env.example`, `src/shared/schemas/env.ts`, or Compose.

| Variable | Role | Notes for the writer |
| --- | --- | --- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Postgres image bootstrap | Example file uses `caps` / `caps` / `caps`. Say to replace the password |
| `DATABASE_URL` | Prisma URL for api, workers, scheduler, migrate | Example is `postgresql://caps:caps@localhost/caps`. **Inside containers that host is wrong.** Production steps must use the Compose service name `postgres` |
| `RABBITMQ_USER`, `RABBITMQ_PASSWORD` | RabbitMQ bootstrap | Example `caps` / `caps` |
| `RABBITMQ_URL` | AMQP URL | Example `amqp://caps:caps@localhost:5672`. Same localhost trap; use `rabbitmq` |
| `PORT` | Listen port inside the API process | Default `4000`. Compose sets `PORT: 4000` on the api service |
| `API_PORT` | Host port mapped to the container | Default `4000` |
| `IMAGE_TAG` | GHCR tag | Not in `env.ts`. Compose default `latest` |
| `NODE_ENV` | Present in `.env.example` only | Do not describe behavior for it; `env.ts` does not read it |
| `OUTPUTS_DIR` | Worker files | Default `./outputs`. Compose overrides workers to `/tmp/caps-outputs` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Tracing | Empty disables it. Optional; one sentence on Operate is enough |
| `DHIS2_BASE_URL`, `DHIS2_USERNAME`, `DHIS2_PASSWORD` | Worker/API calls into DHIS2 | Example `http://localhost:8080`, `admin`, `district`. Label as the demo pair |
| `CHAP_BASE_URL` | CHAP HTTP API | **Required.** No default in `env.ts`. Example `http://localhost:8000` |
| `CHAP_API_TOKEN` | CHAP auth | Optional. Needed when CHAP `/system/info` reports `auth_required` |
| `CLIMATE_API_BASE_URL` | Climate HTTP API | Example `http://localhost:8001` |
| `CLIMATE_DATA_BASE_URL` | Climate data service | Example `http://localhost:8081` |
| `CHAP_NETWORK` | Overlay only | Docker network CHAP is already on |
| `CHAP_DATABASE_URL` | Overlay only | Postgres URL on that network |
| `CHAP_RABBITMQ_URL` | Overlay only | AMQP URL on that network |

Do not mention `DATABASE_URL_TEST`, `bun run test`, or `caps_test` in this guide.

### CHAP overlay behavior to describe accurately

From `docker-compose.chap.yml`:

- `postgres` and `rabbitmq` are on profile `disabled`, so they do not start.
- `migrate`, workers, scheduler, and `api` take `CHAP_DATABASE_URL` / `CHAP_RABBITMQ_URL` and join only the `chap` network.
- `chap` network name becomes `${CHAP_NETWORK:-chap_default}` and is external.
- Finding the network: `docker network ls | grep chap`. Finding the Postgres hostname: `docker inspect` the CHAP Postgres container and read the network `Name`.

### Confirm before the engine page is published

These are gaps between the README and a safe production procedure. Resolve them in caps-engine or write the page around the verified result. Do not paper over them.

1. **Container DNS.** `.env.example` uses `localhost` for `DATABASE_URL` and `RABBITMQ_URL`, and Compose injects those values into containers. Record a `.env` that actually comes up healthy, and publish those hostnames (`postgres`, `rabbitmq`) in the guide.
2. **Pull without compiling.** `make up` always builds. There is no production Compose file that only pulls `IMAGE_TAG`. Either add that file in caps-engine and then document it, or document `docker compose pull` plus `up` without `--build` only after trying it against the current file (the `build:` keys may still build).
3. **`GET /system/info`.** The route exists (`src/services/api/modules/system/index.ts`). Confirm it does not require a header, and quote a redacted 200 body in the check page.
4. **OpenAPI URL.** The API registers `@elysiajs/openapi` in `src/services/api/index.ts`. Confirm the browser path before linking it. Do not guess `/swagger`.

## DHIS2 app install

| Fact | Value to write | Source |
| --- | --- | --- |
| App title | CAPS | `d2.config.js` |
| Minimum DHIS2 | 2.41 | `d2.config.js` `minDHIS2Version`; README |
| Why 2.41 | Route API non-GET methods | `docs/GETTING_STARTED.md`, README |
| Package manager | pnpm 11 (`packageManager` in `package.json`) | `package.json` |
| Build | `pnpm build` → zip under `build/bundle/` | README |
| Deploy CLI | `pnpm deploy` after build; prompts for server URL and an App Management user | README, `package.json` script `d2-app-scripts deploy` |
| Release deploy | GitHub Actions on published release: `pnpm run deploy --username … --password … $DHIS2_INSTANCE_URL` | `.github/workflows/deploy.yml` |
| CI secret names | `DHIS2_USERNAME`, `DHIS2_PASSWORD`; variable `DHIS2_INSTANCE_URL` | deploy workflow. These are not the app’s `.env` names |
| Local env names | `DHIS2_BASE_URL`, `D2_USERNAME`, `D2_PASSWORD` | caps-app `.env.example`. Dev tooling only. The CAPS API URL is **not** an env var |
| Dev server | `pnpm start`, port 3000, proxies DHIS2 | README. Development Guide, not this guide |
| Hash routes | `/#/…` because the app uses `HashRouter` | README |

### Menu labels (use these, not older route lists)

`src/shared/components/AppMenu/AppMenu.tsx`:

- **Dashboard** (`#/`)
- **Pipelines**
- **Executions**
- **Climate data**
- **Settings**
- **About**

`docs/GETTING_STARTED.md` still lists `#/analytics` and `#/dead-letters`. The menu does not. Do not document those as install-time screens unless the menu grows them again.

### Route the app creates

From `src/capsApi/dhis2CapsRoute.ts` and `WelcomePage.tsx` / `SettingsForm.tsx`:

| Stored field | Value |
| --- | --- |
| code | `caps` (`CAPS_ROUTE_CODE`) |
| name | CAPS API |
| description | Proxy target for the CAPS monitoring API |
| url | The typed base URL, trailing slash stripped, then `/**` appended |
| disabled | false |
| headers | empty object |

Welcome copy to match in prose and in screenshots:

- Title: **Welcome to CAPS**
- Field label: **CAPS backend base URL**
- Help: “Full URL of the CAPS service (scheme and host, no trailing slash). Example: https://caps.example.org”
- Placeholder: `https://caps.example.org`
- Button: **Save and continue**
- Success: **CAPS route saved.**
- Failure fallback: **Could not save route.**

Settings copy:

- Title: **Settings**
- Lead: “Manage how this DHIS2 app connects to the CAPS monitoring service.”
- Card: **Backend connection**
- Tags: **Connected**, **Not configured**
- Buttons: **Save** when creating, **Save changes** when a route already exists
- Diagram labels: **DHIS2 instance**, “proxies to”, **CAPS service**

The browser calls DHIS2 (`/api/routes/caps/run/…`). It does not call the CAPS origin. Say that in the route page.

### About page as a check

`ConnectedSystemsSection` loads core health and any extra source routes. Use it on the check page as “the About screen shows system health”, and **confirm** the visible headings in the running app before naming cards. Source-instance cards can say **Route is disabled**.

## Suggested production narrative (proposed, not a second source of truth)

Write the engine page in this order once the confirm list is done:

1. Pick a tag, for example `ghcr.io/hisptz/caps-engine/api:1.2.3` (use a real release tag from GHCR, not this example).
2. Put the engine on a host that can reach CHAP, the climate service, and DHIS2.
3. Put TLS in front of the API if the Route URL is `https://…`. The app does not terminate TLS.
4. Keep Postgres bound to localhost or an internal network.
5. Install the zip.
6. Register the Route with the URL **DHIS2** uses.
7. Run the check page.

## Where the public pages must not copy from

| Source | Why it stays out |
| --- | --- |
| `docker-compose.dev.yml` | Developer stack. Different Postgres major, bundled DHIS2 2.43, CHAP and climate images. Not the supported install |
| `caps-app/e2e/stack/docker-compose.yml` | Playwright stack. Pins an old image sha and dummy CHAP/climate hosts (`chap.invalid`) |
| `bun run dev:api` / `dev:worker` / `dev:scheduler` | Host hot reload against published ports. Development Guide |
| `bun run db:seed` | Example pipelines for developers |
| Demo passwords as the recommended production values | `.env.example` states the DHIS2 pair is a demo pair |

## Ownership when facts change

If a writer changes a command, port, image name, or button label, update the matching row here in the same change. The public page should follow this table, and this table should follow the repositories.
