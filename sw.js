const revision = "2e2aa57b900d1694";
const assets = ["ZXing-LICENSE.txt","assets/JsBarcode-q3uiGF5Y.js","assets/html2canvas-BwbSpAT5.js","assets/index-B3xk99yj.js","assets/index-CBIj5_wa.css","assets/index.es-DT1vlZY7.js","assets/purify.es-Dzkdzyfv.js","icon-192.png","icon-512.png","index.html","manifest.webmanifest","zxing.js"];
const cachePrefix = 'lagerpilot:' + self.registration.scope + ':';
const cacheName = cachePrefix + revision;
const scope = new URL(self.registration.scope);
const indexUrl = new URL('index.html', scope).href;
const known = new Set(assets.map(path => new URL(path, scope).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll([...known].map(url => new Request(url, {cache: 'reload'})));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => name.startsWith(cachePrefix) && name !== cacheName)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const asset = event.request.method === 'GET'
    ? (event.request.mode === 'navigate' && url.href === scope.href ? indexUrl : url.href)
    : null;

  event.respondWith((async () => {
    if (!asset || !known.has(asset)) return new Response(null, {status: 404});
    const cache = await caches.open(cacheName);
    return (await cache.match(asset)) || new Response(null, {status: 503});
  })());
});
