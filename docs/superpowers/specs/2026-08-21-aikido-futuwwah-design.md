# IIUM Aikido Club — Site and Adab Knowledge Design

**Date:** 2026-08-21
**Status:** Approved, not yet implemented
**Deadline driver:** IIUM Semester 1 2026/2027 lectures begin 28 September 2026

---

## 1. Context

The IIUM Aikido Club has **fewer than 10 members**, most holding committee
posts because IIUM requires them filled, with roughly five actually training.
The club is alive but invisible: its last recorded activity on the site is
May 2024, its mainboard listing stops at tenure 23/24, and the newest news
item announces registration for a semester that has ended.

The author is graduating and wants three things that pull in different
directions: the club to survive, the site to be maintainable without him, and
a larger project — a martial-arts-and-community space rooted in **futuwwah**
(Islamic spiritual chivalry) — that connects to his own domain of study.

## 2. Decisions

### 2.1 Project decomposition

Seven distinct projects were identified and deliberately separated:

| # | Project | Status |
| :-- | :--- | :--- |
| 1 | Club revival / recruitment | Active — but chiefly non-software (see §3) |
| 2 | Handover survivability | Active |
| 3 | Aikido/martial knowledge artifact | Active, lower priority |
| 4 | Club-site kit for other IIUM clubs | Deferred |
| 5 | Revenue | Deferred, explore separately |
| 6 | Internal club ops (docs, money) | **Rejected** — see §2.4 |
| 7 | Multi-tenant SaaS for aikido clubs | Deferred |

### 2.2 Ownership: split

The club's pages are handover-able; the larger platform belongs to the author.
The club's survival must not depend on infrastructure only he can operate.

### 2.3 Hosting: GitHub Pages, unchanged

The site is 3.1 MB across 54 files. GitHub Pages' limits (100 GB/month soft
bandwidth, 1 GB site size) are ~32,000 full-site loads and 0.3% of the size
cap respectively. Cloudflare Pages and Netlify offer more, but all
alternatives serve from the domain root, which would require rewriting every
`${base}` path. **Revisit only if video is ever added.**

Netlify migration is **rejected**. Its premise — that token-pasting was a
GitHub Pages limitation — was false. Sveltia CMS supports GitHub OAuth on any
host via a Cloudflare Workers proxy.

### 2.4 Scope: public content only

Internal club operations (documents, finances, member records) are **excluded**.
The repository is public and the CMS commits content into it, so anything saved
through `/admin` is world-readable permanently. A nine-member club's document
problem is solved by a shared Drive folder and a naming convention — building
authentication and private storage for nine people is the fastest route to an
unmaintainable project.

### 2.5 Strategic sequence: C → B → A

The larger project proceeds content-first:

- **C (now)** — author the futuwwah↔practice material as markdown with
  frontmatter; publish as pages. No graph.
- **B (later)** — separate system with a real store once volume justifies it.
- **A (when proven)** — extend Al-Mizan directly.

Rationale: `ingest_wiki_concepts.py` in Al-Mizan already reads
markdown-with-frontmatter and emits both SurrealQL and TypeQL. Authoring in
that shape makes the content Al-Mizan-ingestible from day one with **zero new
infrastructure**, buying the option on B and A without paying for either.

The bottleneck is content, not engineering. A graph over twelve concepts is a
diagram; the scarce good is careful attributed mapping, which is scholarship.

### 2.6 Community before artifact, but artifact first in practice

The intent is a **formation community** — people practising an ethic together,
where success means members change — with the knowledge artifact secondary and
parallel. That ordering is the goal, not the build order.

A formation community cannot be bootstrapped by one person: it needs people, a
teacher, and moderation. The artifact can. So the artifact is built first *as
the thing a community later forms around* — an empty community is dead, while
an empty encyclopaedia is merely early.

The community itself stays in **WhatsApp**, where the club already is, until
there is a reason it cannot. Its own space within the system is a later phase,
not a phase-C deliverable.

## 3. The finding that matters most

**The club's recruitment problem is a transition leak, not a discovery problem.**

Ranked by size, the club's intake is:

1. CFS practitioners continuing to Gombak — the largest pool, **most of whom
   do not carry over**
2. Promotional activity — fewer
3. Someone independently seeking aikido — rare

The largest source is people who *already train aikido* and silently fail to
re-join after changing campus. No website fixes this. The fix is process:
obtain the CFS club's outgoing list each year, contact them by name before
week one, and treat continuing members as a category the club actively claims.

**This is expected to outweigh every software change in this document.**

## 4. Design

### 4.1 Structure: Track 1 and Track 2 converge

The club's evergreen conversion content and the first phase of the futuwwah
material are the same writing. For a student at an Islamic university,
"aikido as a discipline of adab, with the ethic named and grounded" is the
strongest conversion argument available and one no other campus club can make.

Phase-C content therefore lives **in the club repo** as a new Astro content
collection:

```
src/content/concepts/     futuwwah <-> practice material  (author-owned)
src/content/news/         dated, expires                  (club-editable)
src/content/activities/   ongoing                         (club-editable)
```

This does not violate §2.2: the payload is portable markdown, so separating
later is a `git mv`. The club never edits these pages; their editable surface
stays news and activities via `/admin`.

**No graph visualisation in phase C.** With a dozen concepts a graph is a
diagram that makes the project look emptier than it is.

### 4.2 Content model and epistemic discipline

Three constraints precede the schema:

