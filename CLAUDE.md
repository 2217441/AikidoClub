# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static marketing site for the IIUM Aikido Club. Astro 7 (fully static, no adapter/SSR) + Tailwind v4, content authored as Markdown/YAML content collections, edited either by hand or through Sveltia CMS, deployed to GitHub Pages by CI.

## Commands

```sh
npm install
npm run dev        # dev server on localhost:4321
npm run build      # static output to ./dist
npm run preview    # serve ./dist
npm run astro -- check   # type/diagnostics check (tsconfig extends astro/tsconfigs/strict)
```

There is no test suite and no linter configured. `npm run build` is the verification step — it type-checks `.astro` frontmatter and validates every content collection entry against its Zod schema, so a bad frontmatter field fails the build.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `master` (Node 22, `npm ci` — Astro requires >=22.12) and publishes `./dist` via `actions/deploy-pages`. Production URL is `https://2217441.github.io/AikidoClub/`.

Netlify was evaluated for CMS auth and **rejected** — a Cloudflare Worker gives Sveltia the same one-click GitHub login without moving hosts. Do not reopen it without reading `docs/CMS-SETUP.md`; any host change means rewriting every `${base}` path.

## The base-path constraint (most common source of bugs)

`astro.config.mjs` sets `site: 'https://2217441.github.io'` and `base: '/AikidoClub/'` — with a **trailing slash**, so `import.meta.env.BASE_URL` ends in `/`. Every internal URL must therefore be built as `` `${base}img/foo.png` `` (no leading slash after `base`), never `/img/foo.png`. This applies to page links, asset `src`, favicons, and the manifest.

Image paths inside content collections are inconsistent by convention: some entries use `/img/...` (leading slash), others `img/...`. Consumers handle both:

- `ActivityCard.astro` and `LatestCard.astro` resolve `base` themselves and guard against double-prefixing (`imageSrc.startsWith(base)`).
- Several pages (`index.astro`, `activities.astro`, `mainboard.astro`) *also* pre-resolve with the `startsWith('/') ? base + slice(1) : raw` idiom before passing down.

When adding a component that takes an image path, replicate the `http` / leading-slash / bare-relative triage in `ActivityCard.astro` rather than assuming a single form.

## Content architecture

`src/content.config.ts` defines six collections; the Zod schemas there are the source of truth for frontmatter. Astro 6 removed the legacy `type: 'content'`/`type: 'data'` API, so every collection declares a `glob` loader — including the YAML data ones. Entries still expose `.data` and, for markdown, `.body` (raw, unrendered):

| Collection | Loader | Location | Notable fields |
|---|---|---|---|
| `news` | `glob` \*\*/\*.md | `src/content/news/` | `pinned`, optional `ctaText`/`ctaLink` |
| `activities` | `glob` \*\*/\*.md | `src/content/activities/` | `featured` — drives the "Latest" carousel on `index.astro` and `activities.astro` |
| `pastActivities` | `glob` \*\*/\*.md | `src/content/pastActivities/` | `year` ("23/24") groups the archive; `order` sorts within a year |
| `mainboard` | `glob` \*\*/\*.yaml | `src/content/mainboard/` | flat object with `tenure` + `order` |
| `faq` | `glob` \*\*/\*.md | `src/content/faq/` | `order`, `defaultOpen` |
| `testimonials` | `glob` \*\*/\*.md | `src/content/testimonials/` | `order` |

Pages call `getCollection(...)` in frontmatter, then sort/group/reshape into plain objects before passing to components — components never touch `astro:content`. Sorting rules live in the pages (e.g. `news.astro` puts `pinned` first then `date.localeCompare` descending; `date` is a free-form string like "January 2026", not a Date).

Adding a field means editing three places: the Zod schema in `src/content.config.ts`, the widget list in `public/admin/config.yml`, and the consuming page.

## Styling

Tailwind v4 via `@tailwindcss/vite` — configuration is **CSS-first** in `src/styles/global.css` using `@theme` (`--color-primary-dark`, `--color-accent-cyan`, `--color-accent-pink`, `--color-bg-dark`, `--color-accent`, `--color-accent-dark`, plus `--breakpoint-sm: 720px` / `--breakpoint-lg: 1080px`). `global.css` is imported once, by `BaseLayout.astro`.

There is no `tailwind.config.mjs` — v4 does not auto-load a JS config and nothing here uses `@config`, so `@theme` in `global.css` is the only place theme values exist.

`global.css` holds *only* the import and `@theme`. Every animation is scoped to the component that uses it, in that component's `<style>` block (`gradbar`/`shorten` in `Nav.astro`, `imageFade` in `ImageFadeCarousel.astro`, `bounce-slow`/`pulse-slow`/`line-shorten` in the pages). Keep new animations local unless a second component genuinely needs them.

## Layout & components

`BaseLayout.astro` owns `<head>`, Google Fonts (Lato), favicons, `Nav`, `Footer`, `ScrollToTop`, and the skip link. Pages pass `title` and `description`; `currentPath` defaults to `Astro.url.pathname` and drives the active nav highlight — nav hrefs are base-prefixed, so any comparison must be against a base-prefixed path too.

Client-side behaviour (mobile menu, carousels, filters) is plain inline `<script>` in the component that needs it. No UI framework integration is installed.

## CMS

Sveltia CMS is served statically from `public/admin/` (`index.html` loads it from unpkg; `config.yml` uses the `github` backend against `2217441/AikidoClub`, branch `master`). Editors commit directly to `master`, which triggers the deploy workflow. `media_folder: public/img`, `public_folder: /AikidoClub/img` — the public folder hard-codes the base path, so it must be updated if `base` ever changes.

The CMS field lists mirror the Zod schemas one-for-one as of the last sync; when you add a schema field, add the matching widget here or CMS-created entries will silently fall back to the schema default (or fail the build, if the field is required).

## Shared values

`src/config/site.ts` exports `registrationUrl`, `contactEmail`, and `training` (schedule/time/venue/campus/map embed). `index.astro`, `news.astro`, `about-us.astro`, and `Footer.astro` import from it — edit there, not in the markup. Vite does not resolve `.yaml` imports, which is why this is a TS module rather than YAML.

**Social links stay duplicated** between `Footer.astro` and `news.astro`, because each embeds inline SVG path data alongside the URL.

The retired `src/config/site.yaml` recorded `iiumaikidoclub@gmail.com`; that was a transposition. The live address is `aikidoclubiium@gmail.com`, corroborated by the club's linktr.ee handle, and it now lives in `site.ts` as `contactEmail`.
