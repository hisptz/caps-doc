# Development guide — materials

Facts to reuse when writing `src/content/docs/development-guide/`. If a cell says **confirm**, read that file in the same change. Several app docs disagree with the scripts; the script wins.

## Engine commands

From `caps-engine/package.json`, the Makefile, and `CONTRIBUTING.md`.

| Task | Command | Source |
| --- | --- | --- |
| Install | `bun install` | `package.json` via Bun |
| Generate Prisma client | `bun run db:generate` | `package.json` |
| Dev API | `bun run dev:api` → `bun run --bun --watch src/services/api/index.ts` | `package.json` |
| Dev worker | `bun run dev:worker` → watch `src/services/worker/worker.ts` | `package.json` |
| Dev scheduler | `bun run dev:scheduler` → watch `src/services/scheduler/index.ts` | `package.json` |
| Lint | `bun run lint` / `bun run lint:fix` | `package.json` |
| Format | `bun run format` / `bun run format:check` | `package.json` |
| Typecheck | `bun run typecheck` | `package.json` |
| Test | `bun run test` (`bunx --bun vitest run`) | `package.json` |
| Test watch | `bun run test:watch` | `package.json` |
| Coverage | `bun run test:coverage` (`vitest run --coverage`, Node) | `package.json` |
| Migrate in dev | `bun run db:migrate` | `package.json` |
| Seed | `bun run db:seed` | `package.json` |
| Studio | `bun run db:studio` | `package.json` |
| Reset database | `bun run db:reset` | `package.json`. Destructive. Mention once, with that warning |
| Compose stack | `make up` / `make down` / `make logs` | Makefile |
| Tests via Make | `make test` sets `DATABASE_URL` from `DATABASE_URL_TEST` | Makefile |

Runtime is Bun 1.x. Do not write npm or pnpm instructions for this repo.

CI on push and pull request to `main` (`.github/workflows/ci.yml`): `bun run lint`, `format:check`, `typecheck`, `test:coverage`. The test job uses Postgres 17 (`caps_test`) and RabbitMQ, and sets `DATABASE_URL`, `DATABASE_URL_TEST`, and `RABBITMQ_URL_TEST`. It runs `bun run db:generate` and `bunx prisma migrate deploy` before coverage.

Local Compose Postgres is `postgres:16-alpine` (`docker-compose.yml`). Keep both versions visible. They are not a single number to “correct”.

### Environment for local development

Use the same names as the deployment materials plan. On this guide, split them by who reads them:

| Reader | URL host |
| --- | --- |
| Host `dev:*` process | `localhost` and the published port (`5432`, `5672`, `4000`) |
| Process inside Compose | Service DNS (`postgres`, `rabbitmq`), never `localhost` |

`CHAP_BASE_URL` has no default in `src/shared/schemas/env.ts`. `.env.example` sets `http://localhost:8000`. The API process exits if AMQP init fails (`src/services/api/index.ts`).

`DATABASE_URL_TEST` is in scope for this guide and out of scope for the Deployment Guide. Example: `postgresql://caps:caps@localhost/caps_test`.

### Handler contract

Source: `CONVENTIONS.md`, `src/services/worker/constants/handlers.ts`.

- Enum member in camelCase maps to a folder under `src/services/worker/services/handlers/`.
- Enum value is the stable key stored on pipelines. `queueName` is `step.` plus that value.
- `schemas.config` is operator configuration. `schemas.context` is data read from shared pipeline context. `schemas: {}` is valid.
- Catalog: `src/shared/handlers/catalog.ts` turns those Zod objects into JSON Schema for the app.
- Step type: `execute(ctx: StepContext)` in `src/services/worker/types/service.ts`.
- Topology: `src/services/worker/services/monitor/topology.ts` declares every queue from the map.

Current keys (re-read the enum before publishing):

| Key | Role to mention in one line |
| --- | --- |
| `open-climate-service-sync` | Refresh Open Climate Service datasets |
| `climate-openeo-create` | Start a climate job |
| `climate-openeo-poll` | Poll that job |
| `climate-openeo-download` | Download the result |
| `prediction-trigger` | Start a CHAP prediction |
| `prediction-poll` | Poll CHAP |
| `prediction-data-download` | Download prediction output |
| `dhis2-instance-pull` | Pull from a connected DHIS2 source |
| `dhis2-data-upload` | Write aggregate data back |
| `dhis2-analytics-run` | Run DHIS2 analytics |
| `threshold-generation` | Build thresholds |
| `alert-generation` | Build alerts |
| `event-data-upload` | Write tracker events |

App forms that must use those strings: `src/shared/components/HandlerConfigForms/`.

### Engine layout to show

```
caps-engine/
├── src/services/api/          # Elysia
├── src/services/worker/       # RabbitMQ, handlers, outbox
├── src/services/scheduler/    # Croner, LISTEN/NOTIFY
├── src/shared/
├── src/tests/unit/
├── src/tests/integration/
├── prisma/schemas/
├── prisma/migrations/
└── docker-compose.yml
```

