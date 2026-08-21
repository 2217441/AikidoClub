# Site Restructure and Adab Collection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the club site so nothing on it can go visibly stale, promote the content that converts prospective members, and add the Adab content collection with build-enforced citation discipline.

**Architecture:** Astro static site, no adapter. Content lives in `src/content/*` as markdown/YAML validated by Zod schemas in `src/content.config.ts`; pages query it with `getCollection()`. Pure logic goes in `src/lib/*.ts` so it can be unit-tested with Node's built-in test runner. A standalone assertion script guards citation discipline in CI, modelled on Al-Mizan's `assert-schema-counts.py`.

**Tech Stack:** Astro 7.2.4, Tailwind v4 (CSS-first `@theme`), Zod (re-exported by `astro:content`), Node 22 built-in test runner (`node --test`, native TypeScript — no dependency required), GitHub Actions to GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-21-aikido-futuwwah-design.md`

## Global Constraints

- **Node >= 22.12** — required by Astro 7. CI pins Node 22.
- **Base path is `/AikidoClub/` with a trailing slash.** Every internal URL must be built as `` `${base}path` `` using `const base = import.meta.env.BASE_URL`. A leading slash after `base` produces `//` and breaks the link. This is the single most common bug in this repo.
- **`npm run build` is the primary gate.** It type-checks `.astro` frontmatter and validates every content entry against its Zod schema.
- **`npm test` runs `node --test`** over `src/**/*.test.ts` and `scripts/**/*.test.ts`.
- **Never author Qur'an or hadith text from memory.** Citations are fetched from canonical sources (the `quran` MCP server) or left `pending`. A `pending` or `unverified` citation on a published concept is a build failure by design.
- **Every practice-to-virtue mapping is Tier 2**: `attribution.issued_by` and `attribution.epistemic_status` are required fields.
- **Pushing to `master` deploys to production.** There is no staging step.
- **Commit style:** conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `build:`), matching existing history.

## Decisions this plan locks in

The spec left two points open. Resolved here so implementers do not have to guess:

1. **"Club" page** = `src/pages/club.astro`, created by renaming `mainboard.astro` and moving the past-activities archive into it. `activities.astro` is retired because its "Latest Activities" section duplicates the identical block already on `index.astro`; `/activities/` becomes a redirect stub so existing links and QR codes keep working.
2. **News shelf life = 4 months**, defined once as `NEWS_SHELF_LIFE_MONTHS` in `src/lib/news.ts`. An IIUM semester runs roughly four months, so an announcement outlives its own semester but never survives into the next one.

## File Structure

| File | Responsibility |
| :--- | :--- |
| `src/lib/news.ts` | Freshness/expiry logic and date formatting. Pure, no Astro imports, unit-tested. |
| `src/lib/news.test.ts` | Tests for the above. |
| `src/content.config.ts` | Zod schemas — extended with `concepts`; news `date` becomes a real date. |
| `src/pages/news.astro` | Renders only fresh news; renders an empty state otherwise. |
| `src/pages/train.astro` | Renamed from `about-us.astro`. Schedule, venue, map, full FAQ. |
| `src/pages/club.astro` | Renamed from `mainboard.astro`, absorbs the past-activities archive. |
| `src/pages/activities.astro` | Reduced to a redirect stub pointing at `/club/`. |
| `src/pages/adab.astro` | Renders the `concepts` collection. |
| `src/components/Nav.astro` | Nav items; hides News when nothing is fresh. |
| `src/components/FaqList.astro` | Renders the FAQ, optionally limited to N entries. |
| `src/components/ConceptCard.astro` | Renders one concept with its attribution notice. |
| `scripts/assert-citations.ts` | Fails the build if a published concept cites an unverified source. |
| `scripts/assert-citations.test.ts` | Tests for the above. |
| `memory.md` | Decisions and their reasoning. `CLAUDE.md` says what; this says why. |

---

### Task 1: News dates become real dates

The `news.date` field is currently `z.string()` holding values like `"January 2026"`, while `public/admin/config.yml` already declares a `datetime` widget for it — so the CMS writes ISO timestamps that the schema silently accepts in a different format from the hand-written files. Expiry cannot be computed from a free-form string, so this is the foundation.

**Files:**
- Modify: `src/content.config.ts` (news schema)
- Modify: `src/content/news/2025-10-welcome-new-members.md`
- Modify: `src/content/news/2025-11-kyoudou-kenshuu.md`
- Modify: `src/content/news/2025-12-end-of-semester-gathering.md`
- Modify: `src/content/news/2026-01-semester-2-registration.md`
- Modify: `src/pages/news.astro` (sorting)

**Interfaces:**
- Consumes: nothing.
- Produces: `news` entries whose `data.date` is a JavaScript `Date`.

- [ ] **Step 1: Verify the current build passes before changing anything**

Run: `npm run build`
Expected: `6 page(s) built`, no errors. If this fails, stop — the tree is not clean.

- [ ] **Step 2: Change the news schema to coerce dates**

In `src/content.config.ts`, inside the `news` collection schema, replace:

```ts
        date: z.string(),
```

with:

```ts
        date: z.coerce.date(),
```

- [ ] **Step 3: Run the build to verify it now fails**

Run: `npm run build`
Expected: FAIL. The error names `src/content/news/...` and reports an invalid date, because `"October 2025"` is not parseable. This confirms the schema is actually enforcing.

- [ ] **Step 4: Migrate the four news files to ISO dates**

Set the `date` frontmatter field in each file to the first of its month, matching the date already encoded in each filename. Write them unquoted, so the whole line becomes e.g. `date: 2025-10-01`.

| File | New value |
| :--- | :--- |
| `2025-10-welcome-new-members.md` | `date: 2025-10-01` |
| `2025-11-kyoudou-kenshuu.md` | `date: 2025-11-01` |
| `2025-12-end-of-semester-gathering.md` | `date: 2025-12-01` |
| `2026-01-semester-2-registration.md` | `date: 2026-01-01` |

- [ ] **Step 5: Fix the sort, which currently compares strings**

In `src/pages/news.astro`, replace:

