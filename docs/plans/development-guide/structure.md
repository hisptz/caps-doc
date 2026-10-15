# Development guide — structure

Same sidebar shape as the deployment guide. Two repositories, two groups. The reader runs the engine, then the app. Detail pages sit inside the group they belong to. Pages that need both repositories come after the groups.

`src/tabs.ts` autogenerates this sidebar from `src/content/docs/development-guide/`. A directory becomes a group. Set the group label and position on that directory’s `index.md`. Do not special-case `tabs.ts`.

```text
development-guide/
  index.md                 Start developing
  engine/
    index.md               Run the engine
    architecture.md        Source architecture
    testing.md             Engine tests
  app/
    index.md               Run the app
    architecture.md        Source architecture
    testing.md             App tests
  handlers.md              Pipeline steps
  contribute.md            Pull requests
```

| Order | Page | Sidebar label | Reader can… |
| ---: | --- | --- | --- |
| 0 | `index.md` | Start developing | See the two tracks and which repository they will edit |
| 1 | `engine/index.md` | Run the engine | Start Postgres, RabbitMQ, and the three Bun processes on the host |
| 2 | `engine/architecture.md` | Source architecture | See how the API, worker, and scheduler source fit together, then open the file |
| 3 | `engine/testing.md` | Engine tests | Run Vitest the way engine CI does |
| 4 | `app/index.md` | Run the app | Open the app at `localhost:3000` against a DHIS2 proxy and a local engine |
| 5 | `app/architecture.md` | Source architecture | See how the DHIS2 shell, screens, and `capsApi` fit together, then open the file |
| 6 | `app/testing.md` | App tests | Run Jest and Playwright the way app CI does |
| 7 | `handlers.md` | Pipeline steps | Add or change a handler so the engine and the app agree on the key |
| 8 | `contribute.md` | Pull requests | Match commit style, hooks, and the checks on `main` |

`engine/index.md` and `app/index.md` are the setup sections. They hold the diagram and the copy-paste commands for that repo. The pages under them are the specifics. Pipeline steps and Pull requests stay outside both groups because a handler change and a review touch both repositories.

There is no standalone repositories page. Each setup page starts with that repo’s clone. The landing page names both remotes and links into the groups.

## Why this shape

A flat list mixes Bun processes with pnpm and the DHIS2 app. Each group has the same three pages: run it, read the source architecture, then test it. The architecture page is where that repo’s directories are explained. The handler contract stays after both groups so it is not filed under only one of them.

## Page briefs

### Start developing (`index.md`)

Already at `sidebar.order: 0` with label “Start developing”. Replace the “being written” note.

Include the audience, the two application repositories plus this docs site, and two links: **Run the engine**, then **Run the app**. The request diagram (no commands) may sit here so both groups have a picture of where a change lands. Send operators to `/deployment-guide/`. Send people who only need to create a pipeline to `/user-guide/` once that guide exists.

No `bun` or `pnpm` commands on this page.

### Run the engine (`engine/index.md`)

Group label **Engine**. This index is the group’s first item.

Before you start: Bun 1.x, Docker 24+, Compose v2.

```bash
git clone https://github.com/hisptz/caps-engine.git
```

Then the host `.env`, the Compose services that are only Postgres, RabbitMQ, and migrate, and `bun run dev:api`, `dev:worker`, and `dev:scheduler`. The laptop diagram on this page shows one scheduler. Stop the Compose `api`, workers, and scheduler before the host processes. `make up` compiles and starts those services too, so it is a one-line warning with a link to the Deployment Guide, not the daily loop.

`CHAP_BASE_URL` is required. Link to Source architecture and Engine tests instead of listing directories or Vitest flags here.

Check: the API log says port 4000, and `GET /system/info` returns 200.

### Source architecture (`engine/architecture.md`)

Before you start: the repo is cloned. The processes do not have to be running.

This page is how caps-engine source is arranged, not how to install it. Three entry points, one database, one broker:

| Process | Entry | What the source does |
| --- | --- | --- |
| API | `src/services/api/index.ts` | Elysia modules. Writes Postgres. Does not publish to RabbitMQ itself |
| Worker | `src/services/worker/worker.ts` | Outbox publisher, pipeline coordinator, step workers, handlers |
| Scheduler | `src/services/scheduler/index.ts` | Croner jobs. Syncs from Postgres `LISTEN/NOTIFY`. Exactly one process |

A trigger, manual or cron, writes a `PipelineExecution` and an outbox row. `services/outbox/publisher.ts` publishes that row. `services/runners/pipeline.ts` walks steps. A queued step goes to a `step.<handler-key>` queue and `services/workers/step.ts`. The handler class lives under `services/handlers/`. Queue names are declared from the `HANDLERS` map in `services/monitor/topology.ts`. Shared Zod for the API catalog is `src/shared/handlers/catalog.ts`. Models are split under `prisma/schemas/`.

