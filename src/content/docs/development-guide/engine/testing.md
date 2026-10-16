---
title: Engine tests
description: Run Vitest the way engine CI does.
sidebar:
  label: Engine tests
  order: 3
---

Engine tests are Vitest. Do not use `bun test`.

## Before you start

Postgres from [Run the engine](/development-guide/engine/) is up, and `bun install` has been run in caps-engine.

## Steps

Unit tests are `src/tests/unit/`. Integration tests are `src/tests/integration/`. Integration files share one database and clear it between tests, so they run one file at a time.

```bash
bun run test
bun run test:watch
bun run test:coverage
```

`bun run test` is `bunx --bun vitest run`. `bun run test:coverage` calls `vitest` directly, so coverage runs under Node.

`make test` points `DATABASE_URL` at `DATABASE_URL_TEST`. Create the database first. With the Compose Postgres from the setup page:

```bash
make db-shell
```

```sql
CREATE DATABASE caps_test;
```

`.env.example` contains:

```dotenv title=".env"
DATABASE_URL_TEST=postgresql://caps:caps@localhost/caps_test
```

Use the password you actually set. Integration tests read `RABBITMQ_URL_TEST`. `make test` does not export it. If the variable is unset, tests fall back to `amqp://guest:guest@localhost:5672`. The Compose broker creates `RABBITMQ_USER` (the example file uses `caps`), not `guest`. Export the Compose URL before `make test`:

```bash
export RABBITMQ_URL_TEST=amqp://caps:replace-me@localhost:5672
make test
```

CI (`.github/workflows/ci.yml`) runs `bun run lint`, `bun run format:check`, `bun run typecheck`, and `bun run test:coverage` against Postgres 17 and RabbitMQ, and it sets `DATABASE_URL`, `DATABASE_URL_TEST`, and `RABBITMQ_URL_TEST`. Local Compose Postgres is `postgres:16-alpine`. Those are two versions on purpose. Do not treat the difference as a mismatch to fix in passing.

`bun run db:reset` drops and recreates the database. It is destructive.

## Check

`bun run test` exits 0, or the failure names a test file rather than a refused connection to Postgres or RabbitMQ.

## If this fails

A refused Postgres connection means `caps_test` does not exist or `DATABASE_URL_TEST` points at the wrong host. A refused RabbitMQ connection with user `guest` means `RABBITMQ_URL_TEST` was not exported. CI's definition of done is the workflow above, which is also what [Pull requests](/development-guide/contribute/) expects.