```ts
    // Then sort by date (assuming format like "January 2026")
    return b.data.date.localeCompare(a.data.date);
```

with:

```ts
    // Newest first
    return b.data.date.getTime() - a.data.date.getTime();
```

- [ ] **Step 6: Run the build to verify it passes**

Run: `npm run build`
Expected: PASS, `6 page(s) built`.

- [ ] **Step 7: Note the temporary display regression**

Run: `grep -o 'uppercase tracking-wide">[^<]*' dist/news/index.html | head -4`
Expected: dates now render as full `Date` strings such as `Wed Oct 01 2025 ...`, because the template still prints `{item.date}` directly. This is expected and is fixed in Task 2. Do not fix it here.

- [ ] **Step 8: Commit**

```bash
git add src/content.config.ts src/content/news src/pages/news.astro
git commit -m "fix: Store news dates as real dates rather than free-form strings

The schema accepted any string while admin/config.yml already wrote ISO
timestamps, so hand-written and CMS-written entries used different
formats and neither could be compared. Sorting compared strings, which
ordered 'January 2026' before 'October 2025' alphabetically."
```

---

### Task 2: Freshness logic, unit-tested

**Files:**
- Create: `src/lib/news.ts`
- Create: `src/lib/news.test.ts`
- Modify: `package.json` (add `test` script)

**Interfaces:**
- Consumes: `news` entries with `Date` values from Task 1.
- Produces:
  - `NEWS_SHELF_LIFE_MONTHS: number`
  - `isFresh(date: Date, now: Date, shelfLifeMonths?: number): boolean`
  - `formatNewsDate(date: Date): string` — returns e.g. `"October 2025"`

- [ ] **Step 1: Add the test script to `package.json`**

In the `scripts` block, add:

```json
    "test": "node --test \"src/**/*.test.ts\" \"scripts/**/*.test.ts\"",
```

Node 22 strips TypeScript types natively, so no test framework or transpiler is needed.

- [ ] **Step 2: Write the failing test**

Create `src/lib/news.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isFresh, formatNewsDate, NEWS_SHELF_LIFE_MONTHS } from './news.ts';

const NOW = new Date('2026-08-21T00:00:00Z');

test('shelf life is four months', () => {
  assert.equal(NEWS_SHELF_LIFE_MONTHS, 4);
});

test('an item from this month is fresh', () => {
  assert.equal(isFresh(new Date('2026-08-01'), NOW), true);
});

test('an item just inside the shelf life is fresh', () => {
  assert.equal(isFresh(new Date('2026-04-22'), NOW), true);
});

test('an item just outside the shelf life is stale', () => {
  assert.equal(isFresh(new Date('2026-04-20'), NOW), false);
});

test('the expired semester-2 announcement is stale', () => {
  assert.equal(isFresh(new Date('2026-01-01'), NOW), false);
});

test('a future-dated item is fresh', () => {
  assert.equal(isFresh(new Date('2026-09-28'), NOW), true);
});

test('shelf life is overridable', () => {
  assert.equal(isFresh(new Date('2026-01-01'), NOW, 12), true);
});

test('dates format as month and year', () => {
  assert.equal(formatNewsDate(new Date('2025-10-01T00:00:00Z')), 'October 2025');
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot find module `./news.ts`.

- [ ] **Step 4: Write the implementation**

Create `src/lib/news.ts`:

```ts
/**
 * News expiry. An IIUM semester runs roughly four months, so an
 * announcement outlives its own semester but never survives into the next
 * one. Stale news is worse than no news: it makes an unmaintained club look
 * dead rather than quiet.
 */
export const NEWS_SHELF_LIFE_MONTHS = 4;

/** True if `date` is within the shelf life of `now`, or in the future. */
export function isFresh(
  date: Date,
  now: Date,
  shelfLifeMonths: number = NEWS_SHELF_LIFE_MONTHS,
): boolean {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - shelfLifeMonths);
  return date.getTime() >= cutoff.getTime();
}

/** "October 2025". UTC, so the build is not affected by the runner's zone. */
export function formatNewsDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: `# pass 8`, `# fail 0`.

- [ ] **Step 6: Commit**

```bash
git add package.json src/lib/news.ts src/lib/news.test.ts
git commit -m "feat: Add news freshness logic with unit tests

Node 22 runs TypeScript test files natively, so this adds a real test
cycle with no new dependency."
```

---

### Task 3: Wire expiry into the page, the nav, and the schedule

Expiry is computed at build time, so without a periodic rebuild an expired post lingers until someone happens to push. This task adds a weekly scheduled build so the mechanism works unattended — which is the whole point, given maintenance is known to be sporadic.

**Files:**
- Modify: `src/pages/news.astro`
- Modify: `src/components/Nav.astro`
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `isFresh`, `formatNewsDate` from `src/lib/news.ts`.
- Produces: a `News` nav entry that is absent when nothing is fresh.

- [ ] **Step 1: Filter and format in `news.astro`**

In `src/pages/news.astro`, add to the frontmatter imports:

```ts
import { isFresh, formatNewsDate } from '../lib/news.ts';
```

Immediately after `const newsCollection = await getCollection('news');`, add:

```ts
const now = new Date();
```

Change the start of the chain from:

```ts
const newsItems = newsCollection
  .sort((a, b) => {
```

to:

```ts
const newsItems = newsCollection
  .filter(item => isFresh(item.data.date, now))
  .sort((a, b) => {
```

In the `.map()` that follows, replace `date: item.data.date,` with:

```ts
    date: formatNewsDate(item.data.date),
```

- [ ] **Step 2: Add an empty state**

In `src/pages/news.astro`, locate the element that wraps `{newsItems.map(...)}`. Wrap that whole expression so it only renders when there is something to show, and add a sibling empty state. The result should read:

```astro
{newsItems.length === 0 && (
  <p class="text-center text-gray-500 italic py-12">
    No announcements right now. Training runs as usual — see
    <a href={`${base}train`} class="text-accent-pink underline">Train</a>
    for the schedule.
  </p>
)}

{newsItems.length > 0 && (
  <div class="grid gap-6">
    {/* the existing newsItems.map(...) expression goes here, unchanged */}
  </div>
)}
```

