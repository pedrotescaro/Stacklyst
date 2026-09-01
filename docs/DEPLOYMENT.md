# Deployment Guide — Stacklyst

This guide details steps to deploy Stacklyst to Vercel (Front-end & API) and Supabase (PostgreSQL Database).

---

## 1. Database Setup (Supabase)

1. Create a new project on the [Supabase Dashboard](https://supabase.com).
2. Go to **Project Settings > Database** to copy your connection strings:
   - **Transaction Connection String:** (transaction pooling, port 6543) for application runtime.
   - **Direct Connection String:** (direct or session mode, port 5432) for running migrations.

---

## 2. Environment Variables

Create your environment variables on Vercel. Ensure to supply:

| Variable Name                          | Description                                        | Example / Recommended Value                            |
| -------------------------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`                         | Supabase transaction connection string             | `postgres://postgres.xxx:6543/postgres?pgbouncer=true` |
| `DIRECT_URL`                           | Supabase direct connection string                  | `postgres://postgres.xxx:5432/postgres`                |
| `DATABASE_POOL_MAX`                    | Connections per serverless instance                | `1`                                                    |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                               | `https://xxxx.supabase.co`                             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key                           | `sb_publishable_...`                                   |
| `SUPABASE_SECRET_KEY`                  | Supabase server-only key (secure API access)       | `sb_secret_...`                                        |
| `UPSTASH_REDIS_REST_URL`               | Upstash Redis REST endpoint for rate limiting      | `https://xxxx.upstash.io`                              |
| `UPSTASH_REDIS_REST_TOKEN`             | Upstash Redis authorization token                  | `<redis_token>`                                        |
| `CRON_SECRET`                          | Authorization header token for daily cron requests | `super-secret-guid`                                    |
| `SEED_DEFAULT_PASSWORD`                | Fallback user password for database seeding        | `ChangeMe123!`                                         |

Legacy projects can use `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` instead. Never expose the secret/service-role key
with a `NEXT_PUBLIC_` prefix.

The runtime reads `DATABASE_URL` first, while Prisma CLI commands read
`DIRECT_URL` first. On Vercel, do not point `DATABASE_URL` at Supavisor session
mode (port 5432): serverless instances can exhaust its client limit. Use the
transaction pooler on port 6543 and keep `DATABASE_POOL_MAX=1` unless capacity
testing justifies a larger value.

Configure Upstash in production to enforce shared request limits across all
serverless instances. Without it, the application falls back to an in-memory
limiter that only protects each running instance.

---

## 3. Deployment Steps

The repository includes `vercel.json` with Fluid Compute enabled and the
single Hobby function region set to `gru1` (Sao Paulo). Keep the Supabase
project in `sa-east-1` so authenticated requests do not cross continents
between the application and the database. Static assets remain globally
distributed by Vercel's CDN.

### Step 1: Initialize Database Schema

From your local terminal, point to the production database and run:

```bash
npx prisma db push
```

This syncs the Prisma models (including `User`, `Post`, `Reaction`, `QuizLibrary`) to PostgreSQL without losing existing data.

### Step 2: Seed Static Data

Execute the seed script to populate 20 tech quizzes inside `QuizLibrary`:

```bash
npx prisma db seed
```

### Step 3: Deploy to Vercel

1. Link the repository to the canonical Vercel project, `stacklyst`.
2. Keep the framework preset as **Next.js** and the Node.js runtime on 22 or
   newer. The current project uses Node.js 24.
3. Keep the default build command, `npm run build`. The `postinstall` script
   already runs `prisma generate` before the build.
4. Set the Environment Variables for Production and Preview.
5. Deploy the `main` branch to Production. The canonical Hobby URL is
   `https://stacklyst.vercel.app`.

---

## 4. Automating the Curated Daily Quiz

To publish a new quiz from `QuizLibrary` every day without an AI request:

1. The endpoint `/api/admin/quiz/generate-daily` processes daily generation requests.
2. In production, configure a cron scheduler (such as Vercel Cron Jobs, GitHub Actions, or Upstash QStash) to send a POST request:
   - **URL:** `https://your-domain.vercel.app/api/admin/quiz/generate-daily`
   - **Headers:** `Authorization: Bearer <CRON_SECRET>`
   - **Schedule:** `0 6 * * *` (Every day at 06:00 UTC)
