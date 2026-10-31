/* Offline shell. Network first (so a redeploy is never hidden behind a stale cache), cache as the fallback. */
const V = 'wte-v3';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.headers.has('range')) return;                 // video streaming — let the browser handle it
  e.respondWith(
    /* code and pages revalidate every time, so a deploy never mixes old CSS with new JS */
    fetch(r, /\.(js|css|html|webmanifest)$|\/$/.test(new URL(r.url).pathname) ? { cache: 'no-cache' } : undefined).then((res) => {
      if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)); }
      return res;
    }).catch(() => caches.match(r).then((m) => m || caches.match('index.html')))
  );
});
