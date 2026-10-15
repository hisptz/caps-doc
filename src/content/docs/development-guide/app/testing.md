---
title: App tests
description: Run Jest and Playwright the way app CI does.
sidebar:
  label: App tests
  order: 6
---

Trust `.github/workflows/ci.yml` in caps-app. `CONTRIBUTING.md` and `docs/GETTING_STARTED.md` in that repository still say the proxy is hard-coded, that CI skips Jest, and that no Playwright specs exist. The scripts and the workflow do not say that. Follow this page.

## Before you start

`pnpm install` from [Run the app](/development-guide/app/). Playwright needs Docker for its stack.

## Steps

```bash
pnpm typecheck
pnpm lint
pnpm exec d2-app-scripts i18n generate
pnpm test
```

`pnpm typecheck` is `tsc --noEmit` and `tsc -p e2e`. `pnpm lint` is ESLint and `prettier -c .`. `pnpm test` is Jest via `d2-app-scripts`. Generate the i18n catalogs before tests when `src/locales` is missing. CI does this because `src/locales` is gitignored.

Playwright specs live in `e2e/`: `onboarding.spec.ts`, `navigation.spec.ts`, and `pipelines.spec.ts`. The config uses Desktop Chrome and one worker. The disposable stack listens on `http://127.0.0.1:18080`, signs in as `admin` / `district`, and points the Route at `http://api:4000`. The installed app path is `/api/apps/caps-app/index.html`. Those values are the smoke stack. They are not the dev-server proxy.

```bash
pnpm e2e:up
pnpm build
pnpm exec playwright install --with-deps chromium
pnpm e2e
pnpm e2e:down
```

CI runs typecheck, ESLint, Prettier, Jest, and this end-to-end job on Node 24. Do not use the end-to-end stack as your daily dev server. Its CHAP and climate hosts are placeholders.

## Check

`pnpm test` exits 0. `pnpm e2e` exits 0 when you meant to run the smoke stack.

## If this fails

Jest cannot find catalogs when `src/locales` was not generated. Playwright cannot log in when the stack from `pnpm e2e:up` is not healthy. `pnpm e2e:down` removes that stack and its volumes.
