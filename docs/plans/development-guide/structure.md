# Development guide — structure

Proposed sidebar for `src/content/docs/development-guide/`. Write the pages in this order. Later pages assume the local engine and app are running.

The index file already exists and should stay at `sidebar.order: 0`. Other files are new.

| Order | File | Sidebar label | Reader can… |
| ---: | --- | --- | --- |
| 0 | `index.md` | Start developing | Pick this guide and see which repository they will edit |
| 1 | `repositories.md` | Repositories | Clone the right repo and name the branch they will work on |
| 2 | `engine.md` | Engine | Run Postgres, RabbitMQ, and the three Bun processes on a laptop |
| 3 | `app.md` | DHIS2 app | Open the app at `localhost:3000` against a DHIS2 proxy and a local engine |
| 4 | `map.md` | Code map | Find the API module, worker, scheduler, or screen that owns a bug |
| 5 | `handlers.md` | Pipeline steps | Add or change a handler so the engine and the app agree on the key |
| 6 | `testing.md` | Tests | Run Vitest, Jest, and Playwright the way CI does |
| 7 | `contribute.md` | Pull requests | Match commit style, hooks, and the checks on `main` |

## Page briefs

### Start developing (`index.md`)

Replace the “being written” note. Audience, the three repositories, and links along the sidebar. Send operators to `/deployment-guide/`. Send people who only need to create a pipeline to `/user-guide/` once that guide exists.

### Repositories (`repositories.md`)

Before you start: Git and a GitHub account.

Document the clone URLs and the rule that each app is its own repository. Releases are cut from `main` by semantic-release in both application repos.

```bash
git clone https://github.com/hisptz/caps-engine.git
git clone https://github.com/hisptz/caps-app.git
```

Mention `caps-doc` only as the site this page lives on. How to preview it belongs on the pull request page, not here.

Out of scope: forking policy beyond “branch from `main` and open a PR”. Both CONTRIBUTING files already say that.

### Engine (`engine.md`)

Before you start: Bun 1.x, Docker 24+, Compose v2.

Steps, in this order:

1. `cp .env.example .env` in caps-engine.
2. `docker network create chap` if it does not exist. `docker-compose.yml` declares that network as external, so Compose fails without it even for a local stack.
3. Start infrastructure. Tell the reader to stop the Compose `api`, `worker-1`, `worker-2`, and `scheduler` if they only want host processes, **or** to skip `dev:*` if they are happy with the containers. Running both schedulers is the bug this page must prevent. **Confirm** a recommended local combination before publishing: containers for Postgres, RabbitMQ, and migrate, host processes for the code under edit. The stock `make up` starts the compiled services too.
4. `bun install` and `bun run db:generate`.
5. `bun run dev:api`, `dev:worker`, and `dev:scheduler` in separate terminals. These are `bun run --bun --watch` on `src/services/api/index.ts`, `src/services/worker/worker.ts`, and `src/services/scheduler/index.ts`.
6. Optional: `bun run db:seed` for example pipelines.

Check: API log line that the server is on port 4000, and `GET /system/info` returns 200. RabbitMQ management at `http://localhost:15672` is optional and local-only.

Include the localhost warning for `DATABASE_URL`, `RABBITMQ_URL`, `CHAP_BASE_URL`, and the climate URLs when those values are read **inside** containers. Host `dev:*` processes really do use `localhost` for published ports. The two cases must not be merged into one `.env` snippet.

`CHAP_BASE_URL` is required by `src/shared/schemas/env.ts`. A local engine will not boot without it, even if the task does not call CHAP. Say that, and point at the example value `http://localhost:8000`.

Do not document `docker-compose.dev.yml` as the default. One paragraph: it is an optional fuller stack (DHIS2, CHAP, climate images) and it is not what `make up` uses.

### DHIS2 app (`app.md`)