Note: `base` is already defined in this file's frontmatter.

- [ ] **Step 3: Run the build and confirm the expired post is gone**

Run: `npm run build`
Then: `grep -c "Semester 2 Registration" dist/news/index.html || echo "0 - correctly expired"`
Expected: `0 - correctly expired`. That post is dated January 2026, past the four-month shelf life.

- [ ] **Step 4: Hide the News nav item when nothing is fresh**

In `src/components/Nav.astro`, add to the frontmatter:

```ts
import { getCollection } from 'astro:content';
import { isFresh } from '../lib/news.ts';

const now = new Date();
const freshNews = (await getCollection('news')).filter(item => isFresh(item.data.date, now));
```

Replace the `navItems` array with:

```ts
const navItems = [
  { href: base, label: 'Home' },
  { href: `${base}train`, label: 'Train' },
  { href: `${base}adab`, label: 'Adab' },
  { href: `${base}club`, label: 'Club' },
  ...(freshNews.length > 0 ? [{ href: `${base}news`, label: 'News' }] : []),
];
```

`train`, `adab` and `club` do not exist yet — `train` and `club` arrive in Task 4, `adab` in Task 8. The build still passes, because Astro does not validate that internal `href` strings resolve. The links are dead until those tasks land.

- [ ] **Step 5: Verify the nav no longer offers News**

Run: `npm run build && grep -c ">News<" dist/index.html || echo "0 - nav item hidden"`
Expected: `0 - nav item hidden`.

- [ ] **Step 6: Add a weekly scheduled rebuild**

In `.github/workflows/deploy.yml`, change:

```yaml
on:
  push:
    branches: [master]
  workflow_dispatch:
```

to:

```yaml
on:
  push:
    branches: [master]
  workflow_dispatch:
  schedule:
    # Expiry is computed at build time, so rebuild weekly to retire stale
    # news without needing anyone to push. Mondays 00:00 UTC.
    - cron: '0 0 * * 1'
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/news.astro src/components/Nav.astro .github/workflows/deploy.yml
git commit -m "feat: Expire stale news at build time and hide the empty section

An unmaintained news section does not go quiet, it goes visibly
abandoned, which signals a dead club more loudly than having none.
Items past their shelf life stop rendering and the nav item disappears
when nothing is current. A weekly scheduled build applies expiry
without anyone needing to push."
```

---

### Task 4: Route restructure — Train, Club, and an Activities redirect

**Files:**
- Rename: `src/pages/about-us.astro` to `src/pages/train.astro`
- Rename: `src/pages/mainboard.astro` to `src/pages/club.astro`
- Modify: `src/pages/club.astro` (absorb the archive, reframe as history)
- Replace: `src/pages/activities.astro` (redirect stub)
- Create: `src/content/mainboard/2526.yaml` (placeholder)

**Interfaces:**
- Consumes: the nav hrefs defined in Task 3.
- Produces: routes `/train/`, `/club/`, and `/activities/` as a redirect.

- [ ] **Step 1: Rename the two pages with git so history follows**

```bash
git mv src/pages/about-us.astro src/pages/train.astro
git mv src/pages/mainboard.astro src/pages/club.astro
```

- [ ] **Step 2: Update their titles**

In `src/pages/train.astro`, replace `title="About Us | IIUM Aikido Club"` with `title="Train | IIUM Aikido Club"`.

In `src/pages/club.astro`, replace `title="Mainboard | IIUM Aikido Club"` with `title="Club | IIUM Aikido Club"`.

- [ ] **Step 3: Find and fix every internal link to the old routes**

Run: `grep -rn "about-us\|mainboard" src/ public/admin/config.yml`

Update every `${base}about-us` to `${base}train` and every `${base}mainboard` to `${base}club`. Leave `src/content/mainboard/` paths and the CMS `folder: src/content/mainboard` alone — the collection name is unchanged, only the page route moved.

- [ ] **Step 4: Move the past-activities archive into `club.astro`**

From `src/pages/activities.astro`, copy into `src/pages/club.astro`:

- the frontmatter block from `const pastActivitiesCollection = await getCollection('pastActivities');` through `const pastActivities = pastActivitiesByYear;`
- the `ActivityCard` and `Carousel` imports that block's markup needs
- the `<section id="past-activities">` element and everything inside it, placed below the existing org-chart section
- the year-filter `<script>` at the bottom of the file

Then change the archive heading so its age reads as intent rather than neglect:

```astro
<h2 class="text-primary-dark text-xl sm:text-2xl font-bold italic whitespace-nowrap">
  Club History
</h2>
```

- [ ] **Step 5: Replace `activities.astro` with a redirect stub**

Overwrite `src/pages/activities.astro` entirely with:

```astro
---
// The activities archive moved to /club/. This stub keeps old links,
// bookmarks and any printed QR codes working. GitHub Pages serves static
// files only, so this is a meta refresh rather than a 301.
const base = import.meta.env.BASE_URL;
const target = `${base}club`;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content={`0; url=${target}`} />
    <link rel="canonical" href={target} />
    <meta name="robots" content="noindex" />
    <title>Moved to Club | IIUM Aikido Club</title>
  </head>
  <body>
    <p>This page has moved. <a href={target}>Continue to Club</a>.</p>
  </body>
</html>
```

- [ ] **Step 6: Add the mainboard placeholder**

Create `src/content/mainboard/2526.yaml`:

```yaml
title: "Aikido Club Mainboard Tenure 25/26"
image: "/img/event-images/default-img.png"
alt: "Organisational chart for tenure 2025/2026 - pending"
tenure: "25/26"
order: 0
```

`order: 0` sorts it above the existing charts, which use 1 to 3. Replace the image and alt text once the club supplies the real chart.

- [ ] **Step 7: Run the build**

Run: `npm run build`
Expected: PASS, `6 page(s) built` — `/`, `/404`, `/train/`, `/club/`, `/activities/` (stub), `/news/`.

- [ ] **Step 8: Verify the routes and that no dead internal links remain**

