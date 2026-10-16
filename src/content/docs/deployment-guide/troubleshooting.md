---
title: Troubleshooting
description: Match an install symptom to the URL viewer or the service that owns it.
sidebar:
  label: Troubleshooting
  order: 8
---

Find the symptom, then open the page that owns the fix. Pipeline failures and dead letters are in the [User Guide](/user-guide/).

## Before you start

You have the Compose directory from [Deploy the engine](/deployment-guide/engine/) and, if the app is installed, a user who can open **Settings**.

## Symptoms

| Symptom | Look at |
| --- | --- |
| `make up` fails: network `chap` not found | The repository Compose file expects an external network named `chap`. Create it with `docker network create chap`, or use the CHAP overlay and set `CHAP_NETWORK`. The Compose file on the deploy page does not require that network unless you use the overlay. |
| API container restarts at once | `CHAP_BASE_URL` is missing, or `DATABASE_URL` / `RABBITMQ_URL` uses `localhost`. Inside a container, `localhost` is the container itself. Use `postgres` and `rabbitmq`, or the CHAP hostnames. [Deploy the engine](/deployment-guide/engine/). |
| `migrate` restarts | Postgres is not reachable at `DATABASE_URL`. On the CHAP overlay, that variable is `CHAP_DATABASE_URL`. |
| Welcome save returns an error | The user cannot create Routes, or the URL is not `http` or `https`. The form says **Enter a valid HTTP or HTTPS URL.** Other failures show **Could not save route.** [Connect the app](/deployment-guide/app/route/). |
| **Connected**, but lists never load | The Route host is wrong from the DHIS2 server. Confirm code `caps` and a `url` that ends in `/**`. |
| Pipelines run twice | Two scheduler containers. Stop the extra one. Never scale `scheduler`. [Run and upgrade](/deployment-guide/engine/operate/). |
| `docker exec` fails | `api`, `worker`, and `scheduler` are distroless and have no shell. Use `docker compose logs`. |
| Climate or CHAP step fails later | The connection URLs, from the worker network. [CHAP, climate, and DHIS2](/deployment-guide/engine/connections/). |

## Check

The symptom's row no longer matches, and [Check the install](/deployment-guide/check/) passes.

## If this fails

A 200 from `GET /system/info` on your laptop does not prove the Route. Repeat that request from the DHIS2 network.
