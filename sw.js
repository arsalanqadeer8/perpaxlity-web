const CACHE_NAME = 'oxford-cache-v3';

const PRECACHE_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'favicon.png',
  'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install: pre-cache application shell and core CDN libraries
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use individual promises so a single CDN network hiccup doesn't abort the entire install
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) => cache.add(url))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: purge older cache versions and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: smart caching strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // 1. Never intercept non-GET requests
  if (req.method !== 'GET') {
    return;
  }

  // 2. Never cache dynamic Supabase REST API or Auth requests (always live network)
  if (url.includes('.supabase.co/rest/') || url.includes('.supabase.co/auth/') || url.includes('/realtime/')) {
    return;
  }

  // 3. HTML Navigation requests: Network-First with quick timeout, fallback to cached index.html
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      (async () => {
        try {
          // Attempt network fetch with 3s timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), 3000)
          );
          const networkRes = await Promise.race([fetch(req), timeoutPromise]);
          if (networkRes && networkRes.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, networkRes.clone());
            return networkRes;
          }
        } catch (err) {
          // Offline or network timeout - fallback to cached document
        }

        const cached = await caches.match(req) || await caches.match('./') || await caches.match('index.html');
        if (cached) return cached;
        return new Response('Offline: Oxford Academy is running without connection.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })()
    );
    return;
  }

  // 4. Static assets (JS, CSS, Fonts, Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return networkRes;
      }).catch(() => {
        // Network failed (offline)
        return null;
      });

      // Return cached asset immediately if available, otherwise wait for network
      return cached || fetchPromise;
    })
  );
});

/* -------------------- PUSH NOTIFICATIONS -------------------- */
self.addEventListener('push', function(event) {
  if (event.data) {
    let data;
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Notification', body: event.data.text() };
    }

    const title = data.title || 'Oxford Academy Update';
    const options = {
      body: data.body || 'You have a new message.',
      icon: data.icon || 'favicon.png',
      badge: 'favicon.png',
      data: data.url || '/'
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === event.notification.data && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data);
      }
    })
  );
});