```bash
ls dist/train/index.html dist/club/index.html dist/activities/index.html
grep -o 'href="/AikidoClub/[a-z-]*"' dist/index.html | sort -u
grep -l "about-us\|/mainboard" dist/index.html dist/*/index.html || echo "no stale routes"
```
Expected: all three files exist; the hrefs list shows `train` and `club`; `no stale routes`.

- [ ] **Step 9: Commit**

```bash
git add -A src/pages src/content/mainboard
git commit -m "refactor: Restructure routes to Home/Train/Adab/Club

About Us becomes Train, because the old name described the club while
the new one describes what the reader wants. Mainboard becomes Club and
absorbs the past-activities archive, reframed as Club History so its age
reads as intent. activities.astro is retired - its Latest Activities
section duplicated the identical block on the home page - and left as a
redirect stub so existing links and printed QR codes keep working.

Adds a placeholder mainboard entry for tenure 25/26 pending the real
chart from the committee."
```

---

### Task 5: Promote the FAQ to the home page

The six FAQ entries answer exactly the hesitations of someone who just received a WhatsApp link — prior experience, what to wear, safety, trying a class, cost, suitability for women. They currently sit at the bottom of a secondary page.

**Files:**
- Create: `src/components/FaqList.astro`
- Modify: `src/pages/train.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: the `faq` collection.
- Produces: `FaqList` with props `{ limit?: number }`.

- [ ] **Step 1: Extract the FAQ markup into a component**

Create `src/components/FaqList.astro`:

```astro
---
import { getCollection } from 'astro:content';

interface Props {
  /** Render only the first N questions. Omit for all of them. */
  limit?: number;
}

const { limit } = Astro.props;

const faqItems = (await getCollection('faq'))
  .sort((a, b) => a.data.order - b.data.order)
  .slice(0, limit ?? Infinity)
  .map(item => ({
    question: item.data.question,
    answer: item.body,
    open: item.data.defaultOpen,
  }));
---

<div class="max-w-3xl mx-auto flex flex-col gap-4">
  {faqItems.map((item) => (
    <details
      open={item.open}
      class="faq-item group bg-white rounded-lg border-l-4 border-l-accent-pink overflow-hidden shadow-sm"
    >
      <summary class="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-800">
        {item.question}
        <span class="faq-icon text-accent-pink text-2xl font-light flex-shrink-0 transition-transform">+</span>
      </summary>
      <p class="px-5 pb-5 text-gray-600 leading-relaxed">{item.answer}</p>
    </details>
  ))}
</div>

<style>
  details[open] .faq-icon {
    transform: rotate(45deg);
  }
</style>
```

- [ ] **Step 2: Use the component in `train.astro`**

In `src/pages/train.astro`, delete the `faqCollection`/`faqItems` frontmatter block — it now lives in the component — and add to the imports:

```ts
import FaqList from '../components/FaqList.astro';
```

Inside `<section id="faq">`, replace the block that maps over `faqItems` with:

```astro
<FaqList />
```

- [ ] **Step 3: Verify the Train page is unchanged**

Run: `npm run build`
Then: `grep -c "faq-item" dist/train/index.html`
Expected: `6` — all six questions still render.

- [ ] **Step 4: Add the top three questions to the home page**

In `src/pages/index.astro`, add to the imports:

```ts
import FaqList from '../components/FaqList.astro';
```

Insert this section immediately before the final call-to-action section:

```astro
<section id="common-questions" class="bg-[#f5f5f5] py-12 px-4 sm:px-8">
  <div class="text-center mb-8">
    <h2 class="text-primary-dark text-2xl sm:text-3xl font-bold mb-4">
      Thinking of Joining?
    </h2>
    <div class="deco-line mx-auto"></div>
  </div>

  <FaqList limit={3} />

  <p class="text-center mt-8">
    <a href={`${base}train`} class="text-accent-pink font-semibold hover:text-red-500 transition-colors">
      More questions, and how to find us
    </a>
  </p>
</section>
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Then: `grep -c "faq-item" dist/index.html`
Expected: `3`.

- [ ] **Step 6: Commit**

```bash
git add src/components/FaqList.astro src/pages/train.astro src/pages/index.astro
git commit -m "feat: Promote the FAQ to the home page

The six FAQ entries answer precisely the hesitations of someone who has
just been sent a link - prior experience, safety, cost, whether they
will be the only beginner. They were buried at the bottom of a secondary
page while News held top-level navigation."
```

---

### Task 6: The concepts collection

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content/concepts/tawadu.md` (a draft seed, unpublished)

**Interfaces:**
- Consumes: nothing.
- Produces: a `concepts` collection whose entries expose `data.name_en`, `data.name_ar`, `data.description`, `data.practice[]`, `data.grounding[]`, `data.attribution`, `data.order`, `data.draft`.

- [ ] **Step 1: Add the schema**

In `src/content.config.ts`, add before the `export const collections` block:

```ts
/**
 * Futuwwah-to-practice material. Frontmatter is a deliberate superset of
 * what Al-Mizan's ingest_wiki_concepts.py reads (name_en, name_ar,
 * transliteration, description), so these files are ingestible into
 * SurrealDB/TypeDB later with no transformation written.
 *
 * Every practice-to-virtue mapping is an interpretive act - Tier 2 in
 * Al-Mizan's model - so attribution is required, never optional.
 *
 * Intentionally absent from public/admin/config.yml: author-owned, not
 * club-editable. A CMS widget here would invite an unattributed mapping.
 */
const concepts = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/concepts' }),
    schema: z.object({
        name_en: z.string(),
        name_ar: z.string().optional(),
        transliteration: z.string().optional(),
        description: z.string(),

        practice: z.array(z.object({
            art: z.string(),
            element: z.string(),
            claim: z.string(),
        })).default([]),

        grounding: z.array(z.object({
            type: z.enum(['quran', 'hadith', 'scholar']),
            ref: z.string(),
            // 'verified' requires a canonical fetch on record. Anything else
            // blocks publication - see scripts/assert-citations.ts.
            status: z.enum(['verified', 'pending', 'unverified']),
            via: z.string().optional(),
        })).default([]),

        attribution: z.object({
            issued_by: z.string(),
            epistemic_status: z.enum(['documented', 'interpretive']),
        }),

        order: z.number().default(0),
        draft: z.boolean().default(true),
    }),
});
```

Then add `concepts,` to the `export const collections` object.

- [ ] **Step 2: Create the seed file**

Create `src/content/concepts/tawadu.md`:

```markdown
---
name_en: "Tawadu"
transliteration: "tawaduʿ"
description: "Lowering oneself; the disposition that receives rather than resists."
practice:
  - art: aikido
    element: "ukemi"
    claim: "Receiving a throw trains the body in yielding without defeat."
