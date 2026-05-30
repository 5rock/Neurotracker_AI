/**
 * sw.js – Feature 9: PWA Service Worker
 * Cache-first strategy for static assets (JS/CSS bundles, fonts, icons).
 * Network-first for API calls. Graceful offline fallback to app shell.
 */

const CACHE_VERSION = 'neurotrack-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const SHELL_CACHE = `${CACHE_VERSION}-shell`;

const APP_SHELL = [
  '/',
  '/index.html',
];

// Patterns for static assets that should always be cached
const STATIC_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.svg$/,
  /\.png$/,
  /\.ico$/,
];

const isStaticAsset = (url) =>
  STATIC_PATTERNS.some((pattern) => pattern.test(new URL(url).pathname));

const isAPIRequest = (url) =>
  new URL(url).pathname.startsWith('/api');

// ── Install: pre-cache app shell ───────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ── Activate: remove old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('neurotrack-') && ![STATIC_CACHE, SHELL_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch strategy ──────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests and API calls (let them go to network)
  if (request.method !== 'GET' || isAPIRequest(request.url)) {
    return;
  }

  // Chrome extensions
  if (!request.url.startsWith('http')) return;

  if (isStaticAsset(request.url)) {
    // Cache-first for static assets
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return cached || new Response('Asset unavailable offline', { status: 503 });
        }
      })
    );
    return;
  }

  // Navigation requests: network-first, fallback to shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.open(SHELL_CACHE).then((cache) => cache.match('/index.html'))
      )
    );
    return;
  }

  // Default: network-first, no cache
  event.respondWith(
    fetch(request).catch(() =>
      new Response(JSON.stringify({ offline: true, message: 'You are offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  );
});

// ── Background sync placeholder (for future use) ───────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'neurotrack-sync') {
    // Future: sync offline guest actions when back online
    event.waitUntil(Promise.resolve());
  }
});

// ── Push notifications placeholder ─────────────────────────────────────────
self.addEventListener('push', () => {
  // Reserved for future study reminder notifications
});
