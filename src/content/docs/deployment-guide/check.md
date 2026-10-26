---
title: Check the install
description: Prove the proxy, the scheduler count, and a trivial API read before handing CAPS over.
sidebar:
  label: Check the install
  order: 7
---

Run this after [the engine](/deployment-guide/engine/) and [the app](/deployment-guide/app/route/) are both in place.

## Before you start

The Compose project is the one you started on the engine page, and you can open **CAPS** in DHIS2.

## Steps

| Check | Pass |
| --- | --- |
| `docker compose ps` | `migrate` exited 0; `api`, both workers, and one `scheduler` are running |
| API from the DHIS2 network | `GET /system/info` returns 200 |
| App | **Settings** tag **Connected** |
| Menu | **Dashboard**, **Pipelines**, **Executions**, **Climate data**, **Settings**, and **About** render without a route error |
| About | **Connected systems** loads |

`GET /system/info` does not use an authentication header. The distroless API image has no `wget` and no shell, so do not use `docker exec` or `docker compose exec api`. Call it from the DHIS2 server, or from another container on the API network:

```bash
curl -fsS http://api:4000/system/info
```

A 200 from the operator laptop only proves the published port. The Route is called by the DHIS2 server.

A passing body looks like this. The `info` objects are each system's own payload and are omitted here:

```json
{
  "caps": {
    "version": "3.0.0",
    "chap": { "connected": true, "info": {} },
    "dhis": { "connected": true, "info": {} },
    "climateApi": { "connected": true, "info": {} }
  }
}
```

HTTP 200 means the API process answered. A system can still be `"connected": false` with an `error` string. Fix that URL on [CHAP, climate, and DHIS2](/deployment-guide/engine/connections/) before you treat the install as finished.

On **About**, the section heading is **Connected systems**. The cards are **CAPS API**, **CHAP**, **DHIS2**, and **Open Climate Service**. A source-instance card can say **Route is disabled**.

## Check

Every row in the table passes, and **Settings** shows **Connected**.

Creating the first pipeline starts in [Before a pipeline](/user-guide/prepare/). Do not create one to prove the install.

## If this fails

[Troubleshooting](/deployment-guide/troubleshooting/) maps the usual symptoms to the page that owns the fix.
