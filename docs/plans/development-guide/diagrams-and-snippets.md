# Development guide — diagrams and snippets

Same rule as the deployment guide. A contributor needs a command, a path, or a picture of which process they are about to edit. A screenshot of the local app goes stale the next time the menu moves, and it does not start `bun run dev:api`.

Do not plan screenshots for this guide. Name DHIS2 labels in **bold**. Show the URL or the file to copy.

Starlight code blocks already have a copy button. Give every snippet a `title`.

## What replaced the screenshot list

| Former shot | Why it drops | Use this instead |
| --- | --- | --- |
| Dev server at `localhost:3000` | The address is the whole point | The start command and the URL as text, on `app.md` |
| **Welcome to CAPS** with a filled URL | The deployment guide already specifies the field and the stored Route | The local value to type, plus a link to the deployment Route snippet |
| Address bar with `/#/pipelines` | A picture of a hash is harder to copy than the URL | The hash URL in a `text` block |
| One handler form | The contributor needs the files to edit, not a photo of the fields | The handler skeleton on `handlers.md` |

## When to use which

| The reader needs to… | Put this on the page |
| --- | --- |
| See host processes versus containers | One Mermaid diagram |
| See where a request is edited | The code-map diagram, then the path table |
| See how a handler key is shared | One diagram from enum string to queue name to app form |
| Run the stack | A `bash` block and the success line |
| Fill **CAPS backend base URL** locally | The value, and which process fetches it |
| Add a step | A short skeleton, not a screenshot of an existing form |

One diagram per idea. Do not redraw the deployment guide’s production layouts here. Link to them.

## Diagrams to publish

Write them as fenced `mermaid` blocks. Use the same renderer the deployment pages add in `astro.config.mjs`. Do not export PNGs.

### 1. What is running on the laptop

Page: `engine.md`. This is the picture that stops a second scheduler.

```mermaid
flowchart LR
  subgraph docker [Docker]
    pg[(Postgres :5432)]
    mq[[RabbitMQ :5672]]
  end
  subgraph host [Host, bun --watch]
    api[dev:api :4000]
    worker[dev:worker]
    scheduler[dev:scheduler x1]
  end
  api --> pg
  api --> mq
  worker --> pg
  worker --> mq
  scheduler --> pg
```

Say under it: stop the Compose `api`, `worker-1`, `worker-2`, and `scheduler` before starting `dev:*`. Two schedulers double-fire pipelines. `localhost` in `.env` is correct for these host processes. It is wrong for the same variables inside a container; that case is the deployment guide.

### 2. Where a change lands

Page: `map.md`.

```mermaid
flowchart LR
  browser[Browser] --> dhis2[DHIS2]
  dhis2 -->|routes/caps/run| api[API]
  api --> pg[(Postgres + outbox)]
  worker[Worker] --> pg
  worker --> mq[[RabbitMQ]]
  mq --> worker
  worker --> step[Step handler]
```

Under the figure, the path tables already in the structure plan. The diagram answers “which box do I open?”. The table answers “which file?”.

### 3. One handler key, two repositories

Page: `handlers.md`.

```mermaid
flowchart LR
  enum["Handlers enum string"] --> queue["queue step.key"]
  enum --> form["caps-app form key"]
  enum --> saved["Saved pipeline step"]
```

Say under it: renaming the string breaks pipelines already stored in Postgres. The app form key and the queue name are the same string, not two names that happen to look alike.

## Snippets to publish

Re-read `package.json` in both repos, `.env.example`, and `CONVENTIONS.md` in the same change. Placeholders only. Demo passwords stay labeled as local.

### Engine on the host

Page: `engine.md`. Title the block `.env`. These hosts are `localhost` because `dev:*` runs on the host and Compose publishes the ports.

```dotenv
DATABASE_URL=postgresql://caps:replace-me@localhost:5432/caps
RABBITMQ_URL=amqp://caps:replace-me@localhost:5672
CHAP_BASE_URL=http://localhost:8000
CLIMATE_API_BASE_URL=http://localhost:8001
CLIMATE_DATA_BASE_URL=http://localhost:8081
DHIS2_BASE_URL=http://localhost:8080
DHIS2_USERNAME=admin
DHIS2_PASSWORD=district
```

`CHAP_BASE_URL` is required or the API process exits. The DHIS2 pair is the demo pair.

```bash
docker network create chap
docker compose up -d postgres rabbitmq migrate
bun install
bun run db:generate
bun run dev:api
bun run dev:worker
bun run dev:scheduler
```

**Confirm** the Compose command. `make up` also starts the compiled api, workers, and scheduler, which collide with `dev:*`. Publish a command that starts only Postgres, RabbitMQ, and migrate once that command is tried.

Check:

```bash
curl -fsS http://localhost:4000/system/info
```

**Confirm** the path needs no header.

### App on the host

Page: `app.md`.

```dotenv
DHIS2_PROXY_URL=http://localhost:8080
```

**Confirm** against `.env.example`. Today the example points `DHIS2_PROXY_URL` at `https://play.im.dhis2.org/dev`. Publish the script’s variable, not the older hard-coded proxy in CONTRIBUTING.

```bash
pnpm install
pnpm start
```

Open:

```text
http://localhost:3000
```

On **Welcome to CAPS**, **CAPS backend base URL** is the URL the DHIS2 server can call. When DHIS2 and the API are both on the host, that value is:

```text
http://localhost:4000
```

When DHIS2 is in Docker, it is a hostname on that network (`http://api:4000` in the e2e stack). Do not repeat the stored JSON here. Link to the deployment guide’s Route snippet. The app still appends `/**`.

After the route exists, the hash routes are:

```text
http://localhost:3000/#/
http://localhost:3000/#/pipelines
http://localhost:3000/#/settings
```

Check: **Settings** shows **Connected**, and a pipelines request succeeds. A 200 from port 3000 alone does not prove the Route.

### Handler skeleton

Page: `handlers.md`. Shape only. Match `CONVENTIONS.md` when writing the page. Do not invent a queue name outside the `HANDLERS` map.

```typescript
// src/services/worker/constants/handlers.ts
// queueName: "step.example-step"
// schemas.config / schemas.context, or schemas: {}
```

```typescript
// src/services/worker/services/handlers/exampleStep/index.ts
export class ExampleStepHandler implements StepHandler {
  async execute(ctx: StepContext): Promise<unknown> {
    return ctx;
  }
}
```

```text
caps-app form key: example-step
folder: src/shared/components/HandlerConfigForms/
```

The key list on the page is the current enum, re-read from `handlers.ts`, not this placeholder.

### Tests and commits

Page: `testing.md` and `contribute.md`. Commands only, copied from the materials plan (`bun run test`, `pnpm test`, `pnpm e2e`, Conventional Commit examples). No coverage HTML and no Actions screenshot.

## What does not get a figure or a snippet

- An editor, a terminal transcript, GitHub, or CI logs.
- Prisma Studio, RabbitMQ management, or the e2e stack booting.
- Production App Management, image pins, or backup. Deployment Guide.
- A second copy of the production `.env`. Host `dev:*` uses `localhost`. Containers do not.
