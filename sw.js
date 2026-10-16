// Service Worker: يخلّي التطبيق يشتغل بدون إنترنت.
// بيعرض النسخة المحفوظة فوراً وبيحدّثها بالخلفية (التحديث بيظهر عند الفتح اللي بعده).
const V = 'medcards-v1';
const FILES = ['./', 'index.html', 'app.css', 'fa.css', 'fa-solid-900.woff2', 'dexie.min.js',
  'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(V);
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || new Response('Offline', { status: 503 });
  })());
});