grounding:
  - type: scholar
    ref: "al-Sulami, Kitab al-Futuwwa"
    status: unverified
attribution:
  issued_by: "Ammar Footen"
  epistemic_status: interpretive
order: 1
draft: true
---

Draft. The body text is written last, after the grounding is verified.
```

Add the Arabic `name_ar` when writing the real entry — it is omitted here so the template carries no unverified transliteration.

This entry is `draft: true` and its only citation is `unverified`. It is a template and must not publish; Task 7's script proves it cannot.

- [ ] **Step 3: Verify the schema accepts it and rejects a bad entry**

Run: `npm run build`
Expected: PASS.

Now prove attribution is genuinely enforced. Temporarily delete the two lines under `attribution:` from `tawadu.md` and run `npm run build`.
Expected: FAIL, naming `attribution` as required on the `concepts` entry.
Restore the lines and rebuild to confirm PASS.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/content/concepts
git commit -m "feat: Add the concepts collection with required attribution

Every practice-to-virtue mapping is ijtihad, not revelation, so
attribution.issued_by and epistemic_status are required fields and a
missing one fails the build. Frontmatter is a superset of what
Al-Mizan's ETL reads, so these files ingest later without transformation."
```

---

### Task 7: The citation assertion script

Modelled on Al-Mizan's `assert-schema-counts.py`. Its lesson is that drift between what a document claims and what is true is recurrent and needs a machine to catch it — three separate hand audits got it wrong. The same failure mode applies to citations, with worse consequences.

**Files:**
- Create: `scripts/assert-citations.ts`
- Create: `scripts/assert-citations.test.ts`
- Modify: `package.json`
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `src/content/concepts/*.md`.
- Produces:
  - `findViolations(entries: ConceptFile[]): Violation[]`
  - `parseConcept(file: string, source: string): ConceptFile`
  - CLI exit status 0 (clean) or 1 (violations found)

- [ ] **Step 1: Write the failing test**

Create `scripts/assert-citations.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findViolations, parseConcept } from './assert-citations.ts';

const published = {
  file: 'a.md',
  draft: false,
  grounding: [{ type: 'quran', ref: '2:255', status: 'verified' }],
};

test('a published concept with verified citations is clean', () => {
  assert.deepEqual(findViolations([published]), []);
});

test('a published concept with a pending citation is a violation', () => {
  const bad = { ...published, grounding: [{ type: 'quran', ref: 'TBD', status: 'pending' }] };
  const violations = findViolations([bad]);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].file, 'a.md');
  assert.match(violations[0].message, /pending/);
});

test('a published concept with an unverified citation is a violation', () => {
  const bad = { ...published, grounding: [{ type: 'scholar', ref: 'x', status: 'unverified' }] };
  assert.equal(findViolations([bad]).length, 1);
});

test('a draft may cite anything', () => {
  const draft = { ...published, draft: true, grounding: [{ type: 'quran', ref: 'TBD', status: 'pending' }] };
  assert.deepEqual(findViolations([draft]), []);
});

test('a published concept with no citations at all is a violation', () => {
  const bare = { ...published, grounding: [] };
  const violations = findViolations([bare]);
  assert.equal(violations.length, 1);
  assert.match(violations[0].message, /no grounding/);
});

test('every bad citation in one file is reported', () => {
  const bad = {
    ...published,
    grounding: [
      { type: 'quran', ref: 'a', status: 'pending' },
      { type: 'hadith', ref: 'b', status: 'unverified' },
    ],
  };
  assert.equal(findViolations([bad]).length, 2);
});

test('parseConcept reads draft and grounding from frontmatter', () => {
  const source = [
    '---',
    'name_en: "X"',
    'description: "d"',
    'grounding:',
    '  - type: quran',
    '    ref: "2:255"',
    '    status: verified',
    'draft: false',
    '---',
    '',
    'body',
  ].join('\n');
  const parsed = parseConcept('x.md', source);
  assert.equal(parsed.draft, false);
  assert.equal(parsed.grounding.length, 1);
  assert.equal(parsed.grounding[0].status, 'verified');
  assert.equal(parsed.grounding[0].ref, '2:255');
});

test('parseConcept treats a missing draft field as draft', () => {
  const source = '---\nname_en: "X"\ndescription: "d"\n---\n\nbody';
  assert.equal(parseConcept('x.md', source).draft, true);
});
```

Note the last test: a missing `draft` field means draft. The Zod schema defaults `draft` to `true`, and this script must agree with it — defaulting to published would let an un-flagged file bypass the check.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot find module `./assert-citations.ts`.

- [ ] **Step 3: Write the implementation**

Create `scripts/assert-citations.ts`:

