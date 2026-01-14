/**
 * Server-side push notification configuration.
 * Provides VAPID keys from environment variables.
 */

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
  subject: string;
}

/**
 * Get VAPID keys from environment variables.
 * Throws error if keys are not configured.
 */
export function getVapidKeys(): VapidKeys {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      'VAPID keys not configured. Run scripts/generate-vapid-keys.js and add keys to .env.local'
    );
  }

  return {
    publicKey,
    privateKey,
    subject,
  };
}

/**
 * Get public VAPID key for client-side use.
 */
export function getPublicVapidKey(): string {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error('VAPID public key not configured');
  }

  return publicKey;
}
