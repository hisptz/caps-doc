# Deployment guide — design

The Deployment Guide is the administrator path on the CAPS docs site: install the engine, install the DHIS2 app, connect them, and hand the system over. The tab already exists (`Deployment Guide` → `/deployment-guide/`). The landing page is a stub.

## Who it is for

A DHIS2 implementer or server administrator who can run Docker, edit environment files, and install a DHIS2 app. They may never open the caps-engine repository. They are not configuring malaria pipelines (User Guide) and they are not adding a handler (Development Guide).

Write to that person in the second person. One task per section. Name buttons and menu items in **bold**, using the English strings from the app.

## What “set up” means

A deployment is finished when all of the following are true:

1. Postgres, RabbitMQ, the migrate job, the API, at least one worker, and exactly one scheduler are running.
2. The API can be reached at the URL the DHIS2 server will call.
3. The CAPS app is installed on DHIS2 2.41 or newer.
4. A DHIS2 Route with code `caps` points at that API, and the app shows **Connected** on **Settings**.
5. Workers can reach the DHIS2 instance, CHAP, and the climate service with the URLs configured for them.

The guide stops at that handover. Creating a pipeline, scheduling it, and reading an execution belong in the User Guide. Say so at the end of the verification page and link there.

## Three guides, three jobs

| Guide | Question it answers | Keep out of the deployment guide |
| --- | --- | --- |
| User Guide | How do I run and watch pipelines? | Handler field reference, cron recipes, analytics interpretation |
| Deployment Guide | How do I install and connect CAPS? | `bun run dev:*`, Vitest, `caps_test`, writing a handler |
| Development Guide | How do I change CAPS? | Production image pins, backup, Route handover |

The stock `make up` target builds images from source. That is a developer loop. The deployment guide should lead with **published GHCR images and a pinned tag**. Point source builds at the Development Guide. See the materials plan for the gap: the Makefile always passes `--build`.

## How a page should read

Each page has the same spine:

1. **Before you start** — what must already exist, in a short list.
2. **Steps** — the procedure. Commands in fenced blocks. UI labels in bold.
3. **Check** — the one thing the reader should see if it worked.
4. **If this fails** — one or two failures that belong to this page, with a link to Troubleshooting for the rest.

Use Starlight admonitions for rules that are easy to miss:

- Exactly one scheduler. A second replica double-fires pipelines.
- `api`, `worker`, and `scheduler` images are distroless. There is no shell. Use `docker logs`, not `docker exec`.
- The Route URL is called by the **DHIS2 server**, not by the browser. `localhost` on the welcome form is wrong whenever DHIS2 runs in another container or on another host.
- Demo passwords in `.env.example` (`admin` / `district`, `caps` / `caps`) are for local trials. Production pages must say to replace them.

Prefer a diagram over a screenshot when the subject is processes and networks. Prefer a screenshot when the subject is a DHIS2 screen. Terminal transcripts are not screenshots; show the command and the success line only.

## URLs have three viewers

This is the idea the guide has to teach, because most failed installs are a URL that is right for one process and wrong for another.

| Viewer | Example of a correct URL | Wrong lookalike |
| --- | --- | --- |
| CAPS containers talking to Postgres and RabbitMQ | `postgresql://caps:…@postgres:5432/caps`, `amqp://caps:…@rabbitmq:5672` | `localhost` copied from `.env.example` into a container |
| DHIS2 server calling the CAPS API (the Route) | `http://api:4000/**` on a shared Docker network, or `https://caps.example.org/**` through a reverse proxy | `http://localhost:4000` typed on a DHIS2 server that is not the API host |
| Operator browser | DHIS2 app URL only. The browser never calls the CAPS API directly | Opening port 4000 from a laptop and treating that as proof the Route works |

The app stores the Route target with a required `/**` suffix (`toDhis2RouteTargetUrl` in caps-app). The welcome field asks for the base URL **without** that suffix (`https://caps.example.org`). The guide must show both forms so an admin checking Maintenance → Routes is not surprised.

## Shape in the site

Published pages live in `src/content/docs/deployment-guide/`. `src/tabs.ts` autogenerates the Deployment Guide sidebar from that directory. Order pages with `sidebar.order` (the index stays `0`). Suggested filenames are in the structure plan so the URLs stay stable:

`/caps-doc/deployment-guide/<file-name>/`

The site `base` is `/caps-doc` (`astro.config.mjs`). Internal links in Markdown should be root-relative to the docs content (`/deployment-guide/engine/`), not include `/caps-doc`, matching the home page cards.

Frontmatter for every page:

```yaml
---
title: Install the CAPS engine
description: One sentence saying what this page gets done.
sidebar:
  label: Engine
  order: 2
---
```

`description` is the sidebar and social summary. Write it as the outcome, not as “This page explains…”.

## Voice and safety

- Short sections. A page should be finishable in one sitting.
- State the production action first. Mention the local-trial variant after it, in a clearly labeled subsection.
- Do not paste live secrets, GHCR tokens, or a real DHIS2 password. Examples use placeholders (`replace-me`) and say which variable they fill.
- Do not document patient data, tracker event payloads, or a sample prediction file.
- When a behavior is only true of the current Compose file, cite the file in the plan (not in the public page) and re-read it before publishing. Compose and the welcome form drift.

## Diagrams to draw (not screenshots)

Draw these as Mermaid in the page, or as a simple SVG if Mermaid is hard to read on the site. Do not screenshot a whiteboard.

1. **Processes** — DHIS2 (app + Route), API, scheduler (×1), workers (×N), Postgres, RabbitMQ, CHAP, climate service.
2. **First-run request** — browser → DHIS2 → Route `caps` → API. Same picture as Settings → the connection diagram already in the app (DHIS2 instance proxies to CAPS service).
3. **Two install layouts** — CAPS with its own Postgres and RabbitMQ, and CAPS joined to an existing CHAP network (`make up-chap`). One figure, two clusters.

## What the landing page should do

Replace the stub note on `deployment-guide/index.md` with:

- Who the guide is for.
- The two installables (engine images, DHIS2 app zip) and the systems they depend on (DHIS2 2.41+, CHAP, climate service).
- A numbered path through the sidebar.
- A single “you are finished when” checklist matching the five conditions above.

Do not put install commands on the landing page.