```ts
/**
 * Fails the build if a published concept cites an unverified source.
 *
 * Al-Mizan guards its documented schema counts with a CI assertion because
 * hand audits kept getting them wrong. Citations deserve the same
 * treatment: a reader cannot tell a verified reference from an invented
 * one, so the check has to be mechanical.
 *
 *   npm run check:citations
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONCEPTS_DIR = 'src/content/concepts';

export interface Grounding {
  type: string;
  ref: string;
  status: string;
}

export interface ConceptFile {
  file: string;
  draft: boolean;
  grounding: Grounding[];
}

export interface Violation {
  file: string;
  message: string;
}

export function findViolations(entries: ConceptFile[]): Violation[] {
  const violations: Violation[] = [];
  for (const entry of entries) {
    if (entry.draft) continue;
    if (entry.grounding.length === 0) {
      violations.push({
        file: entry.file,
        message: 'published with no grounding - a mapping must cite something',
      });
      continue;
    }
    for (const g of entry.grounding) {
      if (g.status !== 'verified') {
        violations.push({
          file: entry.file,
          message: `cites "${g.ref}" with status ${g.status} - verify it or mark the concept draft`,
        });
      }
    }
  }
  return violations;
}

/**
 * Minimal frontmatter reader for just the fields this check needs.
 * Defaults to draft when the field is absent, matching the Zod schema -
 * defaulting to published would let an un-flagged file bypass the check.
 */
export function parseConcept(file: string, source: string): ConceptFile {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  const fm = match ? match[1] : '';

  const draftLine = /^draft:\s*(\S+)\s*$/m.exec(fm);
  const draft = draftLine ? draftLine[1] !== 'false' : true;

  const grounding: Grounding[] = [];
  const block = /^grounding:[ \t]*\r?\n([\s\S]*?)(?=^\S|\Z)/m.exec(fm + '\n');
  if (block) {
    for (const item of block[1].split(/^[ \t]*-[ \t]+/m).slice(1)) {
      grounding.push({
        type: /type:\s*"?([^"\n]*)"?/.exec(item)?.[1]?.trim() ?? '',
        ref: /ref:\s*"?([^"\n]*?)"?\s*$/m.exec(item)?.[1]?.trim() ?? '',
        status: /status:\s*"?([^"\n]*)"?/.exec(item)?.[1]?.trim() ?? '',
      });
    }
  }
  return { file, draft, grounding };
}

async function main(): Promise<number> {
  let names: string[];
  try {
    names = (await readdir(CONCEPTS_DIR)).filter(n => n.endsWith('.md'));
  } catch {
    console.log(`No ${CONCEPTS_DIR} directory - nothing to check.`);
    return 0;
  }

  const entries: ConceptFile[] = [];
  for (const name of names) {
    entries.push(parseConcept(name, await readFile(join(CONCEPTS_DIR, name), 'utf8')));
  }

  const violations = findViolations(entries);
  if (violations.length > 0) {
    console.error('Unverified citations on published concepts:\n');
    for (const v of violations) console.error(`  ${v.file}: ${v.message}`);
    console.error(
      '\nA published concept must cite only verified sources. Fetch the ' +
      'citation from canonical data and set status: verified, or set ' +
      'draft: true until you have.',
    );
    return 1;
  }

  console.log(`Citations clean: ${entries.length} concept(s) checked.`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(await main());
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: all tests pass — 8 from Task 2 plus 8 here.

- [ ] **Step 5: Add the scripts to `package.json`**

In `scripts`, add:

```json
    "check:citations": "node scripts/assert-citations.ts",
    "check": "npm run check:citations && npm run build",
```

- [ ] **Step 6: Verify the script against the real files**

Run: `npm run check:citations`
Expected: `Citations clean: 1 concept(s) checked.` — `tawadu.md` is a draft, so its unverified citation is allowed.

Now prove it catches a real violation. Temporarily change `draft: true` to `draft: false` in `src/content/concepts/tawadu.md` and run `npm run check:citations`.
Expected: exit status 1, reporting `tawadu.md: cites "al-Sulami, Kitab al-Futuwwa" with status unverified`.

Confirm the exit status is really non-zero: `npm run check:citations; echo "exit=$?"` should print `exit=1`.

Restore `draft: true` and re-run to confirm it is clean.

- [ ] **Step 7: Wire it into CI**

In `.github/workflows/deploy.yml`, insert a step between `Install dependencies` and `Build`:

```yaml
      - name: Check citations
        run: npm run check:citations
```

- [ ] **Step 8: Commit**

```bash
git add scripts package.json .github/workflows/deploy.yml
git commit -m "feat: Fail the build on unverified citations

A published concept may cite only verified sources. Drafts may cite
anything, which is what makes the draft flag meaningful rather than
decorative. Modelled on Al-Mizan's assert-schema-counts.py: a reader
cannot distinguish a verified reference from an invented one, so the
check has to be mechanical."
```

---

### Task 8: The Adab page

**Files:**
- Create: `src/components/ConceptCard.astro`
- Create: `src/pages/adab.astro`

**Interfaces:**
- Consumes: the `concepts` collection.
- Produces: route `/adab/`.

- [ ] **Step 1: Create the card component**

Create `src/components/ConceptCard.astro`:

```astro
---
interface Props {
  nameEn: string;
  nameAr?: string;
  description: string;
  practice: { art: string; element: string; claim: string }[];
  issuedBy: string;
  epistemicStatus: 'documented' | 'interpretive';
  body: string;
}

const { nameEn, nameAr, description, practice, issuedBy, epistemicStatus, body } = Astro.props;
---

<article class="bg-white rounded-lg border-l-4 border-l-accent-cyan shadow-sm p-6 mb-6">
  <header class="flex items-baseline justify-between gap-4 flex-wrap mb-3">
    <h2 class="text-xl sm:text-2xl font-bold text-gray-800">{nameEn}</h2>
    {nameAr && <span lang="ar" dir="rtl" class="text-2xl text-gray-600">{nameAr}</span>}
  </header>

  <p class="text-gray-600 italic mb-4">{description}</p>

  {practice.map((p) => (
    <p class="text-gray-700 mb-2">
      <span class="font-semibold capitalize">{p.art} - {p.element}:</span> {p.claim}
    </p>
  ))}

  <p class="text-gray-700 leading-relaxed mt-4">{body}</p>

  <footer class={`mt-5 pt-4 border-t text-sm ${
    epistemicStatus === 'interpretive'
      ? 'border-amber-300 bg-amber-50 -mx-6 -mb-6 px-6 py-4 text-amber-900'
      : 'border-gray-200 text-gray-500'
  }`}>
    {epistemicStatus === 'interpretive' ? (
      <p>
        <strong>A personal reading, not an established ruling.</strong>
        This connection between practice and virtue is the reflection of {issuedBy},
        offered as one way of seeing, not as a teaching transmitted from the tradition.
      </p>
    ) : (
      <p>Documented mapping. Attributed to {issuedBy}.</p>
    )}
  </footer>