One diagram of those folders, from the diagrams plan. Then the path table, which is the index of that diagram:

| Path | What to edit |
| --- | --- |
| `src/services/api/modules/` | Elysia modules (pipelines, schedules, monitoring, handlers, climate, evaluations, system, source routes) |
| `src/services/worker/services/runners/pipeline.ts` | Coordinator |
| `src/services/worker/services/workers/step.ts` | Queued step worker |
| `src/services/worker/services/outbox/publisher.ts` | Outbox publisher |
| `src/services/worker/constants/handlers.ts` | `Handlers` enum and `HANDLERS` map |
| `src/services/worker/services/handlers/` | Step implementations |
| `src/services/worker/services/monitor/topology.ts` | Queue and exchange declarations |
| `src/services/scheduler/` | Croner jobs and Postgres `LISTEN/NOTIFY` |
| `prisma/schemas/` | Models. Client output is `prisma/generated/prisma/` |
| `src/shared/schemas/env.ts` | Validated environment |
| `src/shared/handlers/catalog.ts` | Zod schemas exposed as JSON Schema |

Invariants to state here: one scheduler, workers scale, distroless images have no shell, missed cron ticks are not replayed, handler keys are stored on pipelines so renaming one is a breaking change. The last of those links to Pipeline steps.

### Engine tests (`engine/testing.md`)

Before you start: Postgres from the engine setup page.

- Vitest, not `bun test`. Unit tests in `src/tests/unit/`, integration tests in `src/tests/integration/`.
- `bun run test`, `bun run test:watch`, `bun run test:coverage`.
- `make test` points `DATABASE_URL` at `DATABASE_URL_TEST`. Create `caps_test` first (`make db-shell`, then `CREATE DATABASE caps_test;`).
- CI (`.github/workflows/ci.yml`) runs lint, `format:check`, typecheck, and `test:coverage` against Postgres 17 and RabbitMQ, with `RABBITMQ_URL_TEST`. Local Compose Postgres is 16. Do not tell readers those versions are a mismatch to fix in passing.
- Integration tests share one database and run one file at a time. Coverage runs under Node because `test:coverage` calls `vitest` directly.
- **Confirm** whether `make test` is enough locally or whether `RABBITMQ_URL_TEST` must be exported too. CI sets it. The Makefile does not.

### Run the app (`app/index.md`)

Group label **App**. This index is the group’s first item.

Before you start: Node 22–24, pnpm 11 (the `packageManager` field), a DHIS2 2.41+ instance, and the engine API from the Engine group.

```bash
git clone https://github.com/hisptz/caps-app.git
```

Then `DHIS2_PROXY_URL`, `pnpm install`, and `pnpm start`. Open `http://localhost:3000`. First load with no Route shows **Welcome to CAPS**. The base URL must be reachable from the DHIS2 server. Hash routes after that are Dashboard `#/`, Pipelines, Executions, Climate data, Settings, About, written as full URLs in the snippets plan.

**Confirm** the proxy story before writing the commands. `package.json` reads `DHIS2_PROXY_URL`. `.env.example` currently points that at `https://play.im.dhis2.org/dev`. CONTRIBUTING and `docs/GETTING_STARTED.md` still say the proxy is hard-coded to `http://localhost:8080`. Publish the script.

Rules on this page:

- `HashRouter` stays. Do not switch to `BrowserRouter`.
- CAPS HTTP goes through `src/capsApi`.
- Forms use React Hook Form, Zod, and `FormProvider`.

Check: the shell loads, **Settings** shows **Connected**, and a pipelines request succeeds. A 200 from port 3000 alone does not prove the Route. Link to Source architecture and App tests for the folders and Jest.

### Source architecture (`app/architecture.md`)

Before you start: the repo is cloned.

This page is how caps-app source is arranged. DHIS2 hosts the app. The browser does not call the engine origin. `src/app/App.tsx` mounts the query client, `CapsSetupGate`, and `HashRouter`. A missing Route with code `caps` renders **Welcome to CAPS**. After that, each screen is a hash route.

A screen in `src/pages/` or `src/modules/` reads and writes CAPS only through `src/capsApi/`, which uses the DHIS2 data engine against `routes/caps/run`. The same app reads DHIS2 metadata (org units, data elements, the Route) through `@dhis2/app-runtime` directly. Handler fields live in `src/shared/components/HandlerConfigForms/` and must use the engine enum string. That contract is the Pipeline steps page, not this one.

