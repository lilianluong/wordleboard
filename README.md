# Wordle Board

A Progressive Web App for tracking Wordle results for a private group of 5 people.

## Features

- 🔐 Email magic link authentication via Supabase
- 📊 Daily stats showing how everyone did on the Wordle
- 👤 Individual user statistics (average guesses, win rate, etc.)
- 📱 PWA installable on mobile and desktop
- 📋 Clipboard paste input for Wordle emoji grids
- ☁️ Serverless deployment on Vercel

## Setup

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Configure Auth Callback URLs:
   - In your Supabase dashboard, go to **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add the following URLs (one per line):
     - `http://localhost:3000/api/auth/callback` (for local development)
     - `https://your-domain.vercel.app/api/auth/callback` (replace with your actual Vercel domain)
   - Under **Site URL**, set it to:
     - `http://localhost:3000` (for development) or your production URL
   - Click **Save** to apply changes

### 2. Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Found in Project Settings > API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in Project Settings > API

### 3. PWA Icons

Generate PWA icons and place them in `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

You can use a tool like [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) or create them manually.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Manual Magic Link Generation

Since email service is not configured, you can generate magic links manually:

1. Use Supabase Dashboard > Authentication > Users
2. Or use the Supabase Admin API to generate tokens
3. Send the links manually to your group members

The magic link format is:
```
https://your-domain.vercel.app/api/auth/callback?code=TOKEN&next=/
```

## Usage

1. Users sign in with their email via magic link
2. Paste Wordle emoji grid on the Submit page
3. View daily stats on the Dashboard
4. View individual stats on the Stats page

## Wordle Grid Format

The app expects the standard Wordle share format:

```
Wordle 1234 3/6

⬛🟨⬛⬛⬛
🟨🟩⬛⬛⬛
🟩🟩🟩🟩🟩
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **PWA**: next-pwa
- **Language**: TypeScript

## License

MIT