</article>
```

The attribution footer is not decoration. A reader must never mistake an interpretive mapping for an established teaching, and that risk is highest precisely because the material is attractive and the page looks authoritative.

- [ ] **Step 2: Create the page**

Create `src/pages/adab.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ConceptCard from '../components/ConceptCard.astro';
import { getCollection } from 'astro:content';

const base = import.meta.env.BASE_URL;

// Drafts never publish. This is the only filter here - the citation check
// in scripts/assert-citations.ts guarantees anything past it is verified.
const concepts = (await getCollection('concepts'))
  .filter(entry => !entry.data.draft)
  .sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout
  title="Adab | IIUM Aikido Club"
  description="Aikido as a discipline of adab - the ethic of the art, named and grounded."
>
  <section class="bg-[#f5f5f5] py-12 px-4 sm:px-8">
    <div class="max-w-3xl mx-auto">
      <header class="text-center mb-10">
        <h1 class="text-primary-dark text-2xl sm:text-3xl font-bold mb-4">Adab</h1>
        <div class="deco-line mx-auto"></div>
        <p class="text-gray-600 mt-6 leading-relaxed">
          A martial art is a training of character before it is a training of
          the body. These pages name the virtues the practice cultivates, and
          say plainly where each connection comes from.
        </p>
      </header>

      {concepts.length === 0 ? (
        <p class="text-center text-gray-500 italic py-12">
          Being written. Come train in the meantime:
          <a href={`${base}train`} class="text-accent-pink underline">here is when and where</a>.
        </p>
      ) : (
        concepts.map((entry) => (
          <ConceptCard
            nameEn={entry.data.name_en}
            nameAr={entry.data.name_ar}
            description={entry.data.description}
            practice={entry.data.practice}
            issuedBy={entry.data.attribution.issued_by}
            epistemicStatus={entry.data.attribution.epistemic_status}
            body={entry.body ?? ''}
          />
        ))
      )}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Build and verify the empty state**

Run: `npm run build`
Expected: PASS, now `7 page(s) built`.

Run: `grep -c "Being written" dist/adab/index.html`
Expected: `1` — the only concept is a draft, so the empty state shows. This confirms drafts do not leak.

- [ ] **Step 4: Verify a published concept renders with its attribution notice**

Temporarily set `draft: false` **and** change the grounding `status` to `verified` in `src/content/concepts/tawadu.md`, then:

Run: `npm run check`
Expected: citations clean, build passes.

Run: `grep -c "A personal reading, not an established ruling" dist/adab/index.html`
Expected: `1`.

Now restore `draft: true` and `status: unverified`, run `npm run check` again, and confirm the page returns to the empty state.

- [ ] **Step 5: Commit**

```bash
git add src/components/ConceptCard.astro src/pages/adab.astro
git commit -m "feat: Add the Adab page

Renders the concepts collection, drafts excluded. Interpretive mappings
carry a visually distinct notice: the risk that a reader mistakes a
personal reflection for an established teaching is highest precisely
because the material is attractive and the page looks authoritative."
```

---

### Task 9: The evergreen essentials on Home and Train

