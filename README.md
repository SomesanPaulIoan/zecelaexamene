# Zece la Examene

Educational commerce platform for Romanian high-school and university entrance exam preparation.

Live website: https://zecelaexamene.ro

## Features

- Course catalog, gated lessons, and downloadable course resources.
- Book store with cart, discounts, shipping, and Stripe checkout.
- Email/password and Google sign-in, email verification, and password recovery.
- Administration for orders, customers, books, and contributor revenue.
- SmartBill invoicing and transactional email.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Stripe, Docker, and Caddy.

## Local development

Requires Node.js 22 and Docker Compose.

```bash
npm ci --legacy-peer-deps
cp .env.example .env
# Set your own SESSION_SECRET and integration credentials in .env.
docker compose up -d
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The local database starts empty. Production data and private content-seeding scripts are
not distributed. External integrations require your own credentials.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Docker Compose production setup.

## Public repository contents

This repository contains application source and database schema migrations. Environment
credentials, customer records, database exports, internal migration and sales scripts,
paid course archives, runtime uploads, and local assistant files are excluded.

The production application is maintained separately from this sanitized public copy.
