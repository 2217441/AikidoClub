# Netlify Migration Guide

This guide explains how to migrate the IIUM Aikido Club website from GitHub Pages to Netlify for seamless CMS authentication.

## Why Migrate?

Currently using GitHub Pages + Sveltia CMS requires editors to manually enter a GitHub Personal Access Token. Netlify provides:
- One-click "Login with GitHub" authentication
- Same Git-based workflow
- Free tier with generous limits
- Automatic deploys from GitHub

## Prerequisites

- GitHub account with access to the repository
- Netlify account (sign up at https://netlify.com with GitHub)

## Step 1: Create Netlify Site

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** and authorize Netlify
4. Choose the **2217441/AikidoClub** repository
5. Configure build settings:
   - **Branch to deploy:** `master`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **Deploy site**

## Step 2: Update CMS Backend Config

Edit `public/admin/config.yml` and update the backend section:

```yaml
backend:
  name: git-gateway
  branch: master
```

Remove the old GitHub backend config (name: github, repo: ...).

## Step 3: Enable Netlify Identity

1. In Netlify dashboard, go to **Site settings** → **Identity**
2. Click **Enable Identity**
3. Under **Registration**, choose:
   - **Invite only** (recommended for CMS editors)
4. Under **External providers**, click **Add provider** → **GitHub**
5. Use default scopes

## Step 4: Enable Git Gateway

1. Go to **Site settings** → **Identity** → **Services**
2. Click **Enable Git Gateway**

## Step 5: Invite CMS Editors

1. Go to **Identity** tab in Netlify dashboard
2. Click **Invite users**
3. Enter email addresses of editors
4. They'll receive an invite to set up their account

## Step 6: Update Admin Page (Optional)

If you want to keep using Sveltia CMS on Netlify, it works with git-gateway.

Alternatively, you can use the official Netlify CMS widget for identity:

```html
<!-- Add before closing </head> -->
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>

<!-- Add before closing </body> -->
<script>
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
</script>
```

## Step 7: Update Base URL

Since Netlify hosts at the root domain (not a subdirectory), update `astro.config.mjs`:

```js
export default defineConfig({
  site: 'https://your-site-name.netlify.app',
  // Remove the base: '/AikidoClub/' line
  // ...
});
```

Also update `public/admin/config.yml`:

```yaml
public_folder: /img  # Remove /AikidoClub prefix
```

## Step 8: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow instructions to configure DNS

## Post-Migration Cleanup

After verifying everything works on Netlify:

1. Disable GitHub Pages in the repository settings (Settings → Pages → Source: None)
2. Update any external links pointing to the old GitHub Pages URL
3. Consider deleting the `.github/workflows/deploy.yml` file

## Rollback

If you need to go back to GitHub Pages:

1. Restore `astro.config.mjs` with `base: '/AikidoClub/'`
2. Update config.yml backend to:
   ```yaml
   backend:
     name: github
     repo: 2217441/AikidoClub
     branch: master
   ```
3. Re-enable GitHub Pages in repository settings
4. Delete the Netlify site

## Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Sveltia CMS with Netlify](https://github.com/sveltia/sveltia-cms#getting-started)
- [Netlify Identity](https://docs.netlify.com/security/secure-access-to-sites/identity/)
