# Deployment guide — structure

Two installables, two sidebar groups. The reader deploys the engine, then the app. Detail pages sit inside the group they belong to. Pages that need both products come after the groups.

`src/tabs.ts` autogenerates the Deployment Guide sidebar from `src/content/docs/deployment-guide/`. A directory becomes a group. Set the group label and position on that directory’s `index.md` (`sidebar.label`, `sidebar.order`). Do not special-case `tabs.ts` for this guide.

```text
deployment-guide/
  index.md                 Set up CAPS
  engine/
    index.md               Deploy the engine
    requirements.md
    connections.md
    operate.md
  app/
    index.md               Deploy the app
    route.md
  check.md
  troubleshooting.md
```

| Order | Page | Sidebar label | Reader can… |
| ---: | --- | --- | --- |
| 0 | `index.md` | Set up CAPS | See the two tracks and the “finished” checklist |
| 1 | `engine/index.md` | Deploy the engine | Start API, workers, one scheduler, Postgres, and RabbitMQ from published images |
| 2 | `engine/requirements.md` | Requirements | Judge hosts, ports, and accounts before or while installing the engine |
| 3 | `engine/connections.md` | CHAP, climate, and DHIS2 | Point workers at CHAP, the climate service, and the DHIS2 instance they call |
| 4 | `engine/operate.md` | Run and upgrade | Read logs, pin a new tag, back up, and scale workers without a second scheduler |
| 5 | `app/index.md` | Deploy the app | Install the CAPS zip on DHIS2 2.41+ |
| 6 | `app/route.md` | Connect the app | Save Route `caps` and see **Connected** |
| 7 | `check.md` | Check the install | Prove the proxy, the scheduler count, and a trivial API read |
| 8 | `troubleshooting.md` | Troubleshooting | Match a symptom to the URL viewer or the service that owns it |

`engine/index.md` and `app/index.md` are the deployment sections. They contain the diagram and the copy-paste snippets for that product. The pages under them are the specifics. Check and Troubleshooting stay outside both groups because they span the engine and the app.

## Why this shape

A single flat list mixes Docker hostnames with the DHIS2 welcome form. Nesting the specifics under Engine or App keeps each deploy page short: do the install, follow a link when a choice needs a longer explanation. A shared Requirements page in front of both groups would block the app track on engine ports, so engine requirements live under Engine, and the app page states DHIS2 2.41+ and App Management in its own “Before you start”.

## Page briefs

### Set up CAPS (`index.md`)

Already at `sidebar.order: 0` with label “Set up CAPS”. Replace the “being written” note.

Include the audience, the five “finished” conditions from the design plan, and two links: **Deploy the engine**, then **Deploy the app**. One system diagram (no commands) may sit here so the two groups have a picture. The diagram source is in the diagrams and snippets plan.

No env file and no Compose file on this page.

### Deploy the engine (`engine/index.md`)

Group label **Engine**. This index is the group’s first item.

Before you start: Docker 24+ and Compose v2. Link to Requirements for ports and accounts. Do not paste that page here.

This page is the copy-paste path:

- The URL-viewers diagram and the two-layout diagram.
- Tabs for “Own Postgres and RabbitMQ” and “Beside an existing CHAP”, each with its env snippet and start commands.
- Engine-only check: `docker compose ps` and `GET /system/info` from the API network.

Link sideways to Requirements, Connections, and Run and upgrade instead of repeating them. `make up` stays a short “local trial, this compiles” note with a link to the Development Guide.

### Requirements (`engine/requirements.md`)

Before you start: nothing else in this guide. Readers can open it from Deploy the engine.

Cover:

- Docker 24+ and Compose v2, on a host that can pull `ghcr.io/hisptz/caps-engine/*`.
- Images: `migrate`, `api`, `worker`, `scheduler` on `ghcr.io/hisptz/caps-engine/`, `linux/amd64` and `linux/arm64`. Pin a semver tag. `latest` is a trial tag.
- Ports the default Compose file publishes: API `${API_PORT:-4000}`, Postgres `127.0.0.1:5432`, RabbitMQ `5672` and management `15672`. Recommend not publishing Postgres or RabbitMQ management on a production host.
- Accounts the engine uses: a DHIS2 user for worker imports, `CHAP_BASE_URL` (required), an optional CHAP token, and the two climate base URLs.
- A starting-point resource note, not a benchmark: API and scheduler are light; workers need disk for `/tmp/caps-outputs`; DHIS2 and CHAP dominate RAM when they share the host.

Out of scope: Bun, pnpm, and Node. Those are for people building from source. DHIS2 2.41+ belongs on the app page.

### CHAP, climate, and DHIS2 (`engine/connections.md`)

Before you start: the engine containers are up, or the reader is filling `.env` before the first start. Say which.

This page is the rest of the env file, not a second install.

1. **DHIS2, as seen by workers.** `DHIS2_BASE_URL`, `DHIS2_USERNAME`, `DHIS2_PASSWORD`. The URL must be reachable from the worker container. This user is the import account, which can differ from the person who installs the app.
2. **CHAP.** `CHAP_BASE_URL` is required. `CHAP_API_TOKEN` when CHAP reports `auth_required`. Keep this separate from the “beside CHAP” layout on the deploy page, which only shares Postgres and RabbitMQ.
3. **Climate service.** `CLIMATE_API_BASE_URL` and `CLIMATE_DATA_BASE_URL`. Repeat the container-hostname warning.

