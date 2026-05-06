# Finance Tracker

This repo is now split into two independent app roots:

- [frontend](D:/project/smart_finance/frontend): Next.js UI, pages, components, public assets
- [backend](D:/project/smart_finance/backend): plain Node.js API app, Prisma schema, seed, migrations, auth, mail, finance logic

## Setup

1. Configure [frontend/.env.example](D:/project/smart_finance/frontend/.env.example) into `frontend/.env`.
2. Configure [backend/.env.example](D:/project/smart_finance/backend/.env.example) into `backend/.env`.
3. Update database credentials in `backend/.env` using:
   `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
4. Run:

```bash
npm install
npm run db:setup
npm run dev
npm run dev:backend
```

## Structure

- Frontend serves only UI routes on port `3001`.
- Backend serves `/api/*` on port `4000` with a Next-free runtime.
- Frontend calls backend through `NEXT_PUBLIC_API_BASE_URL`.
- Prisma schema, migrations, seed, and DB bootstrap now live under [backend/prisma](D:/project/smart_finance/backend/prisma).

## Commands

```bash
npm run dev
npm run dev:backend
npm run build
npm run lint
npm run check:env
npm run db:generate
npm run db:setup
```

Direct package commands:

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix backend run dev
npm --prefix backend run db:generate
npm --prefix backend run db:setup
```

## Production

Required production expectations:

- `frontend/.env` and `backend/.env` must use real `https://` domains, not `localhost`
- `AUTH_SECRET` must be a strong unique secret with at least 32 characters
- backend uploads should use a persistent path through `UPLOADS_ROOT`
- run database migrations before traffic

Validation and release commands:

```bash
npm run check:env
npm run build
npm run db:migrate
npm run start:backend
npm run start:frontend
```

PM2 option:

```bash
pm2 start ecosystem.config.cjs
```

Docker option:

```bash
docker compose -f docker-compose.production.yml up --build -d
```