Before you start: Node 22–24, pnpm 11 (the `packageManager` field), a DHIS2 2.41+ instance, and a running engine API.

Steps:

1. `cp .env.example .env` in caps-app.
2. `pnpm install`.
3. `pnpm start`, which is `d2-app-scripts start` proxied at `DHIS2_PROXY_URL`.
4. Open `http://localhost:3000`. First load with no Route shows **Welcome to CAPS**. The base URL must be reachable from the **DHIS2 server**, not only from the laptop. For DHIS2 on the host and the API on the host, that is `http://localhost:4000`. For DHIS2 in Docker, it is a hostname on that network (the e2e stack uses `http://api:4000`).
5. After the route exists, the hash routes are Dashboard `#/`, Pipelines, Executions, Climate data, Settings, About.

**Confirm** the proxy story against the current files before writing the commands. `package.json` reads `DHIS2_PROXY_URL`. `.env.example` sets that to `https://play.im.dhis2.org/dev` and sets `DHIS2_BASE_URL` to `http://localhost:8080`. CONTRIBUTING and `docs/GETTING_STARTED.md` still say the proxy is hard-coded to `http://localhost:8080`. Publish the script and the example file. Mention the older docs only as a trap, or fix those docs first.

Check: the CAPS shell loads, **Settings** shows **Connected**, and a pipelines list request succeeds. That proves the Route, which a 3000 response alone does not.

Dev-only rules to state on this page:

- `HashRouter` stays. Do not switch to `BrowserRouter`.
- CAPS HTTP goes through `src/capsApi`.
- Forms use React Hook Form, Zod, and `FormProvider`, in the same shape as the pipeline modals.

### Code map (`map.md`)

Before you start: the reader can open either repo. They do not need the app running to use this page.

A short picture of a request, then tables. Reuse the idea from the system overview without copying the private workspace docs: the browser talks to DHIS2, DHIS2 proxies to the API, the API writes Postgres and an outbox row, the worker publishes to RabbitMQ and runs steps.

Engine paths:

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

App paths:

| Path | What to edit |
| --- | --- |
| `src/app/App.tsx` | Shell, `CapsSetupGate`, `HashRouter` |
| `src/capsApi/` | HTTP via the DHIS2 data engine |
| `src/pages/` and `src/modules/` | Screens |
| `src/shared/components/HandlerConfigForms/` | Operator fields for a handler |
| `d2.config.js` | App title **CAPS**, `minDHIS2Version` 2.41 |

State the invariants in one list: one scheduler, workers scale, distroless images have no shell, missed cron ticks are not replayed, handler keys are stored on pipelines so renaming one is a breaking change.

### Pipeline steps (`handlers.md`)

Before you start: engine tests run, and the reader has read the code map.

This is the page for a new or changed step. Follow `CONVENTIONS.md`:

1. Add a `Handlers` enum string and a `HANDLERS` entry. `queueName` is `step.<handler-key>`.
2. Implement `StepHandler.execute(ctx)` under `src/services/worker/services/handlers/<camelCase>/`.
3. Put operator config on `schemas.config` and pipeline-context reads on `schemas.context`. Leave `schemas` empty when the step has neither. Do not add dummy objects.
4. Re-export from `src/services/worker/services/handlers/index.ts`. Topology picks up queues from the map. Do not invent a queue name outside it.
5. In caps-app, add a form under `HandlerConfigForms` and register it so the key matches the enum string exactly.

List the current keys so the page can name them, and tell the writer to re-read the enum rather than trust this plan if it has drifted:

`open-climate-service-sync`, `climate-openeo-create`, `climate-openeo-poll`, `climate-openeo-download`, `prediction-trigger`, `prediction-poll`, `prediction-data-download`, `dhis2-instance-pull`, `dhis2-data-upload`, `dhis2-analytics-run`, `threshold-generation`, `alert-generation`, `event-data-upload`.

