/* Offline shell. Network first (so a redeploy is never hidden behind a stale cache), cache as the fallback.
   The shell and the QR reader are cached on install, so the door scanner still works with a weak signal. */
const V = 'wte-v6';
const SHELL = ['./', 'index.html', 'css/base.css?v=6', 'css/ui.css?v=6', 'css/attendee.css?v=6', 'css/studio.css?v=6', 'css/app.css?v=6',
  'js/vendor/qrcode.min.js', 'js/vendor/jsQR.min.js', 'assets/fonts/IRANYekanX-FaNum-VF.woff2', 'assets/fonts/IRANYekanX-VF.woff2'];
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.headers.has('range')) return;                 // video streaming — let the browser handle it
  const path = new URL(r.url).pathname;
  e.respondWith(
    /* code and pages revalidate every time, so a deploy never mixes old CSS with new JS */
    fetch(r, /\.(js|css|html|webmanifest)$|\/$/.test(path) ? { cache: 'no-cache' } : undefined).then((res) => {
      if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)); }
      return res;
    }).catch(async () => (await caches.match(r))
      || (await caches.match(r, { ignoreSearch: true }))
      || (r.mode === 'navigate' ? (await caches.match('./')) || caches.match('index.html') : Response.error()))
  );
});
