# Deploying Cositel to Cloudflare

Cositel runs on Cloudflare Workers, with a D1 database (orders, products, settings) and a Workers KV namespace (photos and customer logo files). Everything below fits in Cloudflare's free plan, with no payment method needed.

> Already set up for this shop: database `cositel-db` and KV namespace `cositel-files` exist, their IDs are in `wrangler.jsonc`, and the tables are created. Steps 2–3 are only for a brand-new Cloudflare account.

All commands are run from this `cositel` folder.

## 0. One-time tools

```bash
npm install -g pnpm@11.25.0
```

```bash
pnpm install --frozen-lockfile
```

## 1. Sign in to Cloudflare

```bash
pnpm exec wrangler login
```

This opens your browser to authorize Wrangler (Cloudflare's command-line tool) on your account.

## 2. Create the database and the file storage

```bash
pnpm exec wrangler d1 create cositel-db
```

Copy the `database_id` it prints into `wrangler.jsonc`, replacing `00000000-0000-4000-8000-000000000000`.

```bash
pnpm exec wrangler kv namespace create cositel-files
```

Copy the `id` it prints into `wrangler.jsonc` under `kv_namespaces` (binding `FILES`).

Free-plan limits for files: 1 GB in total, 25 MB per file, 1,000 uploads per day. The shop's uploads are at most 5 MB (photos) and 12 MB (a custom design). To move to R2 later, replace `lib/file-store.mjs` with the R2 binding; the rest of the code already uses the R2 API.

## 3. Create the database tables

```bash
pnpm db:migrate
```

Run this again whenever a new file appears in `drizzle/`. Wrangler tracks which ones were already applied.

## 4. Deploy

```bash
pnpm run deploy
```

Wrangler prints the address, for example `https://cositel.<your-subdomain>.workers.dev`.

## 5. Set the admin password

```bash
pnpm exec wrangler secret put ADMIN_PASSWORD
```

Type a strong password (at least 12 characters; a password manager's generated one is best). It's stored encrypted by Cloudflare and never written in the code. Then open `/admin` on your site and sign in.

- Changing the password (same command) signs out every open session.
- Sessions last 7 days. "Se déconnecter" is at the bottom of the admin sidebar.
- Until this secret is set, `/admin` shows a "not configured" message and nobody can sign in.

## 6. First use

Follow "Première utilisation" in `README.md`: sign in to `/admin` (the starting catalog is imported automatically), enter prices and stock, upload photos, check delivery settings, then enable orders.

## Automatic deploys from GitHub (optional)

Once the code is on GitHub, Cloudflare can redeploy on every push:

1. Dashboard → **Workers & Pages** → `cositel` → **Settings** → **Builds** → **Connect** your GitHub repository.
2. Build command: `pnpm build`. Deploy command: `npx wrangler deploy`. Root directory: the folder that contains `wrangler.jsonc` (`/` if this folder is the repository root).
3. Under build variables, add `NODE_VERSION` = `24`.

Database migrations aren't run automatically. Run `pnpm db:migrate` yourself when a new one is added.

## Your own domain (optional)

Dashboard → `cositel` Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**. The domain must be managed by Cloudflare DNS.

## Data from the old ChatGPT-hosted site

This code doesn't include the old site's orders, prices, stock or uploaded photos (see `LIRE-MOI-HEBERGEMENT.md`). To keep them, export the D1 database and the R2 files from the old platform and import them here (files go into the KV namespace, under the same keys), keeping file keys and IDs unchanged. Otherwise, start fresh and re-enter prices and photos in `/admin`.

## Local development

```bash
pnpm db:migrate:local
```

```bash
pnpm dev
```

Create a `.dev.vars` file (gitignored) containing `ADMIN_PASSWORD=<a local test password of 12+ characters>` to sign in to `/admin` locally at http://localhost:5173.

Tests:

```bash
pnpm test
```
