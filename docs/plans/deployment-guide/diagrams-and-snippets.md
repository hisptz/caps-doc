# Deployment guide — diagrams and snippets

The deployment pages teach install and handover with two things a reader can use without a matching screen:

- A **diagram** for how the processes and URLs fit together.
- A **snippet** they can copy: an env file, a Compose file, a command, or a Route body.

Do not plan screenshots for this guide. DHIS2 chrome, button order, and empty dashboards change, and a photo does not start a container. Name the real labels in **bold** when a step happens in the app (**Welcome to CAPS**, **Save and continue**, **Connected**). The check is a command result or that label, not a picture.

Starlight code blocks already have a copy button. Give every snippet a `title` so the reader knows which file or host it belongs to.

## When to use which

| The reader needs to… | Put this on the page |
| --- | --- |
| See which process talks to which | One Mermaid diagram |
| Choose between two layouts | Starlight `Tabs` in an `.mdx` page, one snippet per tab |
| Create or change a file | A fenced block with a filename title |
| Run one command | A `bash` block, then the success line they should read |
| Fill a DHIS2 form | The field label, the value to type, and the JSON DHIS2 stores |
| Prove it worked | A `curl` or `docker compose ps` block |

One diagram per idea. One snippet per file. Do not paste a whole `docker-compose.yml` from the engine repo: that file builds from source and publishes extra ports. The public snippets are the production shape, written after the **confirm** items in the materials plan.

`engine/index.md` switches layouts (“own database” vs “beside CHAP”), so that page should be `.mdx`. The rest can stay `.md`.

## Render diagrams in the page

Write diagrams as fenced `mermaid` blocks in the Markdown source. Before the first diagram page is published, add a Mermaid renderer in `astro.config.mjs`. Do not export the diagrams to PNG. A text diagram stays in review with the page.

Keep node labels short. Put hostnames and ports in the snippet under the figure, not inside every box.

## Diagrams to publish

### 1. What you are installing

Page: the guide `index.md`. No install commands on that page. The two deploy groups link from under the figure.

```mermaid
flowchart LR
  subgraph dhis2 [DHIS2]
    app[CAPS app]
    route[Route code caps]
  end
  subgraph caps [CAPS engine]
    api[API]
    scheduler[Scheduler x1]
    workers[Workers xN]
    pg[(Postgres)]
    mq[[RabbitMQ]]
  end
  chap[CHAP]
  climate[Climate service]
  app --> route --> api
  api --> pg
  api --> mq
  scheduler --> pg
  workers --> mq
  workers --> pg
  workers --> chap
  workers --> climate
  workers --> dhis2
```

Say under it: the browser talks only to DHIS2. Workers call CHAP, climate, and DHIS2. Exactly one scheduler.

### 2. Who each URL is for

Page: `engine/index.md`, repeated in one line on `app/route.md`. This is the diagram that prevents the localhost mistake.

```mermaid
flowchart TB
  env[".env on the Docker host"]
  env -->|"postgres and rabbitmq hostnames"| containers[API workers scheduler migrate]
  env -->|"DHIS2 CHAP and climate URLs"| workers[Workers]
  admin[Operator browser] --> dhis2[DHIS2]
  dhis2 -->|"Route base URL plus /**"| api[CAPS API]
```

### 3. Two engine layouts

Page: `engine/index.md`, above the Tabs that hold the snippets.

```mermaid
flowchart TB
  subgraph own [CAPS with its own data stores]
    api1[API] --> pg1[(Postgres)]
    api1 --> mq1[[RabbitMQ]]
  end
  subgraph shared [CAPS on an existing CHAP network]
    api2[API] --> pg2[(CHAP Postgres)]
    api2 --> mq2[[CHAP RabbitMQ]]
  end
```

### 4. Upgrade order

Page: `engine/operate.md`.

```mermaid
sequenceDiagram
  participant Op as Operator
  participant Mig as migrate
  participant App as API workers scheduler
  Op->>Mig: pull new tag and run migrate
  Mig-->>Op: exit 0
  Op->>App: recreate the three services
```

## Snippets to publish

Drafts below use placeholders. Replace `1.2.3` with a real GHCR tag when the page is written. Re-read `.env.example`, `docker-compose.yml`, and `dhis2CapsRoute.ts` in the same change. Blocks marked **confirm** are the shape to aim for, not a file that already exists in caps-engine.

Every secret is `replace-me`. Say which variable it fills. Do not copy `admin` / `district` or `caps` / `caps` into a block titled as production.

### Engine environment

Page: `engine/index.md`, tab “Own Postgres and RabbitMQ”. Title the block `.env`.

```dotenv
IMAGE_TAG=1.2.3
API_PORT=4000

POSTGRES_USER=caps
POSTGRES_PASSWORD=replace-me
POSTGRES_DB=caps

# Hostnames are the Compose service names. localhost is the container itself.
DATABASE_URL=postgresql://caps:replace-me@postgres:5432/caps
RABBITMQ_USER=caps
RABBITMQ_PASSWORD=replace-me
RABBITMQ_URL=amqp://caps:replace-me@rabbitmq:5672

# Required. The API does not boot without it.
CHAP_BASE_URL=https://chap.example.org
CHAP_API_TOKEN=
```

