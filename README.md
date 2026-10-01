# SUCF Uniuyo Membership Portal

Next.js + Supabase + Resend. Public registration form at `/`, admin dashboard at `/admin`.

## Setup
1. Create a free project at supabase.com. In its SQL editor, run `supabase/schema.sql`.
2. Copy `.env.example` to `.env.local` and fill in every value (Supabase URL and service role key are under Project Settings > API). Choose your own strong `ADMIN_PASSWORD`.
3. `npm install` then `npm run dev`, and open http://localhost:3000

## Deploy (GitHub + Vercel)
1. Push this folder to a GitHub repository. `.env.local` is git-ignored, so your secrets stay off GitHub.
2. On vercel.com choose "Add New Project", import the repository, and add the same values from `.env.local` under Environment Variables.
3. Deploy.

## Email (Gmail)
Emails are sent from the fellowship Gmail account.
1. Sign in to that Gmail account and turn on 2-Step Verification (Google Account > Security).
2. In Google Account, search for "App passwords", create one named "SUCF site", and copy the 16-letter password.
3. Set `GMAIL_USER` to the Gmail address and `GMAIL_APP_PASSWORD` to that 16-letter password (no spaces).
Gmail allows about 500 emails a day, so send to a level or unit rather than everyone when the list is large.
