# Finance Tracker

Next.js + Prisma + MySQL personal finance tracker with NextAuth authentication, live currency sync, and fully database-driven finance modules.

## Setup

1. Configure [.env.example](/d:/Public/Finance-Tracker/.env.example) values in `.env`.
2. Make sure MySQL has a `finance_tracker` database.
3. Run:

```bash
npm install
npm run db:setup
npm run dev
```

## Notes

- The app now starts without demo users, wallets, transactions, budgets, debts, or sample analytics.
- The first registered user becomes `admin`.
- Currency data is seeded only for core availability and then refreshed from ExchangeRate API.
- All finance records are created dynamically by real user actions.
- Email verification codes are delivered through SMTP, so `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` must be configured before production signup is used.

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
npm run db:generate
npm run db:push
npm run db:seed
npm run db:setup
```
