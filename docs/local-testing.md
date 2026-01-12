# Local Testing Guide

## Prerequisites

1. Node.js installed (you already have this!)
2. Supabase project set up
3. Environment variables configured

## Step-by-Step Testing

### 1. Set Up Environment Variables

1. Create a `.env.local` file in the project root (same level as `package.json`)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
- Go to Supabase Dashboard → Settings → API
- Copy the "Project URL" for `NEXT_PUBLIC_SUPABASE_URL`
- Copy the "anon public" key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Start the Development Server

Open a terminal in the project directory and run:

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 16.1.1
  - Local:        http://localhost:3000
  - Ready in X.Xs
```

### 3. Open the App

1. Open your browser and go to: `http://localhost:3000`
2. You should see the login page

### 4. Test Authentication

1. **Test Login:**
   - Enter your email address
   - Click "Send magic link"
   - Check your email (or Supabase dashboard → Authentication → Users to see the magic link)
   - Click the magic link in the email
   - You should be redirected back to the app and logged in

2. **Alternative: Manual Magic Link (if email doesn't work):**
   - Go to Supabase Dashboard → Authentication → Users
   - Create a user or use an existing one
   - Generate a magic link manually
   - The link format should be: `http://localhost:3000/api/auth/callback?code=TOKEN&next=/`

### 5. Test Wordle Submission

1. Once logged in, click "Submit" in the navigation
2. Paste a Wordle result in the format:
   ```
   Wordle 1234 3/6

   ⬛🟨⬛⬛⬛
   🟨🟩⬛⬛⬛
   🟩🟩🟩🟩🟩
   ```
3. You should see a green "Parsed successfully!" message
4. Click "Submit"
5. You should see a success message and be redirected to the dashboard

### 6. Test Dashboard

1. On the dashboard (`http://localhost:3000`), you should see:
   - Today's Wordle number
   - All users' submissions for that Wordle
   - You can search for a specific Wordle number using the input field

### 7. Test Stats Page

1. Click "Stats" in the navigation
2. You should see:
   - A user selector dropdown
   - Statistics for the selected user (total games, win rate, average guesses, etc.)
   - Recent games list

## Troubleshooting

### "Unauthorized" errors
- Check that your `.env.local` file has the correct Supabase credentials
- Make sure you're logged in (check if you see "Sign Out" button)

### "Failed to fetch" errors
- Verify your Supabase project is running
- Check that the database schema was created (run `supabase/schema.sql`)
- Check browser console for detailed error messages

### Magic link not working
- Make sure you added `http://localhost:3000/api/auth/callback` to Supabase Redirect URLs
- Check that Site URL is set to `http://localhost:3000` in Supabase

### Database errors
- Go to Supabase Dashboard → SQL Editor
- Run the schema again from `supabase/schema.sql`
- Check that the `wordle_submissions` table exists

### Port already in use
If port 3000 is busy, Next.js will try the next available port (3001, 3002, etc.)
- Check the terminal output for the actual port
- Or specify a port: `npm run dev -- -p 3001`

## Quick Test Checklist

- [ ] Development server starts without errors
- [ ] Login page loads at `http://localhost:3000`
- [ ] Can send magic link (or create user manually)
- [ ] Can log in and see dashboard
- [ ] Can submit a Wordle result
- [ ] Dashboard shows the submission
- [ ] Stats page shows user statistics

## Next Steps After Local Testing

Once everything works locally:
1. Deploy to Vercel
2. Update Supabase Redirect URLs with your production URL
3. Test the production deployment
4. Add PWA icons (optional)
