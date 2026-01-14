/**
 * Custom service worker with push notification support.
 * This extends the default next-pwa service worker.
 */

// Import the default Workbox configuration
// @ts-ignore
importScripts('/workbox-4754cb34.js');

// Add push notification handlers
self.addEventListener('push', (event) => {
  try {
    let data = { title: 'New notification', body: '' };

    if (event.data) {
      data = event.data.json();
    }

    const options = {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: {
        url: data.url || '/',
      },
      tag: 'wordle-notification',
      requireInteraction: false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
