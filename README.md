# IIUM Aikido Club Website

The club's public website: <https://2217441.github.io/AikidoClub/>

Built with [Astro](https://astro.build). Content is edited through a browser-based
admin panel — **you do not need to know how to code to update this site.**

---

## I just want to update the website

Go to **<https://2217441.github.io/AikidoClub/admin/>**, sign in, and edit.
You can post news, add activities, update the mainboard and change the FAQ
from there. Nothing on your computer needs to be installed.

Full walkthrough: **[docs/EDITING.md](docs/EDITING.md)**

If you can't sign in, someone has to add your GitHub account to this
repository first — see [docs/CMS-SETUP.md](docs/CMS-SETUP.md).

---

## I need to change the code

You need [Node.js](https://nodejs.org) version 20 or newer. Check what you
have with `node --version`. If that command isn't found, install Node first.

```sh
git clone https://github.com/2217441/AikidoClub.git
cd AikidoClub
npm install          # downloads dependencies, takes a minute, only needed once
npm run dev          # starts the site at http://localhost:4321
```

Leave `npm run dev` running and edit files — the browser updates by itself.
Press `Ctrl+C` in the terminal to stop it.

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Local preview at `localhost:4321`, updates as you edit |
| `npm run build` | Builds the real site into `dist/` |
| `npm run preview` | Serves what `npm run build` produced |
| `npm test` | Runs the unit tests (news freshness, citation checks) |
| `npm run check` | Citation assertion, then the build — the pre-push command |

**`npm run check` is the test suite.** It asserts that no published concept
cites an unverified source, then builds. The build checks page code *and*
validates every content file against its schema, so if a news post is missing
a required field, the build fails and tells you which file. Run it before
pushing.

---

## How it goes live

Pushing to the `master` branch automatically builds and publishes the site
(see `.github/workflows/deploy.yml`). There is no staging step and no
approval — **a push to `master` is a release.** It takes a couple of minutes;
watch it under the repository's Actions tab.

Editing through `/admin` commits to `master`, so it deploys the same way.

---

## Where things are

```
src/pages/       one file per page of the site
src/components/  reusable pieces (nav, footer, cards)
src/layouts/     the shared page shell
src/content/     the actual text — news, activities, FAQ, mainboard
src/config/      values used in more than one place (email, schedule)
public/          images and files served as-is
public/admin/    the CMS admin panel
```

The single most common mistake: internal links and images must be built from
the site's base path, e.g. `` `${base}img/logo.png` `` — never `/img/logo.png`.
The site is served from a subfolder, so a leading slash breaks it.

---

## Documentation

| File | For |
| :--- | :--- |
| [docs/EDITING.md](docs/EDITING.md) | Committee members updating content |
| [docs/CMS-SETUP.md](docs/CMS-SETUP.md) | Whoever maintains CMS access |
| `CLAUDE.md` | An AI coding assistant, if you use one — it explains the architecture and the traps. Also the most accurate technical reference here if you're reading by hand. Safe to ignore otherwise. |
