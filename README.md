# CAPS Docs

Documentation site for [caps-engine](https://github.com/hisptz/caps-engine) and
[caps-app](https://github.com/hisptz/caps-app), built with [Starlight](https://starlight.astro.build).

Pages live in `src/content/docs/` as Markdown (`.md`) or MDX (`.mdx`):

- `user-guide/` — end-user manual, first-run walkthrough, and troubleshooting
- `deployment-guide/` — administrator setup and handover guide
- `development-guide/` — developer starting point

`src/tabs.ts` defines the header tabs. `src/sidebar.ts` builds each guide sidebar from that guide’s folder, including new directories.

| Command        | Action                                     |
| :------------- | :----------------------------------------- |
| `pnpm install` | Install dependencies                       |
| `pnpm dev`     | Start the dev server at `localhost:4321`   |
| `pnpm build`   | Build the site to `./dist/`                |
| `pnpm preview` | Preview the build locally                  |
