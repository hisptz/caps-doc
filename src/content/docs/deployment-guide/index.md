---
title: Set up CAPS
description: Install the CAPS engine and the DHIS2 app, then connect them.
sidebar:
  label: Set up CAPS
  order: 0
---

This guide is for a DHIS2 implementer or server administrator who can run Docker, edit an environment file, and install a DHIS2 app. It installs CAPS and hands the system over. Creating a pipeline, scheduling it, and reading an execution are in the [User Guide](/user-guide/). Changing the engine or the app is in the [Development Guide](/development-guide/).

CAPS is two installable pieces:

- **Engine images** on `ghcr.io/hisptz/caps-engine/`: an API, workers, one scheduler, and a one-shot migration job. They use Postgres and RabbitMQ, and the workers call CHAP, a climate service, and DHIS2.
- **The CAPS app**, a DHIS2 app zip, on DHIS2 2.41 or newer.

```mermaid
flowchart LR
  subgraph dhis2 [DHIS2]
    app[CAPS app]
    route[Route code caps]
  end
  subgraph caps [CAPS engine]
    api[API]
    scheduler[Scheduler x1]
    workers[Workers xN]
    pg[(Postgres)]
    mq[[RabbitMQ]]
  end
  chap[CHAP]
  climate[Climate service]
  app --> route --> api
  api --> pg
  api --> mq
  scheduler --> pg
  workers --> mq
  workers --> pg
  workers --> chap
  workers --> climate
  workers --> dhis2
```

The browser talks only to DHIS2. The Route is called by the DHIS2 server. Workers call CHAP, the climate service, and DHIS2. Run exactly one scheduler.

## You are finished when

1. Postgres, RabbitMQ, the migrate job, the API, at least one worker, and exactly one scheduler are running.
2. The API can be reached at the URL the DHIS2 server will call.
3. The CAPS app is installed on DHIS2 2.41 or newer.
4. A DHIS2 Route with code `caps` points at that API, and **Settings** shows **Connected**.
5. Workers can reach DHIS2, CHAP, and the climate service with the URLs configured for them.

## Next

1. [Deploy the engine](/deployment-guide/engine/).
2. [Deploy the app](/deployment-guide/app/), then [connect it](/deployment-guide/app/route/).
3. [Check the install](/deployment-guide/check/).
