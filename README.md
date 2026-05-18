# Smart Finance

Smart Finance is a full-stack personal finance and admin management platform built as a monorepo with a separate frontend and backend.

It includes user authentication, wallets, income and expense tracking, budgets, savings goals, debts, receipts, reports, notifications, groups, currencies, AI insights, and an admin dashboard for platform-wide monitoring and configuration.

## Overview

- `frontend`: Next.js app for all user and admin UI
- `backend`: custom Node.js API runtime with Prisma and MySQL
- `prisma`: schema, migration, and seed flow live under `backend/prisma`
- `uploads`: backend serves uploaded files from its configured upload directory

## Main Features

- Email/password authentication
- Optional email verification flow
- User profile and avatar upload
- Wallet management with currency support
- Income and expense tracking
- Transaction filtering, search, and exports
- Budget planning
- Savings goals and contributions
- Debt tracking and payments
- Receipt and attachment uploads
- Recurring finance entries
- Group and invite-based collaboration
- In-app notifications and live updates
- Reports and dashboard analytics
- AI insights module
- Admin dashboard, users, finance, activity, platform, and site settings

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
- JWT/session-based auth utilities
- Nodemailer
- Zod validation

## Project Structure

```text
smart_finance/
|-- frontend/                   # Next.js frontend app
|   |-- app/                    # App Router pages
|   |-- components/             # Dashboard, auth, UI components
|   |-- lib/                    # Frontend helpers and API client code
|   `-- public/                 # Static assets
|-- backend/                    # Custom API server
|   |-- app/api/                # File-based API routes
|   |-- config/                 # Runtime environment config
|   |-- lib/                    # Business logic, auth, helpers
|   |-- prisma/                 # Prisma schema, migrations, seed
|   |-- api/                    # Vercel function entry
|   `-- server.js               # Local/VM backend server entry
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
- `/dashboard/admin/access`
- `/dashboard/admin/collaboration`
- `/dashboard/admin/integrity`

## API Overview

Backend routes are located in [backend/app/api](/d:/project/smart_finance/backend/app/api) and cover:

- `auth`
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

- [frontend/.env.example](/d:/project/smart_finance/frontend/.env.example) -> `frontend/.env`
- [backend/.env.example](/d:/project/smart_finance/backend/.env.example) -> `backend/.env`

### 3. Set backend environment

At minimum, configure:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `AUTH_SECRET`
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
UPLOADS_ROOT="/app/backend/storage/uploads"

APP_URL="https://app.example.com"
AUTH_SECRET="replace-with-a-long-random-secret-at-least-32-characters"
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

## Database

Prisma files live in [backend/prisma](/d:/project/smart_finance/backend/prisma).

Important files:

- [schema.prisma](/d:/project/smart_finance/backend/prisma/schema.prisma)
- [seed.cjs](/d:/project/smart_finance/backend/prisma/seed.cjs)
- [setup-legacy-mysql.cjs](/d:/project/smart_finance/backend/prisma/setup-legacy-mysql.cjs)

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

For stable production hosting, set a persistent `UPLOADS_ROOT`.

## Production

Production expectations:

- use real `https://` domains
- set a strong `AUTH_SECRET`
- run migrations before serving traffic
- use a persistent upload directory
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

This repo includes [ecosystem.config.cjs](/d:/project/smart_finance/ecosystem.config.cjs).

Start with:

```bash
pm2 start ecosystem.config.cjs
```

## Docker Deployment

Container deployment is available through:

- [docker-compose.production.yml](/d:/project/smart_finance/docker-compose.production.yml)
- [frontend/Dockerfile](/d:/project/smart_finance/frontend/Dockerfile)
- [backend/Dockerfile](/d:/project/smart_finance/backend/Dockerfile)

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
- use [frontend/vercel.json](/d:/project/smart_finance/frontend/vercel.json)
- use [backend/vercel.json](/d:/project/smart_finance/backend/vercel.json)
- backend is adapted for Vercel through [backend/api/index.js](/d:/project/smart_finance/backend/api/index.js) and [backend/lib/vercel-handler.js](/d:/project/smart_finance/backend/lib/vercel-handler.js)

### Frontend Vercel project

- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`

Required env:

- `APP_URL=https://your-frontend-domain`
- `NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain`
- `INTERNAL_API_BASE_URL=https://your-backend-domain`

### Backend Vercel project

- Root Directory: `backend`
- Framework Preset: `Other`
- Install Command: `npm install`
- Build Command: `npm run build`

Required env:

- `NODE_ENV=production`
- `AUTH_SECRET=strong-secret-at-least-32-chars`
- `FRONTEND_URL=https://your-frontend-domain`
- `APP_URL=https://your-frontend-domain`
- `CORS_ORIGIN=https://your-frontend-domain`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- or `DATABASE_URL`

### Vercel deploy order

1. Deploy `backend`
2. Copy the backend production domain
3. Add that backend domain to the frontend env vars
4. Deploy `frontend`

### Important Vercel upload note

Vercel local filesystem storage is not persistent. Uploads may not survive redeploys or instance recycling. For durable production uploads on Vercel, use external storage such as S3, Cloudinary, or Vercel Blob.

## Notes

- `smart_finance_front_push` exists in the repo as a deployment copy/work area
- the main active app folders are `frontend` and `backend`
- frontend rewrites API calls to the backend using its configured base URL
- backend runtime validates production environment variables before start

## License

This project currently has no explicit license file in the repository.
