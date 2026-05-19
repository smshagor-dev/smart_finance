# Smart Finance

Smart Finance is a full-stack finance tracking and admin operations platform built as a monorepo with separate `frontend` and `backend` apps.

It includes personal finance tracking, receipts and attachments, group collaboration, dynamic site settings, provider-managed authentication, onboarding flows, admin analytics, and production-ready upload handling.

## Overview

- `frontend`: Next.js app for user and admin UI
- `backend`: custom Node.js API runtime with Prisma and MySQL
- `backend/prisma`: schema, migrations, and seed flow
- `backend/storage/uploads`: default persistent upload directory

## Main Features

- Email/password authentication
- Social authentication with Google, Facebook, and Telegram
- Unified auth session flow across email and social providers
- Email verification and social email-completion flow
- Default currency onboarding before dashboard access
- Dynamic auth provider management from the admin panel
- User profile and avatar upload
- Wallet management with currency support
- Income, expense, transfer, and recurring finance tracking
- Transaction filtering, search, summaries, and exports
- Budget planning
- Savings goals and contributions
- Debt tracking and payments
- Receipt and attachment uploads
- Group and invite-based collaboration
- In-app notifications and live updates
- Reports and dashboard analytics
- AI insights module
- Admin dashboard, users, activity, finance, integrity, collaboration, platform, and site settings

## Tech Stack

### Frontend

- Next.js 16
- React 19
- Tailwind CSS 4
- Recharts
- Sonner
- Lucide React

### Backend

- Node.js
- Prisma
- MySQL
- Cookie/session-based auth utilities
- Nodemailer
- Zod validation

## Project Structure

```text
smart_finance/
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- lib/
|   `-- public/
|-- backend/
|   |-- app/api/
|   |-- config/
|   |-- lib/
|   |-- prisma/
|   |-- storage/uploads/
|   |-- api/
|   `-- server.js
|-- docker-compose.production.yml
|-- ecosystem.config.cjs
`-- package.json
```

## App Areas

### Public routes

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/verify-email`

### User dashboard

- `/dashboard`
- `/dashboard/income`
- `/dashboard/expenses`
- `/dashboard/transactions`
- `/dashboard/wallets`
- `/dashboard/categories`
- `/dashboard/budgets`
- `/dashboard/savings-goals`
- `/dashboard/debts`
- `/dashboard/receipts`
- `/dashboard/recurring`
- `/dashboard/reports`
- `/dashboard/profile`
- `/dashboard/settings`
- `/dashboard/notifications`
- `/dashboard/currencies`
- `/dashboard/groups`
- `/dashboard/ai-insights`

### Admin dashboard

- `/dashboard/admin`
- `/dashboard/admin/users`
- `/dashboard/admin/activity`
- `/dashboard/admin/finance`
- `/dashboard/admin/platform`
- `/dashboard/admin/site-settings`
- `/dashboard/admin/auth-providers`
- `/dashboard/admin/access`
- `/dashboard/admin/collaboration`
- `/dashboard/admin/integrity`

## API Overview

Backend routes are located in `backend/app/api` and cover:

- `auth`
- `auth/providers`
- `auth/google`
- `auth/facebook`
- `auth/telegram`
- `auth/complete-email`
- `profile`
- `wallets`
- `categories`
- `transactions`
- `budgets`
- `savings-goals`
- `savings-contributions`
- `debts`
- `debt-payments`
- `receipts`
- `uploads/attachments`
- `notifications`
- `groups`
- `currencies`
- `dashboard/overview`
- `dashboard/reports`
- `exports/csv`, `exports/excel`, `exports/json`, `exports/pdf`
- `admin/*`
- `public/site-settings`
- `public/currencies`
- `live`

## Requirements

- Node.js 20+ recommended
- npm
- MySQL database

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment files

Create these files from the examples:

- `frontend/.env.example` -> `frontend/.env`
- `backend/.env.example` -> `backend/.env`

### 3. Set backend environment

At minimum, configure:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `AUTH_SECRET`
- `AUTH_PROVIDER_SECRET_ENCRYPTION_KEY`
- `FRONTEND_URL`
- `APP_URL`
- `CORS_ORIGIN`

### 4. Set frontend environment

At minimum, configure:

- `NEXT_PUBLIC_API_BASE_URL`
- `INTERNAL_API_BASE_URL`
- `APP_URL`

### 5. Generate schema and seed the database

```bash
npm run db:setup
```

### 6. Start the apps

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run dev:backend
```

Default local ports:

- frontend: `3001`
- backend: `4000`

## Root Commands

```bash
npm run dev
npm run dev:backend
npm run build
npm run lint
npm run check:env
npm run db:generate
npm run db:setup
npm run db:migrate
npm run db:seed
```

## Direct Package Commands

### Frontend

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run start
npm --prefix frontend run lint
```

### Backend

