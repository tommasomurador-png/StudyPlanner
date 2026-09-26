self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('studyplanner-v1').then((cache) => {
      return cache.addAll(['./index.html']);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

// Gestione del click sulla notifica per riaprire l'app
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./index.html');
            }
        })
    );
});

// Ricezione del comando per mostrare la notifica personalizzata con icona e badge
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const options = {
            body: event.data.body,
            icon: '1790418729575_cutout.png', // Icona grande nel pannello notifiche
            badge: '1790418729575_cutout.png', // Icona monocromatica per la barra di stato del telefono
            vibrate: [200, 100, 200]
        };
        event.waitUntil(
            self.registration.showNotification(event.data.title, options)
        );
    }
});
