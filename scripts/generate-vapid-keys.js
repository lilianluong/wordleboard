#!/usr/bin/env node

/**
 * Generates VAPID keys for Web Push notifications.
 * Run this once and add the output to your .env.local file.
 */

const webpush = require('web-push');

console.log('Generating VAPID keys...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Add these to your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);
console.log('\nIMPORTANT: Replace "your-email@example.com" with your actual email address.');
console.log('\nFor Vercel deployment, add these as environment variables in your project settings.');
