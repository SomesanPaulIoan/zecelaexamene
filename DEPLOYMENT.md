# Deploying zecelaexamene.ro

## What you need before starting

- A VPS (2GB+ RAM is plenty for this scale) with Docker + Docker Compose installed — Hetzner, DigitalOcean, or similar. Point the domain's DNS `A` record at its IP before starting (Caddy needs that to issue a TLS certificate).
- Live Stripe keys + a webhook endpoint (see below).
- SmartBill username/token for the Romanian SRL (CIF 53187997).
- Hostinger SMTP credentials (or whichever mailbox sends `no-reply@zecelaexamene.ro`).

## One-time setup on the VPS

```bash
git clone <this repo> zecelaexamene-app
cd zecelaexamene-app
cp .env.production.example .env.production
# edit .env.production — fill in every value, generate SESSION_SECRET with:
openssl rand -base64 32
```

Edit `Caddyfile` and replace the placeholder domain with the real one if it's not already `zecelaexamene.ro`.

## Deploy

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --build --rm migrate   # apply schema
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build               # start postgres, app, caddy
```

`--build` on the `migrate` step is required, not optional — without it, Compose silently
reuses whatever image it last built for that service (even a much older one from before
recent schema changes), applying a stale migration set with no warning.

Caddy automatically requests and renews the TLS certificate on first boot — give it a minute on first run.

## Stripe webhook (required, not optional)

In the Stripe Dashboard → Developers → Webhooks, add an endpoint at
`https://zecelaexamene.ro/api/webhooks/stripe` subscribed to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET` in `.env.production`, then
`docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build app` to pick it up.

Without this, orders never get marked paid, course access never gets granted, and revenue-share never gets recorded — it is required for the site to function, not a nice-to-have.

## Legacy migration

Private migration and content-seeding scripts, database exports, customer data, and paid
course resources are intentionally omitted from this public repository. Prisma schema
migrations are included and contain schema definitions only.

## Course resource ZIPs

A handful of courses have downloadable ZIP resources (gated on course access), served from
the non-public `resources/` directory at the project root. These files are large (~250MB
total) and are **not committed to git** (`.gitignore` excludes `resources/*.zip`) — copy
them to the VPS manually before the first build:

```bash
scp resources/*.zip your-vps:zecelaexamene-app/resources/
```

The `Course.resourceFileName` column (set via the legacy data migration or manually in the
DB) names which file in `resources/` each course serves. The Dockerfile copies this
directory into the runner image, so re-run the `scp` step (and rebuild) whenever a resource
file changes; no need to repeat it on every redeploy if the files are already present on the
VPS host and the directory is preserved across builds.

## Admin-uploaded book images

Book covers/gallery images uploaded from `/admin/carti` are written to
`public/uploads/` at runtime. Unlike the resource ZIPs above, this needs no manual step —
`docker-compose.prod.yml` mounts it as a named volume (`app_uploads`), so uploads persist
automatically across rebuilds and redeploys.

## Redeploying after code changes

```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml run --build --rm migrate   # only if the schema changed
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build app
```

## Cutover

1. Deploy this app to a subdomain or staging domain first and verify end-to-end (a real Stripe test purchase, a real login) before touching DNS.
2. Re-run the legacy data migration one final time close to cutover.
3. Point the domain's DNS at this VPS.
4. Keep the legacy PHP site's files and database backup  until the new site has been live and verified for a while.
