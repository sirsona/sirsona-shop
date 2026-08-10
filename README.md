# Mctaba Shop

A full-stack e-commerce platform built as part of the Mctaba Labs bootcamp — a real shop that processes real payments.

**Stack:** Next.js 14 (App Router) · Express 5 · PostgreSQL · Paystack · Twilio WhatsApp · Tailwind CSS

## Features

- **Product catalog** — category browsing, live stock badges, product detail pages with dynamic Open Graph metadata
- **Cart & checkout** — localStorage cart with server-side re-pricing, stock validation and atomic stock reservation (row-locked transactions)
- **Paystack payments** — hosted checkout, signed webhook verification (HMAC-SHA512), idempotent settlement, amount-mismatch detection with automatic restock
- **Order tracking** — order status pages with live polling for mobile-money confirmations, phone-based "My Orders" lookup
- **WhatsApp notifications** — order confirmations delivered via Twilio WhatsApp (sandbox session messages; template mode supported)
- **Admin dashboard** — token authentication (HttpOnly cookie), order management with validated status transitions (auto-restock on cancel), Paystack↔database transaction reconciliation with mismatch highlighting
- **Accessibility** — axe-core in development, semantic HTML, WCAG language declaration

## Architecture

```
app/                    Next.js storefront (App Router, Server Components)
├── products/           catalog + category filtering
├── cart/  checkout/    cart + checkout flow
├── orders/  my-orders/ customer order pages
└── admin/              admin dashboard (login, orders, transactions)

server/                 Express API (ESM, subpath imports)
└── src/
    ├── routes/         HTTP routing
    ├── controllers/    request handling
    ├── services/       business logic (checkout, payments, notifications)
    ├── repositories/   data access
    ├── middleware/     auth + async error handling
    └── infrastructure/ database pool
```

## Getting started

```bash
# Frontend (Next.js on :3000)
npm install
npm run dev

# API (Express on :4000)
cd server
npm install
npm run dev

# PostgreSQL — create the database, then apply the schema:
psql "postgresql://<user>:<password>@localhost:5432/mctaba_shop" -f server/schema.sql
```

### Environment variables

**`.env.local`** (frontend):

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**`server/.env`**:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=<user>
DB_PASSWORD=<password>
DB_NAME=mctaba_shop
PORT=4000
SHOP_URL=http://localhost:3000
API_URL=http://localhost:4000
PAYSTACK_SECRET_KEY=sk_test_...
ADMIN_API_TOKEN=<token used to sign in to /admin/login>
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

Optional: set `USE_WHATSAPP_TEMPLATE=true` and `WHATSAPP_ORDER_TEMPLATE_ID=<template SID>` to send approved utility templates instead of sandbox session messages.

### Paystack setup

1. Create a Paystack test account and copy the secret key into `server/.env`.
2. In the Paystack dashboard (Settings → API Keys & Webhooks) set the webhook URL to `https://<your-public-url>/api/paystack/webhook` and enable the `charge.success` and `charge.failed` events.
3. Test payments with the test card `4084 0840 8408 4081` — the order page confirms automatically.

### Testing from another device (ngrok)

Webhooks are server-to-server, but the browser payment callback needs a public URL while developing:

```bash
# server/
npm run dev:proxy    # single tunnel for both apps (API + storefront)

ngrok http 3001
```

Point `SHOP_URL`, `API_URL` and `NEXT_PUBLIC_API_URL` at the ngrok URL (and keep the Paystack/Twilio webhook URLs pointed there too).

## Running tests

The suite runs against a dedicated `mctaba_shop_test` database — it refuses to run anywhere else, so your dev data is never touched.

```bash
# One-time setup: create the test database and apply the schema
# (run as a Postgres superuser, e.g. the postgres account)
psql -U postgres -d postgres -c "CREATE DATABASE mctaba_shop_test;"
psql -U postgres -d postgres -c "ALTER DATABASE mctaba_shop_test OWNER TO <db-user>;"

psql "postgresql://<db-user>:<password>@localhost:5432/mctaba_shop_test" -f server/schema.sql

# Server tests — payment settlement, order lifecycle, checkout,
# webhook signature verification, admin auth (28 tests)
cd server
npm test

# Storefront tests — cart logic (9 tests)
npm test
```

## Payment flow

1. Checkout creates the order and reserves stock inside a database transaction
2. The customer pays on Paystack's hosted page
3. The browser returns to `/api/paystack/verify` (settles the order) and is redirected to the order page
4. The signed webhook independently confirms the charge (idempotent — safe if both run)
5. A WhatsApp confirmation is sent to the customer's phone
