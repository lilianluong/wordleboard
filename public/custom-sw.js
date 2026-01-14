/**
 * Custom service worker handlers for push notifications.
 * This file is loaded alongside the auto-generated service worker from next-pwa.
 */

// Handle push event.
self.addEventListener('push', (event) => {
  try {
    // Setup.
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

    // Act.
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// Handle notification click.
self.addEventListener('notificationclick', (event) => {
  // Setup.
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  // Act.
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Assert.
      // Check if there's already a window open.
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open a new window if none exists.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
