// ServiX Service Worker — v2 (network-first, cache-busting)
const CACHE = 'servix-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;

  // Never cache external APIs — always go live
  if (url.includes('supabase') || url.includes('tomtom') ||
      url.includes('googleapis') || url.includes('jsdelivr') ||
      url.includes('unpkg')) return;

  // Network-first for our own files: always try fresh, fall back to cache only if offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