One diagram of that chain, from the diagrams plan. Then the path table:

| Path | What to edit |
| --- | --- |
| `src/app/App.tsx` | Shell, `CapsSetupGate`, `HashRouter` |
| `src/capsApi/` | HTTP via the DHIS2 data engine |
| `src/pages/` and `src/modules/` | Screens |
| `src/shared/components/HandlerConfigForms/` | Operator fields for a handler |
| `d2.config.js` | App title **CAPS**, `minDHIS2Version` 2.41 |

Link to Pipeline steps before describing a new handler form. The key has to match the engine enum.

### App tests (`app/testing.md`)

Before you start: `pnpm install` from the app setup page. Playwright needs Docker.

- `pnpm typecheck`, `pnpm lint` (ESLint and `prettier -c`), `pnpm test` (Jest via `d2-app-scripts`).
- `pnpm exec d2-app-scripts i18n generate` before tests if `src/locales` is missing. CI does this because `src/locales` is gitignored.
- Playwright: `pnpm e2e:up`, `pnpm build`, `pnpm e2e`, `pnpm e2e:down`. Specs live in `e2e/` (`onboarding.spec.ts`, `navigation.spec.ts`, `pipelines.spec.ts`). Desktop Chrome, one worker, disposable stack on `127.0.0.1:18080`, route target `http://api:4000`.
- CI runs typecheck, ESLint, Prettier, Jest, and e2e. Trust `.github/workflows/ci.yml`. `CONTRIBUTING.md` and `docs/GETTING_STARTED.md` still say CI skips Jest and that no Playwright specs exist. Do not copy those sentences.

### Pipeline steps (`handlers.md`)

After both groups. Before you start: the reader has read both source-architecture pages, and engine tests run.

Follow `CONVENTIONS.md`:

1. Add a `Handlers` enum string and a `HANDLERS` entry. `queueName` is `step.<handler-key>`.
2. Implement `StepHandler.execute(ctx)` under `src/services/worker/services/handlers/<camelCase>/`.
3. Put operator config on `schemas.config` and pipeline-context reads on `schemas.context`. Leave `schemas` empty when the step has neither. Do not add dummy objects.
4. Re-export from `src/services/worker/services/handlers/index.ts`. Topology picks up queues from the map.
5. In caps-app, add a form under `HandlerConfigForms` whose key matches the enum string.

The handler-key diagram and the skeleton are on this page. Re-read the enum before publishing the key list:

`open-climate-service-sync`, `climate-openeo-create`, `climate-openeo-poll`, `climate-openeo-download`, `prediction-trigger`, `prediction-poll`, `prediction-data-download`, `dhis2-instance-pull`, `dhis2-data-upload`, `dhis2-analytics-run`, `threshold-generation`, `alert-generation`, `event-data-upload`.

Check: the handler catalog shows the new key, the app form renders it, and a unit test calls `execute`. Link the User Guide for what the step means to an operator.

### Pull requests (`contribute.md`)

After both groups. Before you start: the branch exists and the tests for the touched repo pass.

One page, with a small table where the repos differ.

Shared:

- Target `main`. Conventional Commits. `feat` is minor, `fix` is patch, `feat!` or `BREAKING CHANGE` is major. Other types do not release.
- No commitlint hook. Releases still depend on the message. Husky plus lint-staged formats staged files.
- Do not commit `.env` or real credentials. Do not edit `LICENSE`.
- Security reports go to `SECURITY.md`, not a public issue. Other contact: info@hisptanzania.org.
- Search existing issues first. Use the bug and feature templates.

Engine extras: tests for handler, queue, or API behavior. Handler keys stay aligned with app forms.

App extras: `HashRouter`, `src/capsApi`, `i18n.t()`, React Hook Form plus Zod.

Docs site, a short section at the end: edit `src/content/docs/`, preview with `pnpm dev` at `http://localhost:4321`, and update `docs/plans/` when a planned command changes. Plans are not published.

Check: the PR says what changed and how it was run. CI on the PR is the definition of done.

## Writing order

1. `engine/index.md` and `app/index.md`, after the proxy and scheduler **confirm** items are resolved.
2. `engine/architecture.md`, `app/architecture.md`, and `handlers.md`.
3. `engine/testing.md`, `app/testing.md`, and `contribute.md`.
4. `index.md` last, so its two links match the pages that exist.

## Pages we are not adding

- A third group that repeats engine and app setup.
- A production compose walkthrough. Deployment Guide.
- An operator tour of Dashboard and Pipelines. User Guide.
- A generated API reference. Link to OpenAPI once its path is confirmed.
- A chapter per handler. One shared page for the pattern, plus the key list.
