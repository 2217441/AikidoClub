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
