---
title: Connect the app
description: Save Route caps and see Connected on Settings.
sidebar:
  label: Connect the app
  order: 6
---

The first time someone opens CAPS, the app asks for the engine URL and stores a DHIS2 Route with code `caps`. The browser never calls the engine. It calls DHIS2 at `routes/caps/run`. The DHIS2 server calls the URL you save.

The same three viewers as on [Deploy the engine](/deployment-guide/engine/) apply here. A URL that opens on your laptop is the wrong Route target when DHIS2 runs in another container or on another host. `localhost` on the welcome form is wrong in that case.

## Before you start

- The signed-in user can create Routes.
- The API URL is reachable from the DHIS2 server.
- The [CAPS app is installed](/deployment-guide/app/).

## Steps

Open **CAPS**. With no Route yet, the screen is:

- Heading **Welcome to CAPS**.
- Field **CAPS backend base URL**. No trailing slash, and no `/**`. Placeholder `https://caps.example.org`. The help text reads: “Full URL of the CAPS service (scheme and host, no trailing slash). Example: https://caps.example.org”.
- Button **Save and continue**.

Type the base URL the DHIS2 server can call:

```text title="CAPS backend base URL"
https://caps.example.org
```

The app strips a trailing slash and appends `/**`. DHIS2 stores:

```json title="Route caps"
{
  "code": "caps",
  "name": "CAPS API",
  "description": "Proxy target for the CAPS monitoring API",
  "url": "https://caps.example.org/**",
  "headers": {},
  "disabled": false
}
```

An administrator who creates the route under Maintenance copies those fields. The welcome form still asks for the base URL without `/**`.

Success is the alert **CAPS route saved.** A URL that is not `http` or `https` fails validation with **Enter a valid HTTP or HTTPS URL.** Any other save failure shows **Could not save route.**

To change it later, open **Settings** → **Backend connection** → **Save changes**. The tag on that card is **Connected** or **Not configured**. The card text is “The base URL of the CAPS API this app forwards requests to, via a DHIS2 route.” When a route exists, the card also shows **DHIS2 instance**, “proxies to”, and **CAPS service**.

## Check

**Settings** shows **Connected**.

From a machine that can call DHIS2:

```bash
curl -fsS -u "replace-me:replace-me" \
  "https://dhis2.example.org/api/routes?filter=code:eq:caps&fields=code,name,url,disabled"
```

Pass: one route, `code` is `caps`, `url` ends in `/**`, and `disabled` is false.

## If this fails

**Connected**, while pipelines and executions never load, means the Route host is wrong from the DHIS2 server. Confirm code `caps` and the `/**` suffix. A URL that works in your browser and fails from the server is the usual case. See [Troubleshooting](/deployment-guide/troubleshooting/).
