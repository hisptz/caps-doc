# CAPS Docs

Documentation site for [caps-engine](https://github.com/hisptz/caps-engine) and
[caps-app](https://github.com/hisptz/caps-app), built with [Starlight](https://starlight.astro.build).

Pages live in `src/content/docs/` as Markdown (`.md`) or MDX (`.mdx`):

- `user-guide/` — end-user manual, first-run walkthrough, and troubleshooting
- `deployment-guide/` — administrator setup and handover guide
- `development-guide/` — developer starting point

A folder with an index page directly under `src/content/docs/` becomes a header tab. A folder inside a guide becomes a sidebar group. `src/tabs.ts` and `src/sidebar.ts` read those folders, so a new directory shows up without a menu edit.

| Command        | Action                                     |
| :------------- | :----------------------------------------- |
| `pnpm install` | Install dependencies                       |
| `pnpm dev`     | Start the dev server at `localhost:4321`   |
| `pnpm build`   | Build the site to `./dist/`                |
| `pnpm preview` | Preview the build locally                  |