Do not document `docker-compose.dev.yml` as a production install. One sentence and a link to the Development Guide.

Check: worker logs do not show connection refused to those three hosts. Quote a log line only after capturing it from a real run.

### Run and upgrade (`engine/operate.md`)

- **Logs.** `docker compose logs -f api` (and worker, scheduler). No shell in distroless images.
- **Scheduler.** Never scale it. Workers are stateless and may be scaled; the default file starts two.
- **Upgrade.** Pin a new `IMAGE_TAG`, pull, run migrate to completion, then recreate api, workers, and the single scheduler. The upgrade diagram is the sequence on this page.
- **Back up.** Postgres volume `postgres_data`. RabbitMQ is a delivery queue; mention `rabbitmq_data` only for in-flight messages. Worker output volume `caps_outputs`.
- **Secrets.** Rotate `POSTGRES_PASSWORD`, `RABBITMQ_PASSWORD`, `DHIS2_PASSWORD`, and `CHAP_API_TOKEN` in `.env` and recreate the services that read them. Do not commit `.env`.
- **Clock.** Cron is 5-field and uses the host timezone. Missed ticks during downtime are not replayed.

### Deploy the app (`app/index.md`)

Group label **App**. This index is the group’s first item.

Before you start: DHIS2 **2.41 or newer** (`minDHIS2Version` in `d2.config.js`; the Route API gained non-GET methods in 2.41). A user with App Management. The engine API is reachable from the DHIS2 server. Link to Connect the app for the Route body; this page only needs the base URL the welcome form asks for.

Two equivalent installs, in the snippets plan:

1. Upload the release zip in **App Management**. The artifact is the zip under `build/bundle/` after `pnpm build`. The app title is **CAPS**.
2. `pnpm deploy` for the same zip.

Building the zip needs Node and pnpm. The DHIS2 server does not.

**Confirm the Route authority name** on a DHIS2 2.41 instance before naming it. Do not invent an authority code.

Dev server (`pnpm start` on port 3000) is one sentence plus a link to the Development Guide.

Check: the DHIS2 apps menu lists **CAPS**.

### Connect the app (`app/route.md`)

Before you start: the signed-in user can create Routes, and the API URL is reachable from the DHIS2 server.

Walk the first-run screen with labels, not a screenshot:

- Heading **Welcome to CAPS**.
- Field **CAPS backend base URL**. No trailing slash. Placeholder `https://caps.example.org`.
- Button **Save and continue**.
- Success alert **CAPS route saved.**

Show the value typed in the form and the JSON the app stores, including the `/**` suffix. Both are in the diagrams and snippets plan. Changing it later is **Settings** → **Backend connection** → **Save changes**, with tag **Connected** or **Not configured**.

Show the bad case in prose: a URL that opens in the admin’s browser and is unreachable from the DHIS2 process.

Check: **Settings** shows **Connected**. The `curl` against `api/routes?filter=code:eq:caps` is the copy-paste confirmation.

### Check the install (`check.md`)

After both groups. A single checklist:

| Check | Pass |
| --- | --- |
| `docker compose ps` | `migrate` exited 0; `api`, both workers, and one `scheduler` are running |
| API from the DHIS2 network | `GET /system/info` returns 200 |
| App | **Settings** tag **Connected** |
| Menu | **Dashboard**, **Pipelines**, **Executions**, **Climate data**, **Settings**, **About** render without a route error |
| About | Connected-systems section loads |

Then link to the User Guide for the first pipeline. Do not create one here.

### Troubleshooting (`troubleshooting.md`)

After both groups. Symptom, then where to look. Link back into the engine or app page that owns the fix.

| Symptom | Look at |
| --- | --- |
| `make up` fails: network `chap` not found | Create the external network, or use the CHAP overlay with `CHAP_NETWORK` |
| API container restarts at once | `CHAP_BASE_URL` missing, or `DATABASE_URL` / `RABBITMQ_URL` using `localhost` |
| migrate restarts | Postgres not reachable at `DATABASE_URL`; on the CHAP overlay, `CHAP_DATABASE_URL` |
| Welcome save returns an error | User cannot create Routes, or the URL is not http(s) |
| **Connected**, but lists never load | Route host is wrong from the DHIS2 server; confirm code `caps` and the `/**` suffix |
| Pipelines run twice | Two scheduler containers |
| `docker exec` fails | Distroless image; use `docker logs` |
| Climate or CHAP step fails later | Connections URLs, from the worker network |

Pipeline failures and dead letters stay in the User Guide.

## Writing order

1. `engine/index.md` and `engine/requirements.md`, after the confirm items in the materials plan. The env and Compose snippets ship only after those checks.
2. `app/index.md` and `app/route.md`.
3. `engine/connections.md`, `engine/operate.md`, `check.md`, `troubleshooting.md`.
4. `index.md` last, so its two links and the finished checklist match the pages that exist.

## Pages we are not adding

- A third group for “advanced” that repeats engine and app steps.
- A handler catalog. User Guide.
- OpenAPI field reference. Link out once the public path is confirmed.
- Kubernetes or Helm. They are not in caps-engine.
- `docker-compose.dev.yml`. Development Guide.