Entry points: `src/services/api/index.ts`, `src/services/worker/worker.ts`, `src/services/scheduler/index.ts`.

## App commands

From `caps-app/package.json` and `.github/workflows/ci.yml`.

| Task | Command | Notes |
| --- | --- | --- |
| Install | `pnpm install` | pnpm 11, see `packageManager` |
| Dev server | `pnpm start` | `dotenv -- cross-var d2-app-scripts start --proxy %DHIS2_PROXY_URL%` |
| Typecheck | `pnpm typecheck` | `tsc --noEmit` and `tsc -p e2e` |
| Lint | `pnpm lint` | ESLint and `prettier -c .` |
| Format | `pnpm format` | |
| Unit tests | `pnpm test` | Jest via `d2-app-scripts` |
| i18n catalogs | `pnpm exec d2-app-scripts i18n generate` | CI runs this before Jest. `src/locales` is gitignored |
| E2E stack | `pnpm e2e:up` / `pnpm e2e:down` | `e2e/stack/docker-compose.yml` |
| E2E | `pnpm e2e` | Playwright, config `e2e/playwright.config.ts` |
| Build | `pnpm build` | zip under `build/bundle/` |
| Deploy | `pnpm deploy` | Deployment Guide owns the operator story |

Node: CI typecheck, ESLint, Jest, and e2e use Node 24. The release workflow uses Node 22. Document “Node 22–24”.

`.env.example` today:

```
DHIS2_BASE_URL=http://localhost:8080
DHIS2_PROXY_URL=https://play.im.dhis2.org/dev
```

`pnpm start` proxies `DHIS2_PROXY_URL`. It does not read `DHIS2_BASE_URL`.

### Confirm before the app page is published

1. **Proxy target.** CONTRIBUTING and `docs/GETTING_STARTED.md` say `d2-app-scripts start --proxy http://localhost:8080`. The script and `.env.example` do not. Write the script. Fix or footnote the older docs.
2. **`D2_USERNAME` / `D2_PASSWORD`.** The app README still lists them. They are not in `.env.example`. Do not document them as required for `pnpm start` unless a current file reads them.
3. **Playwright login.** `e2e/support/env.ts` defaults to `http://127.0.0.1:18080`, user `admin`, password `district`, route target `http://api:4000`, app path `/api/apps/caps-app/index.html`. Use these for the e2e section. They are not the dev-server proxy.
4. **Stale testing claims.** App `docs/GETTING_STARTED.md` says there are no e2e specs, that Playwright uses an iPhone 12 viewport, and that CI does not run Jest. The tree has `e2e/onboarding.spec.ts`, `e2e/navigation.spec.ts`, and `e2e/pipelines.spec.ts`. `e2e/playwright.config.ts` uses Desktop Chrome. CI runs `pnpm test` and `pnpm e2e`. Do not copy the getting-started page into the guide.

### App rules worth a sentence each

From `CONTRIBUTING.md`, still accurate where they name code rather than CI:

- Hash routes only (`HashRouter`).
- CAPS HTTP only through `src/capsApi` (`routes/caps/run`).
- Strings through `i18n.t()` from `@dhis2/d2-i18n`.
- Forms: React Hook Form, Zod, `FormProvider`.
- `d2.config.js`: title `CAPS`, `minDHIS2Version` `2.41`, entry `src/app/App.tsx`.

Menu labels for any dev screenshot: **Dashboard**, **Pipelines**, **Executions**, **Climate data**, **Settings**, **About** (`AppMenu.tsx`).

## Pull request facts

| Item | Engine | App |
| --- | --- | --- |
| Default branch | `main` | `main` |
| Release | semantic-release | semantic-release, zip attached |
| Commit types that release | `feat`, `fix`, breaking | same |
| Hook | Husky, lint-staged | Husky, lint-staged, ESLint `--max-warnings=0` |
| commitlint | none | none |
| Contact | info@hisptanzania.org | same |
| License file | do not edit | do not edit |

Example messages already used in CONTRIBUTING: `fix(worker): ack step results once`, `feat(api): list dead letters`, `fix(pipelines): reset form errors on edit`, `feat(settings): persist route URL`.

## Docs site

| Task | Command |
| --- | --- |
| Install | `pnpm install` in caps-doc |
| Preview | `pnpm dev` → `http://localhost:4321` |
| Build | `pnpm build` |

Pages: `src/content/docs/{user-guide,deployment-guide,development-guide}/`. Plans stay in `docs/plans/` and are not in the Starlight collection (`src/content.config.ts` loads the docs loader only).

## Where this guide must not copy from

| Source | Why |
| --- | --- |
| Deployment image-pin and backup steps | Different reader |
| `e2e/stack` as the way to develop the app | It is the smoke stack, with dummy CHAP and climate hosts (`chap.invalid`) |
| `docker-compose.dev.yml` as `make up` | Different file, not the default target |
| Workspace notes under the parent `climate-project/docs/` | Not published with caps-doc. Rewrite the short map; do not link to a private tree |
