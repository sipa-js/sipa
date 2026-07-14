# AGENTS.md

This repo is the **Sipa framework source + its CLI tool** (npm package `sipa`), not a Sipa app.
Do not confuse framework-internal code with the app-scaffolding templates it ships.

## Layout

- `src/sipa/` — framework source. Split into `core/` and `tools/`. This is what gets bundled.
- `bin/cli/` — the `sipa`/`simpartic` CLI (Node, CommonJS). Task modules live in `bin/cli/tasks/`.
- `bin/build.mjs`, `bin/doc.mjs` — release build and doc generation (ESM).
- `lib/templates/project/{desktop,mobile}/` — project scaffolding templates copied into new user apps.
  - `desktop` = default build; `mobile` = OnsenUI build.
- `spec/` — Jasmine specs run via Karma. `spec/_test_data/` holds test views/fixtures.
- `doc/`, `docs/` — contributor docs and generated API docs.

Package manager is **yarn** (`yarn.lock`). Use yarn, not npm, for installs.

## Commands

- Install: `yarn install`
- Test (Chrome headless, single run): `yarn test`
- Test in visible browser for debugging: `yarn test_browser`, or `yarn test_browser_keep` to keep it open
- Build framework bundles: `yarn build` (`node bin/build.mjs`)
- Generate docs: `yarn doc`
- Link local dev CLI globally: `yarn link_dev` / undo with `yarn unlink_dev` (both use sudo)

Tests require **Chrome + chromedriver installed** on the machine.
There is no lint/typecheck/format step — none configured.

## Build behavior (important gotchas)

`yarn build` is not a pure build — it has side effects. Running it:
- **Auto-bumps the patch version** in both `package.json` and `src/sipa/sipa.js` (`Sipa._version`).
- Updates the `date` field in `package.json`.
- Concatenates `src/sipa/*` files (order defined in `bin/build.mjs`) into
  `lib/templates/project/{desktop,mobile}/app/assets/lib/sipa/sipa.js`, then copies vendored deps.

Do **not** run `yarn build` just to check things compile — it will dirty version files and generated bundles. The version lives in two places (`package.json` and `sipa.js`); keep them in sync if editing manually.

## Source conventions

- Framework files use **no ES modules** by design (browser-first, "code you write is code you run").
  Classes are global static classes. Runtime dep loading is wrapped in `//<!-- MODULE -->//` … `//<!-- /MODULE -->//`
  markers — those blocks are **stripped out during build** (they exist only for the Node/spec environment).
  Do not remove or rename these markers.
- To add a new framework source file, register it in the `builds` arrays in `bin/build.mjs`,
  the `srcFiles` list in `spec/support/jasmine-browser.json`, and (if documented) `bin/doc.mjs`.

## Test wiring

- `karma.conf.js` reuses `spec/support/jasmine-browser.json` for `srcFiles`/`specFiles`.
  Specs load framework source directly from `src/` plus prebuilt vendor libs from `lib/templates/.../desktop/`.
- Specs live in `spec/sipa/**/*[Ss]pec.js`; test views are proxied from `spec/_test_data/views/`.
- Jasmine runs with `random: false` — specs may rely on order.

## Docs / contributing

Contributor setup details: `doc/contributors.md`. User-facing docs: https://sipa-js.github.io.
