---
title: Deploy the app
description: Install the CAPS zip on DHIS2 2.41 or newer.
sidebar:
  label: App
  order: 5
---

Install the CAPS app on DHIS2. Connecting it to the engine is the next page.

## Before you start

- DHIS2 **2.41 or newer**. The app sets `minDHIS2Version` to 2.41 because the Route API gained non-GET methods in that version.
- A user who can install apps in **App Management**.
- The engine API reachable from the DHIS2 server. You need the base URL the welcome form asks for. The Route body is on [Connect the app](/deployment-guide/app/route/).

The app title is **CAPS**.

## Steps

Two installs, same zip.

**App Management.** Download the zip attached to a [caps-app release](https://github.com/hisptz/caps-app/releases), or build it with the commands below. In DHIS2, open **App Management** and upload the zip. The DHIS2 server does not need Node or pnpm.

**Command line.** On a workstation with Node 22–24 and pnpm 11 (the `packageManager` field in caps-app):

```bash
git clone https://github.com/hisptz/caps-app.git
cd caps-app
pnpm install --frozen-lockfile
pnpm build
pnpm deploy --username replace-me --password replace-me https://dhis2.example.org
```

`pnpm build` writes the zip under `build/bundle/`. `pnpm deploy` uploads that zip. The deploy user needs App Management. `replace-me` is that DHIS2 user's password, not the engine's import account.

`pnpm start` on port 3000 is the local dev server. It is not how you install the app on a server. See [Run the app](/development-guide/app/).

## Check

The DHIS2 apps menu lists **CAPS**.

## If this fails

The upload is rejected on DHIS2 older than 2.41, or when the user cannot manage apps. Continue to [Connect the app](/deployment-guide/app/route/) once the menu entry is there.
