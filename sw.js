/* hustler service worker — build de8619b7 */
const CACHE = 'hustler-de8619b7';
const SHELL = ["./", "index.html", "manifest.webmanifest", "fonts.css", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-192.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "fonts/space-grotesk-latin-400-normal.woff2", "fonts/space-grotesk-latin-500-normal.woff2", "fonts/space-grotesk-latin-600-normal.woff2", "fonts/space-grotesk-latin-700-normal.woff2", "fonts/space-grotesk-latin-ext-400-normal.woff2", "fonts/space-grotesk-latin-ext-500-normal.woff2", "fonts/space-grotesk-latin-ext-600-normal.woff2", "fonts/space-grotesk-latin-ext-700-normal.woff2", "fonts/space-grotesk-vietnamese-400-normal.woff2", "fonts/space-grotesk-vietnamese-500-normal.woff2", "fonts/space-grotesk-vietnamese-600-normal.woff2", "fonts/space-grotesk-vietnamese-700-normal.woff2"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('hustler-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // App shell, NETWORK FIRST (Cycle 4): always try for the newest copy so you never get an older version of a screen.
    // If the network is slow (over 2.5 s) or offline, the saved copy is used, so it still works with no signal.
    e.respondWith(caches.open(CACHE).then(async c => {
      const saved = async () => (await c.match(req, {ignoreSearch:true})) || (await c.match('./index.html'));
      const net = fetch(req, {cache:'no-cache'}).then(r => { if (r && r.ok) { c.put('./index.html', r.clone()); return r; } return null; }).catch(() => null);
      const timer = new Promise(res => setTimeout(() => res(null), 2500));
      const fresh = await Promise.race([net, timer]);
      return fresh || (await saved()) || (await net) || Response.error();
    }));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch:true}).then(hit => hit || fetch(req).then(r => {
    if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
