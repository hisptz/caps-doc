---
title: Run the app
description: Open the DHIS2 app at localhost:3000 against a proxy and a local engine.
sidebar:
  label: App
  order: 4
---

caps-app is pnpm and the DHIS2 App Platform. Do not use Bun or `yarn start` for this repository.

## Before you start

- Node 22–24. CI uses Node 24. The release workflow uses Node 22.
- pnpm 11, the major version in the `packageManager` field.
- A DHIS2 2.41 or newer instance.
- The engine API from [Run the engine](/development-guide/engine/).

```bash
git clone https://github.com/hisptz/caps-app.git
cd caps-app
```

## Steps

`pnpm start` proxies whatever `DHIS2_PROXY_URL` is set to. It does not read `DHIS2_BASE_URL`. The committed `.env.example` currently sets `DHIS2_PROXY_URL` to `https://play.im.dhis2.org/dev`. Point it at the DHIS2 you are developing against. A DHIS2 on this machine is:

```dotenv title=".env"
DHIS2_PROXY_URL=http://localhost:8080
```

```bash
pnpm install
pnpm start
```

Open:

```text
http://localhost:3000
```

The first load with no Route shows **Welcome to CAPS**. In **CAPS backend base URL**, type the URL the DHIS2 server can call. When DHIS2 and the API are both on the host, that value is:

```text
http://localhost:4000
```

When DHIS2 is in Docker, it is a hostname on that network (`http://api:4000` in the end-to-end stack). The app still appends `/**`. The stored Route JSON is on [Connect the app](/deployment-guide/app/route/).

The app uses `HashRouter`. Do not switch it to `BrowserRouter`. After the route exists:

```text
http://localhost:3000/#/
http://localhost:3000/#/pipelines
http://localhost:3000/#/executions
http://localhost:3000/#/climate-data
http://localhost:3000/#/settings
http://localhost:3000/#/about
```

CAPS HTTP goes through `src/capsApi`, which calls DHIS2 at `routes/caps/run`. Do not add a `fetch` to the engine origin. Forms use React Hook Form, Zod, and `FormProvider`. User-facing strings go through `i18n.t()`.

Folders are [Source architecture](/development-guide/app/architecture/). Jest and Playwright are [App tests](/development-guide/app/testing/).

## Check

The shell loads, **Settings** shows **Connected**, and a pipelines request succeeds. A 200 from port 3000 alone does not prove the Route.

## If this fails

The dev server is up and **Settings** stays **Not configured** when the welcome URL is not reachable from the DHIS2 server. `localhost:4000` is only correct when that server is on the host.