Spec section 4.3 gives Home the job of answering what/when/where, first-class-free, and teasing Adab; and gives Train "what a first class is like". A prospect who follows a WhatsApp link should not have to navigate anywhere to learn when training happens.

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/train.astro`

**Interfaces:**
- Consumes: `training` and `registrationUrl` from `src/config/site.ts`; route `/adab/` from Task 8.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Add the essentials block to the home page**

In `src/pages/index.astro`, confirm the frontmatter imports `training` (add it to the existing `site` import if absent):

```ts
import { registrationUrl, training } from '../config/site';
```

Insert this section directly below the hero, above the Latest Activities section:

```astro
<section id="essentials" class="bg-white py-12 px-4 sm:px-8">
  <div class="max-w-4xl mx-auto grid gap-6 md:grid-cols-3 text-center">
    <div class="p-6 bg-[#f8f8f8] rounded-lg border-t-4 border-t-accent-cyan">
      <h3 class="font-bold text-gray-800 mb-2">When</h3>
      <p class="text-gray-600">{training.schedule}</p>
      <p class="text-gray-600">{training.time}</p>
    </div>
    <div class="p-6 bg-[#f8f8f8] rounded-lg border-t-4 border-t-accent-cyan">
      <h3 class="font-bold text-gray-800 mb-2">Where</h3>
      <p class="text-gray-600">{training.venue}</p>
      <p class="text-gray-600">{training.campus}</p>
    </div>
    <div class="p-6 bg-[#f8f8f8] rounded-lg border-t-4 border-t-accent-pink">
      <h3 class="font-bold text-gray-800 mb-2">Cost</h3>
      <p class="text-gray-600">First class is free.</p>
      <p class="text-gray-600">No experience needed.</p>
    </div>
  </div>

  <p class="text-center mt-8">
    <a
      href={registrationUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-block bg-accent-pink hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
    >
      Register
    </a>
  </p>
</section>
```

- [ ] **Step 2: Add the Adab teaser to the home page**

Insert directly after the FAQ section added in Task 5:

```astro
<section id="adab-teaser" class="bg-primary-dark text-white py-12 px-4 sm:px-8">
  <div class="max-w-3xl mx-auto text-center">
    <h2 class="text-2xl sm:text-3xl font-bold mb-4">More Than Technique</h2>
    <p class="text-gray-200 leading-relaxed mb-6">
      Aikido trains character before it trains the body. We keep a written
      account of the virtues the practice cultivates, and say plainly where
      each connection comes from.
    </p>
    <a href={`${base}adab`} class="text-accent-cyan font-semibold underline hover:text-white transition-colors">
      Read the Adab pages
    </a>
  </div>
</section>
```

- [ ] **Step 3: Add "what a first class is like" to Train**

In `src/pages/train.astro`, insert above the FAQ section:

```astro
<section id="first-class" class="bg-white py-12 px-4 sm:px-8">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-primary-dark text-xl sm:text-2xl font-bold mb-6 text-center">
      Your First Class
    </h2>
    <ol class="flex flex-col gap-4 text-gray-700 leading-relaxed">
      <li><span class="font-semibold">Turn up in loose clothing.</span> A t-shirt and tracksuit bottoms are fine. You do not need a gi to start, and you do not need to buy anything.</li>
      <li><span class="font-semibold">Arrive a few minutes early</span> and say you are new. Someone will pair you with a senior member for the session.</li>
      <li><span class="font-semibold">You will spend most of it falling safely.</span> Ukemi, learning to receive a throw without hurting yourself, is the first thing anyone learns and the thing everyone keeps practising.</li>
      <li><span class="font-semibold">Nobody is trying to hurt you.</span> Aikido has no competitive sparring. You work with a partner, not against an opponent.</li>
      <li><span class="font-semibold">You will not be the only beginner.</span> Most of the class started knowing nothing.</li>
    </ol>
  </div>
</section>
```

- [ ] **Step 4: Verify**

Run: `npm run check`
Expected: PASS.

```bash
grep -c "First class is free" dist/index.html      # expect 1
grep -c "Read the Adab pages" dist/index.html      # expect 1
grep -c "Your First Class" dist/train/index.html   # expect 1
grep -o 'href="/AikidoClub/adab"' dist/index.html  # expect a match, with no double slash
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/pages/train.astro
git commit -m "feat: Put the evergreen essentials on Home and Train

Someone arriving from a WhatsApp link should learn when and where
training happens without navigating anywhere, and should find out that
the first class is free before they find out anything else. Train gains
a plain account of what a first session actually involves, which is the
question the FAQ answers only obliquely."
```

---

### Task 10: Session memory

Spec section 4.5. `CLAUDE.md` carries the architecture; `memory.md` carries the reasoning, which is what actually evaporates. Without it, the reasoning behind these decisions lives only in a chat transcript.

**Files:**
- Create: `memory.md`

- [ ] **Step 1: Create `memory.md`**

```markdown
# Memory

Decisions and their reasoning, newest first. `CLAUDE.md` says what the code
does; this says why. Modelled on the same file in Al-Mizan.

## 2026-08-21 — Site restructure and Adab collection

- **News expires at build time (four months).** An unmaintained news section
  does not go quiet, it goes visibly abandoned. Maintenance is known to be
  sporadic, so neglect had to degrade safely. A weekly cron rebuild applies
  expiry without anyone pushing.
- **About Us became Train.** The old name described the club; the new one
  describes what the reader wants.
- **activities.astro was retired.** Its Latest Activities section duplicated
  the identical block on the home page. Kept as a redirect stub because
  printed QR codes and old links point at it.
- **Concepts are absent from the CMS on purpose.** They are author-owned. A
  widget would invite a committee member to publish an unattributed mapping.
- **Interpretive mappings render with a visible notice.** The risk of a
  reader mistaking a personal reflection for an established teaching is
  highest precisely because the material is attractive and the page looks
  authoritative.
- **Rejected: normalising image paths.** The tolerant resolvers absorb the
  path format Sveltia writes. The inconsistency is load-bearing.
- **Rejected: Netlify.** Its premise — that token-pasting was a GitHub Pages
  limitation — was false. A Cloudflare Worker gives Sveltia OAuth on any host.
- **The finding that outranks all of the above:** the club's intake is
  dominated by CFS practitioners who fail to carry over to Gombak. That is a
  transition leak, not a discovery problem, and no website fixes it. See
  spec section 3.
```

- [ ] **Step 2: Commit**

```bash
git add memory.md
git commit -m "docs: Add memory.md for decision reasoning

CLAUDE.md carries the architecture; this carries the why, which is the
part that evaporates."
```

---

### Task 11: Update the architecture docs

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`
- Modify: `docs/EDITING.md`

- [ ] **Step 1: Add the collection to the table in `CLAUDE.md`**

```markdown
| `concepts` | `glob` \*\*/\*.md | `src/content/concepts/` | `attribution` required; `draft` gates publication; author-owned, absent from the CMS |
```

- [ ] **Step 2: Document the new commands and behaviour in `CLAUDE.md`**

In the commands section, add:

```markdown
npm test                 # node --test over src/**/*.test.ts and scripts/**/*.test.ts
npm run check:citations  # fails if a published concept cites an unverified source
npm run check            # check:citations, then build - run this before pushing
```

In the content section, add:

```markdown
News expires at build time (`src/lib/news.ts`, four-month shelf life) and the
nav item disappears when nothing is fresh. A weekly cron rebuild applies expiry
without a push. Routes are Home / Train / Adab / Club; `/activities/` is a
redirect stub kept for old links.
```

- [ ] **Step 3: Update `README.md`**

Add `npm test` and `npm run check` to the commands table. Amend the "`npm run build` is the test suite" paragraph to say `npm run check` is now the pre-push command.

- [ ] **Step 4: Update `docs/EDITING.md`**

In the sections table, note that Mainboard and Past Activities now appear on the **Club** page, and the FAQ appears on both **Home** and **Train**. Add to "Things worth knowing":

```markdown
**There is no Adab section in the CMS.** Those pages are maintained in code
and are not club-editable by design.
```

- [ ] **Step 5: Verify and commit**

Run: `npm run check`
Expected: PASS.

```bash
git add CLAUDE.md README.md docs/EDITING.md
git commit -m "docs: Update for the route restructure and concepts collection"
```

---

## Deferred, deliberately

Not in this plan, each for a stated reason:

- **The `@keyframes imageFade` collision.** `ImageFadeCarousel.astro` defines keyframes using `calc()` as keyframe selectors, which is invalid CSS, and the name collides with another `imageFade` in `index.astro`. The component's `--totalCycleTime` and `--fadePercent` variables have therefore never had any effect. Pre-existing, cosmetic, unrelated to recruitment.
- **Image-path normalisation.** The tolerant resolvers absorb CMS drift; the inconsistency is load-bearing.
- **The Cloudflare Worker and OAuth setup.** Requires the author's GitHub and Cloudflare accounts — see `docs/CMS-SETUP.md`. Week 4 in the spec.
- **Writing the actual Adab content.** This plan builds the machinery. The scholarship is Week 3 and is the author's, not an implementer's.
