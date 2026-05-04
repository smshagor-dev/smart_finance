# Finance Tracker

Next.js + Prisma + MySQL personal finance tracker with NextAuth authentication, live currency sync, and fully database-driven finance modules.

## Setup

1. Configure [.env.example](/d:/Public/Finance-Tracker/.env.example) values in `.env`.
2. Make sure MySQL has the database referenced by `DATABASE_URL`.
3. Run:

```bash
npm install
npm run db:setup
npm run dev
```

If you use `freesqldatabase.com` or another old MySQL 5.5 host, use the same `db:setup` command. It now bootstraps the schema through a legacy-safe SQL path instead of Prisma migrate.

## Notes

- The app now starts without demo users, wallets, transactions, budgets, debts, or sample analytics.
- The first registered user becomes `admin`.
- Currency data is seeded only for core availability and then refreshed from ExchangeRate API.
- All finance records are created dynamically by real user actions.
- Email verification codes are delivered through SMTP, so `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` must be configured before production signup is used.
- Local development and the default production start script run on port `3001`.
- If you serve the app behind Apache, use the included `.htaccess` to proxy requests to `127.0.0.1:3001` and make sure `mod_rewrite`, `mod_proxy`, `mod_proxy_http`, and `mod_headers` are enabled.
- Prisma migrations are stored in `prisma/migrations`, but very old MySQL 5.5 hosts do not support Prisma schema engine commands like `db pull`, `db push`, or `migrate deploy`.
- `freesqldatabase.com` currently reports MySQL `5.5.62`, which is below Prisma's supported MySQL range.
- Use a MySQL 5.6+ provider for full Prisma compatibility. Once you move, `npm run db:migrate` becomes the preferred deploy flow again.

## Main Routes

- `/login`
- `/register`
- `/forgot-password`
- `/dashboard`
- `/dashboard/settings`
- `/dashboard/profile`
- `/dashboard/currencies`

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run db:check
npm run db:generate
npm run db:migrate
npm run db:migrate:dev
npm run db:push
npm run db:legacy-setup
npm run db:seed
npm run db:setup
```
