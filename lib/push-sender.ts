/**
 * Server-side push notification sender.
 * Handles sending Web Push notifications to subscribed users.
 */

import webpush from 'web-push';
import { getVapidKeys } from './push-notifications';

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
}

export interface SendResult {
  successful: string[];
  failed: string[];
  expired: string[];
}

/**
 * Send push notifications to multiple subscriptions.
 * Returns lists of successful, failed, and expired subscription IDs.
 */
export async function sendPushNotifications(
  subscriptions: PushSubscription[],
  payload: NotificationPayload
): Promise<SendResult> {
  const vapidKeys = getVapidKeys();

  // Setup.
  webpush.setVapidDetails(
    vapidKeys.subject,
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  const result: SendResult = {
    successful: [],
    failed: [],
    expired: [],
  };

  // Act.
  const promises = subscriptions.map(async (sub) => {
    try {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key,
        },
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );

      result.successful.push(sub.id);
    } catch (error: any) {
      // Assert.
      // Handle expired/invalid subscriptions (410 Gone, 404 Not Found).
      if (error.statusCode === 410 || error.statusCode === 404) {
        result.expired.push(sub.id);
      } else {
        console.error(`Failed to send notification to ${sub.user_id}:`, error);
        result.failed.push(sub.id);
      }
    }
  });

  await Promise.all(promises);

  return result;
}