```bash
npm --prefix backend run dev
npm --prefix backend run build
npm --prefix backend run start
npm --prefix backend run db:generate
npm --prefix backend run db:migrate
npm --prefix backend run db:seed
npm --prefix backend run db:setup
```

## Environment Variables

### Frontend example

```env
FRONTEND_HOST="0.0.0.0"
FRONTEND_PORT="3001"
NEXT_PUBLIC_API_BASE_URL="https://api.example.com"
INTERNAL_API_BASE_URL="https://api.example.com"
APP_URL="https://app.example.com"
```

### Backend example

```env
NODE_ENV="production"

DB_PROTOCOL="mysql"
DB_HOST="db.example.internal"
DB_PORT="3306"
DB_NAME="finance_tracker"
DB_USER="finance_user"
DB_PASSWORD="replace-with-a-strong-password"

BACKEND_HOST="0.0.0.0"
BACKEND_PORT="4000"
FRONTEND_URL="https://app.example.com"
CORS_ORIGIN="https://app.example.com"
TRUST_PROXY="true"

APP_URL="https://app.example.com"
AUTH_SECRET="replace-with-a-long-random-secret-at-least-32-characters"
AUTH_PROVIDER_SECRET_ENCRYPTION_KEY="replace-with-a-different-strong-random-secret-at-least-32-characters"
SESSION_COOKIE_DOMAIN=".example.com"
SESSION_COOKIE_SAME_SITE="Lax"
SESSION_COOKIE_SECURE="true"
MAX_REQUEST_SIZE_MB="12"
REQUEST_TIMEOUT_MS="30000"
KEEP_ALIVE_TIMEOUT_MS="5000"
HEADERS_TIMEOUT_MS="60000"
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX_REQUESTS="300"
AUTH_RATE_LIMIT_MAX_REQUESTS="10"

EXCHANGE_RATE_API_KEY="replace-with-your-exchange-rate-api-key"
EXCHANGE_RATE_BASE_URL="https://v6.exchangerate-api.com/v6"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
SMTP_FORCE_DELIVERY="false"
```

## Authentication Providers

Provider credentials are managed from the database and admin panel, not from provider-specific `.env` keys.

Supported providers:

- Google OAuth
- Facebook OAuth
- Telegram Login

Important:

- keep `AUTH_PROVIDER_SECRET_ENCRYPTION_KEY` configured in backend env
- secrets are encrypted before database storage
- callback and redirect URLs are managed from the admin UI

## Database

Prisma files live in `backend/prisma`.

Important files:

- `backend/prisma/schema.prisma`
- `backend/prisma/seed.cjs`
- `backend/prisma/setup-legacy-mysql.cjs`

Useful commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:seed
npm run db:setup
```

## Uploads

Uploads are handled by the backend and served through:

- `/uploads/*`
- `/api/profile/avatar`
- `/api/uploads/attachments`
- `/api/receipts`
- `/api/admin/site-assets`

Default storage path:

- `backend/storage/uploads`

Files are served to the frontend through:

- `/uploads/{bucket}/{filename}`

For VPS or PM2 deployment, the default path is already usable as long as it stays writable and persistent.

## Production

Production expectations:

- use real `https://` domains
- set a strong `AUTH_SECRET`
- set a strong `AUTH_PROVIDER_SECRET_ENCRYPTION_KEY`
- run migrations before serving traffic
- keep upload storage persistent and writable
- verify `FRONTEND_URL`, `APP_URL`, and `CORS_ORIGIN`

Validation and startup:

```bash
npm run check:env
npm run build
npm run db:migrate
npm run start:backend
npm run start:frontend
```

## PM2 Deployment

This repo includes `ecosystem.config.cjs`.

Start with:

```bash
pm2 start ecosystem.config.cjs
```

Typical manual PM2 flow:

```bash
npm install
npm run check:env
npm run build
npm run db:migrate
pm2 start npm --name smart-finance-backend -- run start:backend
pm2 start npm --name smart-finance-frontend -- run start:frontend
pm2 save
```

## Docker Deployment

Container deployment is available through:

- `docker-compose.production.yml`
- `frontend/Dockerfile`
- `backend/Dockerfile`

Run:

```bash
docker compose -f docker-compose.production.yml up --build -d
```

## Vercel Deployment

Vercel should be configured as two separate projects:

1. `frontend`
2. `backend`

Important:

- Vercel does not deploy this repo by running the Dockerfiles
- use `frontend/vercel.json`
- use `backend/vercel.json`
- backend is adapted for Vercel through `backend/api/index.js` and `backend/lib/vercel-handler.js`
- Vercel local filesystem storage is not persistent, so use external object storage there

## Notes

- the main active app folders are `frontend` and `backend`
- frontend resolves uploaded assets through the backend base URL
- backend runtime validates production environment variables before start
- uploaded files should live on persistent storage in production

## License

This project currently has no explicit license file in the repository.