Check: the handler catalog endpoint shows the new key, the app form renders it, and a unit test calls `execute`.

Link the User Guide for what the step means to an operator. This page is how to implement it.

### Tests (`testing.md`)

Before you start: the engine page’s database exists. The app page’s install exists for Jest. Playwright needs Docker.

Engine:

- Vitest, not `bun test`. Unit tests in `src/tests/unit/`, integration tests in `src/tests/integration/`.
- `bun run test`, `bun run test:watch`, `bun run test:coverage`.
- `make test` points `DATABASE_URL` at `DATABASE_URL_TEST`. Create `caps_test` before that (`make db-shell`, then `CREATE DATABASE caps_test;`).
- CI (`.github/workflows/ci.yml`) runs lint, `format:check`, typecheck, and `test:coverage` against Postgres 17 and RabbitMQ, with `RABBITMQ_URL_TEST`. Local Compose Postgres is 16. Do not tell readers those versions are a mismatch to “fix” in passing.
- Integration tests share one database and run one file at a time. Coverage is collected under Node because Bun’s runner does not support it (`test:coverage` calls `vitest` directly).
- **Confirm** whether `make test` is enough for integration tests locally or whether `RABBITMQ_URL_TEST` must be exported too. CI sets it. The Makefile does not.

App:

- `pnpm typecheck`, `pnpm lint` (ESLint and `prettier -c`), `pnpm test` (Jest via `d2-app-scripts`).
- `pnpm exec d2-app-scripts i18n generate` before tests if `src/locales` is missing. CI does this because `src/locales` is gitignored.
- Playwright: `pnpm e2e:up`, `pnpm build`, `pnpm e2e`, `pnpm e2e:down`. Specs live in `e2e/` (`onboarding.spec.ts`, `navigation.spec.ts`, `pipelines.spec.ts`). The config uses Desktop Chrome, one worker, and a disposable stack (`e2e/stack/docker-compose.yml`) with DHIS2 on `127.0.0.1:18080` and the route target `http://api:4000`.
- CI runs typecheck, ESLint, Prettier, Jest, and e2e. Trust `.github/workflows/ci.yml`. `CONTRIBUTING.md` and `docs/GETTING_STARTED.md` still say CI skips Jest and that no Playwright specs exist. Those sentences are stale. Do not copy them.

### Pull requests (`contribute.md`)

Before you start: the reader has a branch and the tests for their repo pass.

Cover both application repos in one page, with a small table where they differ.

Shared:

- Target `main`. Conventional Commits. `feat` is minor, `fix` is patch, `feat!` or `BREAKING CHANGE` is major. Other types do not release.
- No commitlint hook. Releases still depend on the message. Husky plus lint-staged formats staged files.
- Do not commit `.env` or real credentials. Do not edit `LICENSE`.
- Security reports go to `SECURITY.md`, not a public issue. Other contact: info@hisptanzania.org.
- Search existing issues first. Use the bug and feature templates.

Engine extras: tests for handler, queue, or API behavior. Handler keys stay aligned with app forms (`CONVENTIONS.md`).

App extras: `HashRouter`, `src/capsApi`, `i18n.t()`, React Hook Form plus Zod.

Docs site extras, a short section at the end: edit `src/content/docs/`, preview with `pnpm dev` at `http://localhost:4321`, and update `docs/plans/` when a command on a plan page changes. Plans are not published.

Check: the PR description says what changed and how it was run. CI on the PR is the definition of done.

## Writing order

1. Repositories, Engine, and App, after the proxy and scheduler **confirm** items are resolved.
2. Code map and Pipeline steps.
3. Tests and Pull requests.
4. Landing page last.

## Pages we are not adding

- A production compose walkthrough. Deployment Guide.
- An operator tour of Dashboard and Pipelines. User Guide.
- A generated API reference. Link to OpenAPI once its path is confirmed.
- A chapter per handler. One page that teaches the pattern, plus the key list.