The connections page continues the same file. Do not make the reader maintain two env files.

### Connections

Page: `engine/connections.md`. Title the block “add to `.env`”.

```dotenv
# Reachable from the worker container, not from the operator laptop.
DHIS2_BASE_URL=https://dhis2.example.org
DHIS2_USERNAME=caps-import
DHIS2_PASSWORD=replace-me

CLIMATE_API_BASE_URL=https://climate-api.example.org
CLIMATE_DATA_BASE_URL=https://climate-data.example.org
```

### Beside an existing CHAP

Page: `engine/index.md`, second tab. These three names come from `docker-compose.chap.yml`.

```dotenv
CHAP_NETWORK=chap_default
CHAP_DATABASE_URL=postgresql://caps:replace-me@chap-postgres:5432/caps
CHAP_RABBITMQ_URL=amqp://caps:replace-me@chap-rabbitmq:5672
```

```bash
docker network ls | grep chap
docker compose -f docker-compose.yml -f docker-compose.chap.yml up -d
```

**Confirm** the second command once a pull-without-build path exists. `make up-chap` always passes `--build`.

### Production Compose

Page: `engine/index.md`. **Confirm.** caps-engine does not ship a compose file that only pulls images. Either add one there and document that filename, or publish a short file on this page that:

- uses `image: ghcr.io/hisptz/caps-engine/<service>:${IMAGE_TAG}` for `migrate`, `api`, `worker`, and `scheduler`
- has no `build:` key
- runs `migrate` to completion before `api`, `worker`, and `scheduler`
- starts two workers and exactly one scheduler
- does not publish Postgres or RabbitMQ management on a public interface
- joins an external network named `chap` only when the CHAP tab needs it

Until that file exists, do not tell readers to `make up` as the production step. `make up` compiles.

Start and check, once the file name is real:

```bash
docker compose pull
docker compose up -d
docker compose ps
```

Pass line to show under the command: `migrate` exited 0, and `api`, both workers, and one `scheduler` are running.

### Read the API from the DHIS2 network

Page: `check.md` (after both groups).

```bash
docker compose exec api wget -qO- http://127.0.0.1:4000/system/info
```

**Confirm** `GET /system/info` needs no header, and that the distroless API image actually contains `wget`. If it does not, the check runs from a DHIS2 or debug container on the same network:

```bash
curl -fsS http://api:4000/system/info
```

A 200 from the operator laptop only proves the published port. Say that next to the command.

### Install the DHIS2 app

Page: `app/index.md`. The zip is the release asset from caps-app. The copy-paste path is the CLI; App Management is the same zip with the labels **App Management** and **CAPS**.

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm deploy --username replace-me --password replace-me https://dhis2.example.org
```

The deploy user needs App Management. Building the zip needs Node and pnpm; the DHIS2 server does not.

### Register the Route

Page: `app/route.md`. Two equivalent snippets.

Typed on **Welcome to CAPS** in **CAPS backend base URL** (no trailing slash, no `/**`):

```text
https://caps.example.org
```

Stored by the app (`buildCapsRouteCreatePayload`):

```json
{
  "code": "caps",
  "name": "CAPS API",
  "description": "Proxy target for the CAPS monitoring API",
  "url": "https://caps.example.org/**",
  "headers": {},
  "disabled": false
}
```

An admin who creates the route in Maintenance copies the JSON fields, not a screenshot. The welcome form still asks for the base URL. The page says both.

Check command, from a machine that can call DHIS2:

```bash
curl -fsS -u "replace-me:replace-me" \
  "https://dhis2.example.org/api/routes?filter=code:eq:caps&fields=code,name,url,disabled"
```

Pass: one route, `code` is `caps`, `url` ends in `/**`, `disabled` is false. Then open **Settings** and read the **Connected** tag.

### Logs, upgrade, backup

Page: `engine/operate.md`.

```bash
docker compose logs -f api
docker compose logs -f worker-1 scheduler
```

There is no shell in the API, worker, or scheduler images. Do not document `docker exec` into them.

```bash
# edit IMAGE_TAG, then:
docker compose pull
docker compose run --rm migrate
docker compose up -d api worker scheduler
```

**Confirm** service names against the production file. The stock compose file calls the workers `worker-1` and `worker-2`, not a single `worker` service.

Backup is the Postgres volume `postgres_data`. Name `rabbitmq_data` and `caps_outputs` as optional. Do not invent a `pg_dump` one-liner until it has been run against the compose service name `postgres`.

## What does not get a figure or a snippet

- RabbitMQ management on port 15672.
- A pipeline, a schedule, or an execution. User Guide.
- `bun run dev:*`, Vitest, or `docker-compose.dev.yml`. Development Guide.
- A Kubernetes manifest or a Helm chart. They are not in caps-engine.
- A second copy of the engine’s developer `.env.example`. Its `localhost` URLs are wrong inside containers.
