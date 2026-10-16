---
title: Run the engine
description: Start Postgres and RabbitMQ, then reload the API, worker, and scheduler on the host.
sidebar:
  label: Engine
  order: 1
---

Run Postgres and RabbitMQ in Docker. Run the API, worker, and scheduler on the host with Bun so they reload when you edit source. caps-engine is Bun. Do not use npm, pnpm, or Node for this repository.

## Before you start

- Bun 1.x
- Docker 24 or newer, and Compose v2
- A clone of the engine:

```bash
git clone https://github.com/hisptz/caps-engine.git
cd caps-engine
```

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

`localhost` in `.env` is correct for these host processes. It is wrong for the same variables inside a container. That case is the [Deployment Guide](/deployment-guide/engine/).

## Steps

The repository Compose file expects an external network named `chap`, even when you are not attaching to CHAP. Create it once:

```bash
docker network create chap
```

`make up` compiles distroless images and starts `api`, `worker-1`, `worker-2`, and `scheduler` as well as Postgres, RabbitMQ, and migrate. Those containers collide with the host processes, and a second scheduler double-fires pipelines. Start only the data stores and the one-shot migration:

```bash
docker compose up -d postgres rabbitmq migrate
```

If a previous `make up` left the app containers running, stop them:

```bash
docker compose stop api worker-1 worker-2 scheduler
```

Copy `.env.example` to `.env`. For host processes the database and broker hosts are `localhost`. `CHAP_BASE_URL` is required. The API process does not listen without it, and it exits if the AMQP connection fails. `admin` / `district` is the demo DHIS2 pair for this local file only.

```dotenv title=".env"
DATABASE_URL=postgresql://caps:replace-me@localhost:5432/caps
RABBITMQ_URL=amqp://caps:replace-me@localhost:5672
CHAP_BASE_URL=http://localhost:8000
CLIMATE_API_BASE_URL=http://localhost:8001
CLIMATE_DATA_BASE_URL=http://localhost:8081
DHIS2_BASE_URL=http://localhost:8080
DHIS2_USERNAME=admin
DHIS2_PASSWORD=district
```

Match `replace-me` to `POSTGRES_PASSWORD` and `RABBITMQ_PASSWORD`. The example file uses `caps` for both.

In three terminals:

```bash
bun install
bun run db:generate
bun run dev:api
```

```bash
bun run dev:worker
```

```bash
bun run dev:scheduler
```

:::caution
Run one scheduler. `bun run dev:scheduler` plus the Compose `scheduler` container will double-fire pipelines. Hot reload does not exist inside the distroless images. `docker exec` into `api`, `worker`, or `scheduler` fails.
:::

How the source is arranged is [Source architecture](/development-guide/engine/architecture/). Tests are [Engine tests](/development-guide/engine/testing/).

## Check

The API log says `Server running on http://localhost:4000`. This request needs no authentication header:

```bash
curl -fsS http://localhost:4000/system/info
```

A 200 means the API process answered.

## If this fails

`CHAP_BASE_URL` missing, or RabbitMQ still starting, exits the API before it listens. `docker network create chap` is required by the repository Compose file. If port 4000 is already taken, a Compose `api` container is still running.
