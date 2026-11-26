// PWA-UPDATE-SYSTEM v1: auto-update, version banner, Check for updates. Do not remove this line.
// Elastic Loop service worker.
// Keeps the app working offline and installs new versions safely.
// It only ever touches its own caches ("elasticloop-..."); localStorage, IndexedDB and
// saved profiles live outside the cache and are never cleared by an update.
const VERSION = '1.0.0';
const CACHE = 'elasticloop-' + VERSION;
const OLD_CACHES = ['elasticloop-v2'];
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];
const CDN = [];

self.addEventListener('install', e => {
  // cache:'reload' skips the browser's HTTP cache, so a new version never installs stale files.
  e.waitUntil(caches.open(CACHE).then(c => Promise.all([
    ...SHELL.map(u => fetch(new Request(u, { cache: 'reload' })).then(r => { if (!r.ok) throw new Error(u + ' ' + r.status); return c.put(u, r); })),
    ...CDN.map(u => c.add(u).catch(() => null))
  ])));
  // No skipWaiting here: the page asks the user first (unless this is the very first install).
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data && e.data.type === 'GET_VERSION' && e.ports[0]) e.ports[0].postMessage({ version: VERSION });
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => (k.startsWith('elasticloop-') && k !== CACHE) || OLD_CACHES.includes(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function fromNetwork(req, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(req).then(r => { clearTimeout(t); resolve(r); }, err => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // The version file is always fetched live so update checks are never fooled by a cache.
  if (url.origin === location.origin && url.pathname.endsWith('/version.json')) return;
  // Pages: network first (revalidated, never a stale HTTP-cached copy), cache as the offline fallback.
  if (req.mode === 'navigate') {
    e.respondWith(fromNetwork(new Request(url.href, { cache: 'no-cache', credentials: 'same-origin' }), 6000)
      .then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); } return r; })
      .catch(() => caches.match('./index.html', { cacheName: CACHE }).then(r => r || caches.match('./index.html'))));
    return;
  }
  const same = url.origin === location.origin;
  const cdn = /fonts\.(googleapis|gstatic)\.com/.test(url.host);
  if (!same && !cdn) return;
  // Own files (icons, manifest): from this version's cache, else network. Versioned CDN files: cache first.
  e.respondWith(caches.match(req, { cacheName: CACHE }).then(hit => hit || caches.match(req)).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
