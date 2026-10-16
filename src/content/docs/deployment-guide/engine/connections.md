---
title: CHAP, climate, and DHIS2
description: Point workers at CHAP, the climate service, and the DHIS2 instance they call.
sidebar:
  label: CHAP, climate, and DHIS2
  order: 3
---

This page is the rest of the engine `.env`. It is not a second install. Use it while you are filling `.env` before the first start, or when the containers are already up and you are changing URLs. After a change, recreate the services that read the file.

The hostnames below must be reachable from the **worker container**. `localhost` inside that container is the worker itself.

## Before you start

- The `.env` and Compose file from [Deploy the engine](/deployment-guide/engine/).
- A DHIS2 user the workers will use for imports. This account can differ from the person who installs the CAPS app.
- The CHAP base URL. `CHAP_BASE_URL` is required and has no default. Without it the process does not listen.

## Steps

Add these lines to the same `.env`:

```dotenv title="add to .env"
# Reachable from the worker container, not from the operator laptop.
DHIS2_BASE_URL=https://dhis2.example.org
DHIS2_USERNAME=caps-import
DHIS2_PASSWORD=replace-me

CLIMATE_API_BASE_URL=https://climate-api.example.org
CLIMATE_DATA_BASE_URL=https://climate-data.example.org
```

1. **DHIS2, as seen by workers.** `DHIS2_BASE_URL` is the instance workers call. `DHIS2_USERNAME` and `DHIS2_PASSWORD` are the import account.
2. **CHAP.** `CHAP_BASE_URL` is the CHAP HTTP API. Set `CHAP_API_TOKEN` when that API reports `auth_required`. Sharing CHAP's Postgres and RabbitMQ is the other tab on the deploy page. It does not set this URL.
3. **Climate service.** `CLIMATE_API_BASE_URL` is the climate HTTP API. `CLIMATE_DATA_BASE_URL` is the climate data service. Both must resolve from the worker network.

`docker-compose.dev.yml` in the caps-engine repository is a developer stack. It is not this install. Local development is the [Development Guide](/development-guide/engine/).

If the containers are already running, recreate them so they read the new values:

```bash
docker compose -f compose.yml up -d
```

Use both `-f` files when you started with the CHAP overlay.

## Check

Worker logs do not show a connection refused to the DHIS2 host, the CHAP host, or either climate host:

```bash
docker compose -f compose.yml logs worker-1
```

`GET /system/info` can return 200 while `"connected": false` for one of those systems. The `error` string in that object names the failed call. Do not treat a 200 by itself as proof the workers can reach them.

## If this fails

A URL that opens in your browser can still be unreachable from the worker. Use the hostname on the worker's Docker network, or a DNS name that network can resolve. See [Troubleshooting](/deployment-guide/troubleshooting/).
