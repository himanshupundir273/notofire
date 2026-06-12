# Legal Case Management System — Setup Guide

## 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) → New project
2. Copy your **Project URL** and **Anon Key** from Settings → API

## 2. Configure Environment

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## 3. Run Database Schema

In Supabase → SQL Editor, paste and run the contents of `supabase/schema.sql`.

## 4. Create Admin User

In Supabase → Authentication → Users → Add User:
- Email: your admin email
- Password: your secure password
- ✅ Auto Confirm User

## 5. Run the App

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

## URL Structure

| URL | Description |
|-----|-------------|
| `/login` | Admin login |
| `/admin` | Case dashboard |
| `/admin/case/CASEID` | Admin case view (full edit) |
| `/CASEID` | Public read-only case view |

Example public URL: `https://yoursite.com/MPHYAAT`

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add the same env vars in Vercel project settings.
