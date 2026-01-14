# Push Notifications Setup Guide

This guide walks you through setting up and testing push notifications for Wordle submissions.

## Prerequisites

- Node.js installed
- Supabase project configured
- `web-push` package installed (already done via `npm install`)

## Step 1: Generate VAPID Keys

VAPID keys are required for Web Push authentication.

```bash
node scripts/generate-vapid-keys.js
```

This will output three environment variables. Copy them to your `.env.local` file:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-public-key>
VAPID_PRIVATE_KEY=<your-private-key>
VAPID_SUBJECT=mailto:your-email@example.com
```

**Important:** Replace `your-email@example.com` with your actual email address.

## Step 2: Apply Database Migration

Apply the push subscriptions table migration to your Supabase database:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration SQL in Supabase dashboard
# File: supabase/migrations/20260113000000_add_push_subscriptions.sql
```

The migration creates the `push_subscriptions` table with proper RLS policies.

## Step 3: Rebuild the Application

Since we modified the service worker, rebuild the app:

```bash
npm run build
npm run dev
```

**Note:** The service worker (`public/sw.js`) includes push notification handlers. These are appended during development. After running `npm run build`, you may need to re-append the push handlers if they're not included in the generated service worker.

## Step 4: Test Locally

### Enable Notifications

1. Open your app in a browser (localhost:3000)
2. Log in with your account
3. Navigate to Profile page (`/profile`)
4. Toggle the "Push Notifications" switch to enable
5. Grant notification permission when prompted by the browser

### Test Notification Delivery

You need at least 2 users to test:

**User A (Receiver):**
1. Log in as User A
2. Enable notifications in Profile
3. Stay logged in or keep the browser/tab open

**User B (Submitter):**
1. Log in as User B in a different browser/incognito window
2. Navigate to Submit page (`/submit`)
3. Paste a Wordle grid and submit

**Expected Result:**
- User A should receive a push notification
- User B (submitter) should NOT receive a notification
- Notification text: `{username} completed Wordle #{number} in {score}`

### Troubleshooting

**No notification received:**
- Check browser console for errors
- Verify `push_subscriptions` table has an entry for User A
- Check server logs for notification sending errors
- Ensure service worker is registered (`navigator.serviceWorker.ready`)

**Permission denied:**
- Reset notification permission in browser settings
- Reload the page and try again

**iOS Safari:**
- Only works if app is installed to home screen (Add to Home Screen)
- Regular Safari browser tabs don't support push notifications

## Step 5: Deploy to Vercel

### Configure Environment Variables

In your Vercel project settings, add:

1. `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (same value as local)
2. `VAPID_PRIVATE_KEY` (same value as local)
3. `VAPID_SUBJECT` (same value as local)

### Deploy

```bash
git add .
git commit -m "Add push notifications"
git push origin main
```

Vercel will automatically deploy your changes.

### Test Production

1. Open your production URL (e.g., `yourapp.vercel.app`)
2. Enable notifications in Profile
3. Test with another user submitting a Wordle
4. Verify notifications work in production

## Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅ Full | ✅ Full |
| Firefox | ✅ Full | ✅ Full |
| Edge    | ✅ Full | ✅ Full |
| Safari  | ⚠️ macOS Ventura+ | ⚠️ iOS 16.4+ PWA only |

**Legend:**
- ✅ Full support
- ⚠️ Limited support (requires specific OS version or PWA install)

## Architecture Overview

### Client-Side Flow

1. User enables notifications in Profile
2. Browser requests notification permission
3. Service worker subscribes to push manager
4. Subscription saved to `push_subscriptions` table via `/api/notifications/subscribe`

### Server-Side Flow

1. User submits Wordle via POST `/api/submissions`
2. After successful submission, `sendNotificationsAsync()` runs
3. Fetches all subscriptions except submitter
4. Sends Web Push notification to each subscription
5. Cleans up expired subscriptions (410/404 responses)

### Components

**Client:**
- `/components/NotificationSettings.tsx` - UI toggle component
- `/lib/push-notifications-client.ts` - Browser notification manager
- `/public/sw.js` - Service worker with push event handlers

**Server:**
- `/lib/push-notifications.ts` - VAPID key configuration
- `/lib/push-sender.ts` - Web Push notification sender
- `/app/api/notifications/subscribe/route.ts` - Save subscription endpoint
- `/app/api/notifications/unsubscribe/route.ts` - Remove subscription endpoint
- `/app/api/notifications/status/route.ts` - Check subscription status
- `/app/api/submissions/route.ts` - Trigger notifications on submission

**Database:**
- `push_subscriptions` table - Stores user push subscriptions

## Maintenance

### Service Worker Updates

The service worker is auto-generated by `next-pwa`. Push notification handlers are appended to the generated file. If you run a fresh build, you may need to re-add the push handlers to `public/sw.js`:

```javascript
// Add this to the end of public/sw.js after build
self.addEventListener('push', function(event) {
  // ... push handler code
});

self.addEventListener('notificationclick', function(event) {
  // ... notification click handler code
});
```

Alternatively, configure `next-pwa` to use a custom service worker source that includes the push handlers.

### Cleaning Up Expired Subscriptions

The system automatically removes expired subscriptions when they return 410/404 errors. No manual cleanup needed.

### Rate Limiting

Consider adding rate limiting to notification endpoints to prevent abuse:
- `/api/notifications/subscribe` - Limit subscriptions per user
- Notification sending - Limit notifications per user per day

## Security Notes

- `VAPID_PRIVATE_KEY` must never be exposed to clients
- Only `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is safe for client-side use
- RLS policies ensure users can only manage their own subscriptions
- Notifications are sent asynchronously and don't block submissions

## Future Enhancements

- [ ] User preference to opt out of notifications
- [ ] Notification for specific Wordle numbers only
- [ ] Daily digest option instead of real-time
- [ ] Rich notifications with action buttons
- [ ] Notification history/log
- [ ] Quiet hours configuration
