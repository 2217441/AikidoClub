# CMS Access and Setup

For whoever maintains the site. Read once, then rarely.

The site uses [Sveltia CMS](https://sveltiacms.app), served as static files
from `public/admin/`. It has no server and no database of its own: signing in
means signing in **to GitHub**, and saving means **committing to this
repository**, which triggers the deploy workflow.

Two consequences follow, and neither has a workaround:

- **Every editor needs their own GitHub account**, added as a collaborator
  with write access to `2217441/AikidoClub`.
- **Anything saved through the CMS is public forever.** The repository is
  public and content is committed to it, so club finances, member records and
  internal documents must never go through here. Use Google Drive for those.

## Adding an editor

1. GitHub → repository → **Settings** → **Collaborators** → **Add people**
2. Enter their GitHub username, give **Write** access
3. They accept the emailed invitation
4. They can now sign in at `/admin`

Only a repository admin can do this. **Whoever holds that admin access is a
single point of failure** — if they graduate and disappear, nobody can add
editors again. Make sure at least two people have it.

## Sign-in methods

### Personal access token (current)

Works with no setup. The editor generates a fine-grained GitHub token and
pastes it in; instructions are shown on the login screen. Fine for one or two
technical people, poor for everyone else — tokens expire and the setup is
long enough that non-technical members give up.

### GitHub OAuth (recommended, needs one-time setup)

Gives editors a "Sign in with GitHub" button instead. A GitHub OAuth client
secret cannot live in browser code, and Sveltia runs entirely in the browser,
so a small server-side proxy is required. Sveltia publishes one for Cloudflare
Workers; the free tier is far beyond what a login flow uses.

**This is now live.** The worker is `https://aikidoclub-auth.ammar-q.workers.dev`
(Cloudflare account of Ammar, worker `aikidoclub-auth`, source in the private
repo `IIUMstudent/aikidoclub-auth`). The OAuth App `IIUM Aikido Club CMS`
(client ID `Ov23liblhThHkvXp8Y0E`) is owned by the personal account `2217441`
— transfer it to the IIUMstudent org so it outlives any one member.

1. Deploy [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) to
   Cloudflare Workers, and note the Worker URL
2. Register a GitHub OAuth App with `<worker-url>/callback` as the
   authorization callback URL
3. Set these as Worker environment variables:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET` (encrypted)
   - `ALLOWED_DOMAINS` — restrict to this site's domain
4. Add the Worker URL to `public/admin/config.yml`:

   ```yaml
   backend:
     name: github
     repo: 2217441/AikidoClub
     branch: master
     base_url: https://<your-worker>.workers.dev
   ```

**Keep the token method documented after switching.** If the Worker is
deleted, or the OAuth App belongs to an account that leaves the club, OAuth
login stops working and the token path is the only way back in. Whoever hits
that will have no context — leave them the instructions.

Note that OAuth removes the token-pasting step. It does **not** remove the
need for a GitHub account and a collaborator invitation.

## Hosting

GitHub Pages, published by `.github/workflows/deploy.yml` on every push to
`master`. Free, and the limits (100 GB/month soft bandwidth cap, 1 GB site
size) are far above this site's ~3 MB.

Netlify was evaluated as a way to get one-click OAuth and rejected: the
Cloudflare Worker achieves the same thing without moving hosts. Any move to
Netlify, Cloudflare Pages or Vercel would serve the site from the domain root
instead of `/AikidoClub/`, which means rewriting every internal path — see the
base-path note in `CLAUDE.md`.
