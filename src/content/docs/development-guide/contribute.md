---
title: Pull requests
description: Match commit style, hooks, and the checks on main.
sidebar:
  label: Pull requests
  order: 8
---

Open the pull request against `main` after the tests for the repository you touched are passing.

## Before you start

The branch exists. [Engine tests](/development-guide/engine/testing/) or [app tests](/development-guide/app/testing/) have been run for the code you changed.

## Shared

- Target `main`. Use [Conventional Commits](https://www.conventionalcommits.org/). `feat` is a minor release, `fix` is a patch, and `feat!` or `BREAKING CHANGE` is a major release. Other types do not release.
- There is no commitlint hook. Releases still depend on the message. Husky and lint-staged format staged files.
- Do not commit `.env` or real credentials. Do not edit `LICENSE`.
- Report security issues through `SECURITY.md` in that repository, not a public issue. Other questions: [info@hisptanzania.org](mailto:info@hisptanzania.org).
- Search existing issues first. Use the bug and feature templates.

```text
fix(worker): ack step results once
feat(api): list dead letters
fix(pipelines): reset form errors on edit
feat(settings): persist route URL
```

| | Engine | App |
| --- | --- | --- |
| Default branch | `main` | `main` |
| Release | semantic-release | semantic-release, zip attached |
| Commit types that release | `feat`, `fix`, breaking | same |
| Hook | Husky, lint-staged | Husky, lint-staged, ESLint `--max-warnings=0` |
| commitlint | none | none |

Engine changes that touch a handler, a queue, or the API need tests. Handler keys stay aligned with app forms. See [Pipeline steps](/development-guide/handlers/).

App changes keep `HashRouter`, send CAPS HTTP only through `src/capsApi`, put strings through `i18n.t()`, and build forms with React Hook Form and Zod.

## This documentation site

Edit `src/content/docs/`. Preview with `pnpm dev` at `http://localhost:4321`. A new folder with an index page directly under that directory becomes a header tab. A folder inside a guide becomes a sidebar group. When a command or label changes in caps-engine or caps-app, update the matching page in the same change.

## Check

The pull request says what changed and how you ran it. CI on the pull request is the definition of done.