1. **Revealed text is never authored here, only referenced.** Qur'an and hadith
   are Tier 1 — CONSTANT in Al-Mizan's model. Any verse appearing on the site
   is fetched from canonical data (the `quran` MCP server) with its translation
   edition recorded. Nothing from memory.
2. **Hadith has a weaker path and the schema must admit it.** A hadith
   grounding is either drawn from Al-Mizan's graded corpus or explicitly marked
   unverified. It must not be possible to cite one without saying which.
3. **Every practice↔virtue mapping is an interpretive act and must be
   attributed.** Saying *ukemi* expresses *tawāḍuʿ* is ijtihad, not
   revelation. Two states, marked, never blurred:
   - `documented` — a named source makes this link; cite it
   - `interpretive` — the author's own reflection; attributed, marked
     contingent (*Imkan*), rendered visually distinct

The failure mode this prevents is a reader mistaking reflection for
established teaching — a risk that is *highest* precisely because the material
is attractive and the site will look authoritative.

**Schema** (frontmatter is a superset of what `ingest_wiki_concepts.py` reads):

```yaml
name_en / name_ar / transliteration / description   # Al-Mizan ETL keys
practice:     [{ art, element, claim }]
grounding:    [{ type: quran|hadith|scholar, ref, status }]
attribution:  { issued_by, epistemic_status: documented|interpretive }
order / draft
```

Deliberately excluded: `tahanawi_index` (only matters at phase B), and any
up-front taxonomy of virtues — structure should emerge from a dozen written
pieces. YAGNI applies harder to ontology than to code, because a wrong
ontology is more expensive to unwind.

### 4.3 Site structure

The current site inverts its own priorities: six evergreen FAQ entries — the
exact hesitations of a half-interested prospect — sit at the bottom of a
secondary page, while News occupies top-level navigation and displays an
expired announcement.

| Page | Job | Ages? |
| :--- | :--- | :--- |
| **Home** | What/when/where, first class free, FAQ highlights, concept teaser, CTA | No |
| **Train** (was About Us) | Schedule, venue, map, full FAQ, what a first class is like | No |
| **Adab** (new) | The concepts collection | No |
| **Club** | Mainboard + activity archive, framed as history | Gracefully |
| ~~News~~ | Rendered only when something current exists | — |

**News expires at build time.** Maintenance is known to be sporadic, and an
unmaintained news section does not go quiet — it goes visibly abandoned, which
signals a dead club more loudly than having none. Entries past their shelf
life stop rendering; when none remain, the section and its nav item disappear.
Neglect degrades to *quiet*, never to *abandoned*.

This requires migrating `news.date` from a free-form string ("January 2026")
to a real date.

**Mainboard** is blocked on the club supplying current-tenure data; a
placeholder ships in the interim. If nothing arrives before 28 September, the
page is relabelled as an archive rather than presenting a two-year-old
committee as current.

**Activity archive** stops at May 2024. That is fine *as archive*; it only
reads as decay under a heading implying recency.

### 4.4 Validation

`npm run build` remains the only gate, and §4.2's discipline rides on it:

- A concept missing `attribution.issued_by` or `epistemic_status` **fails the build**
- Anything `draft: true`, or with `grounding.status` of `pending`/`unverified`,
  **does not publish**
- News entries require real dates so expiry can be computed

One additional script, modelled on Al-Mizan's `assert-schema-counts.py`:
**no published concept may cite a source marked unverified.** Al-Mizan's lesson
is that drift between stated and actual needs a machine to catch it — three
separate audits got it wrong by hand. The same failure mode applies to
citations, with worse consequences.

### 4.5 Workflow and memory

A `memory.md` in Al-Mizan's style — decisions, dates, what was tried and
rejected and why — plus ADRs for structural changes. `CLAUDE.md` carries the
architecture; `memory.md` carries the reasoning, which is what actually
evaporates.

## 5. Sequence to 28 September

| When | Work | Blocked on |
| :--- | :--- | :--- |
| Done | CMS schema fix, config consolidation, dead-code removal, docs | — |
| Week 1 | News date schema + expiry, nav restructure, mainboard placeholder | — |
| Week 2 | Evergreen rewrite (Home, Train); promote FAQ | — |
| Week 3 | First 3–5 Adab concepts | Canonical citations |
| Week 4 | Cloudflare Worker + OAuth App; QR code for booth | **Author's accounts** |
| Week 5 | Mainboard data; final content; verify deploy | **Club contact** |

**Risk:** Week 3 is scholarship, not content-filling, and is most likely to
overrun. It slips harmlessly — the Adab section can launch with two pieces or
none, and all recruitment-critical work is in Weeks 1–2.

**Hard dependencies** are both the author's and cannot be worked around: the
Worker deployment and the club contact. Both have slack now; neither does past
mid-September.

## 6. Rejected alternatives

| Option | Why rejected |
| :--- | :--- |
| Netlify migration | Premise false; Worker achieves it without moving hosts |
| Cloudflare Pages / Vercel | Advantages unusable at 3.1 MB; costs a base-path rewrite |
| Internal ops in this repo | Public repository; content is world-readable forever |
| Knowledge graph in phase C | Aikido is a flat taxonomy, not a dense graph; too little content to traverse |
| Custom community platform | The community is nine people already in WhatsApp |
| Image-path normalisation | Tolerant resolvers absorb CMS drift; the inconsistency is load-bearing |
| Social-links deduplication | Each copy carries inline SVG path data; no user-visible gain |
