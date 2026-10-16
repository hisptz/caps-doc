---
title: Requirements
description: Judge hosts, ports, images, and accounts before installing the engine.
sidebar:
  label: Requirements
  order: 2
---

Use this page to decide whether the host is ready. The install commands are on [Deploy the engine](/deployment-guide/engine/).

## Before you start

Nothing else in this guide. You can open this page before the first `docker compose` command.

## Host and images

- Docker 24 or newer, and Compose v2.
- The host must be able to pull `ghcr.io/hisptz/caps-engine/`.
- Images: `migrate`, `api`, `worker`, and `scheduler`. Platforms: `linux/amd64` and `linux/arm64`.
- Pin a semver tag such as `3.0.0` (release `v3.0.0`). The registry also publishes `latest` on the default branch, `sha-…` commit tags, and a `major.minor` tag such as `3.0`. `latest` is a trial tag.
- `api`, `worker`, and `scheduler` are distroless (`gcr.io/distroless/cc-debian12`). There is no shell. `migrate` is `oven/bun:1-slim`, runs once, and restarts on failure.

Bun, pnpm, and Node are for people building from source. They are not required on the Docker host. DHIS2 2.41 or newer is a requirement of the [app](/deployment-guide/app/), not of these images.

## Ports

The Compose file on the deploy page publishes only the API, on `${API_PORT:-4000}`.

The Compose file in the caps-engine repository also publishes Postgres on `127.0.0.1:5432` and RabbitMQ on `5672` and the management UI on `15672`. Do not publish Postgres or the RabbitMQ management UI on a production host. Leave those ports off the public interface, or do not publish them at all. Containers reach Postgres and RabbitMQ by the service names `postgres` and `rabbitmq`.

## Accounts and URLs

| Variable | Role |
| --- | --- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Postgres bootstrap. Replace the password. |
| `DATABASE_URL` | Postgres URL for the API, workers, scheduler, and migrate. Inside a container the host is `postgres`, not `localhost`. |
| `RABBITMQ_USER`, `RABBITMQ_PASSWORD`, `RABBITMQ_URL` | RabbitMQ. Inside a container the host is `rabbitmq`. |
| `PORT` | Port the API process listens on. Compose sets `4000`. |
| `API_PORT` | Host port mapped to the API container. Default `4000`. |
| `IMAGE_TAG` | GHCR tag, for example `3.0.0`. |
| `CHAP_BASE_URL` | CHAP HTTP API. Required. There is no default. |
| `CHAP_API_TOKEN` | Optional. Set it when CHAP `/system/info` reports `auth_required`. |
| `DHIS2_BASE_URL`, `DHIS2_USERNAME`, `DHIS2_PASSWORD` | The account workers use to call DHIS2. It can differ from the person who installs the app. |
| `CLIMATE_API_BASE_URL`, `CLIMATE_DATA_BASE_URL` | Climate HTTP API and climate data service. |
| `OUTPUTS_DIR` | Worker files. Compose sets `/tmp/caps-outputs`. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Optional tracing. Empty disables it. |

`CHAP_NETWORK`, `CHAP_DATABASE_URL`, and `CHAP_RABBITMQ_URL` are only for the [beside-CHAP layout](/deployment-guide/engine/).

Demo values in the engine `.env.example` (`admin` / `district`, `caps` / `caps`) are for a local trial. Do not use them here.

## Capacity

This is a starting point, not a benchmark. The API and the scheduler are light. Workers need disk for `/tmp/caps-outputs`. When DHIS2 and CHAP share the host with CAPS, they dominate RAM.

## Check

You can pull `ghcr.io/hisptz/caps-engine/api:3.0.0`, and you know which hostname the DHIS2 server will use to call the API.

## If this fails

A denied pull means the GitHub account cannot read the package. Continue on [Deploy the engine](/deployment-guide/engine/).
