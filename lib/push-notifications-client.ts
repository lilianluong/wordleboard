/**
 * Client-side push notification manager.
 * Handles browser notification permissions and subscription management.
 */

/**
 * Check if push notifications are supported in this browser.
 */
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/**
 * Get current notification permission status.
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushNotificationSupported()) {
    return "denied";
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications not supported");
  }

  return await Notification.requestPermission();
}

/**
 * Convert VAPID public key to Uint8Array for subscription.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to push notifications.
 * Registers service worker and creates push subscription.
 */
export async function subscribeToPush(
  vapidPublicKey: string
): Promise<PushSubscription> {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications not supported");
  }

  // Setup.
  // Request permission if not already granted.
  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }

  // Act.
  // Register service worker.
  const registration = await navigator.serviceWorker.ready;

  // Check for existing subscription.
  let subscription = await registration.pushManager.getSubscription();

  // Create new subscription if none exists.
  if (!subscription) {
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });
  }

  // Assert.
  // Save subscription to backend.
  const response = await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription.toJSON()),
  });

  if (!response.ok) {
    throw new Error("Failed to save subscription");
  }

  return subscription;
}

/**
 * Unsubscribe from push notifications.
 * Removes subscription from browser and backend.
 */
export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushNotificationSupported()) {
    return;
  }

  // Setup.
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  // Act.
  // Remove from backend first.
  await fetch("/api/notifications/unsubscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
    }),
  });

  // Assert.
  // Unsubscribe from browser.
  await subscription.unsubscribe();
}

/**
 * Check if user is currently subscribed to push notifications.
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const response = await fetch("/api/notifications/status");
    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.subscribed;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
}
