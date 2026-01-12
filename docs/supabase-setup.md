# Supabase Setup Guide

## Step-by-Step Configuration

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in your project details:
   - Name: `wordleboard` (or your preferred name)
   - Database Password: Create a strong password (save this!)
   - Region: Choose closest to you
4. Click **Create new project** and wait for it to initialize (~2 minutes)

### 2. Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste it into the SQL Editor
5. Click **Run** (or press `Ctrl+Enter`)
6. You should see "Success. No rows returned" - this means the table was created successfully

### 3. Configure Authentication URLs

This is critical for magic link authentication to work!

1. In your Supabase dashboard, go to **Authentication** (left sidebar)
2. Click on **URL Configuration** (under Authentication settings)
3. You'll see two important sections:

   **Site URL:**
   - For development: `http://localhost:3000`
   - For production: `https://your-domain.vercel.app` (your actual Vercel URL)

   **Redirect URLs:**
   - Click **Add URL** and add these one by one:
     - `http://localhost:3000/api/auth/callback`
     - `https://your-domain.vercel.app/api/auth/callback` (replace with your actual domain)
   - You can add multiple URLs - one per line
   - These are the allowed callback URLs after users click magic links

4. Click **Save** at the bottom

### 4. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** (gear icon, left sidebar)
2. Click **API** (under Project Settings)
3. You'll see:
   - **Project URL**: Copy this (you'll need it for `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key: Copy this (you'll need it for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key: Keep this secret! Only use for admin operations

### 5. Configure Email Templates (Optional)

Since you're manually sending magic links, you can skip email template configuration. However, if you want to set up automatic emails later:

1. Go to **Authentication** → **Email Templates**
2. Customize the "Magic Link" template if desired
3. For now, you can leave defaults since you'll be generating links manually

## Testing Your Setup

After configuration, test that everything works:

1. Start your Next.js dev server: `npm run dev`
2. Try to sign in at `http://localhost:3000/login`
3. Check the Supabase dashboard → **Authentication** → **Users** to see if a user was created

## Troubleshooting

**"Invalid redirect URL" error:**
- Make sure you added the exact callback URL to Redirect URLs
- Check that there are no trailing slashes
- Ensure the URL matches exactly (including `http://` vs `https://`)

**Magic link not working:**
- Verify the callback URL is in the Redirect URLs list
- Check that your Site URL is set correctly
- Make sure you're using the correct environment variables

**Database errors:**
- Make sure you ran the schema.sql file completely
- Check that Row Level Security (RLS) is enabled on the table
- Verify the policies were created correctly
