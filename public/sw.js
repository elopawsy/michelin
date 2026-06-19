const CACHE_VERSION = "michelin-ride-v2";
const CACHE_PREFIX = "michelin-ride-";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const OFFLINE_URL = "/offline";
const PRECACHE_STATIC_URLS = [
  OFFLINE_URL,
  "/favicon.ico",
  "/logo-left.webp",
  "/hero-home.png",
  "/hero-bibendum.png",
  "/capteur.png",
  "/heritage-1.jpg",
  "/heritage-2.jpg",
  "/heritage-3.jpg",
  "/pictograms/battery.svg",
  "/pictograms/bicycle-tire.svg",
  "/pictograms/car-tire.svg",
  "/pictograms/comfort.svg",
  "/pictograms/energy-efficiency.svg",
  "/pictograms/find-a-dealer.svg",
  "/pictograms/mileage.svg",
  "/pictograms/mobility.svg",
  "/pictograms/off-road-car-tire.svg",
  "/pictograms/security.svg",
  "/pictograms/speed-rating.svg",
  "/pictograms/tpms.svg",
  "/pictograms/traction.svg",
  "/pictograms/tread-life.svg",
  "/pictograms/versatility.svg",
  "/pwa/icon-192.png",
  "/pwa/icon-512.png",
  "/pwa/apple-touch-icon.png",
];
const PRECACHE_PAGE_URLS = [
  "/",
  "/jeu",
  "/blog",
  "/blog/pression-pneus-gravel-guide",
  "/blog/choisir-largeur-pneus-gravel",
  "/blog/technologie-gomme-adherence-rendement",
  "/blog/technologies-anti-crevaison",
  "/blog/pneu-velo-connecte",
  "/blog/tubeless-ou-chambre-a-air",
  "/catalogue",
];
const OFFLINE_PAGE_PATHS = new Set(PRECACHE_PAGE_URLS);
const OFFLINE_PAGE_PREFIXES = ["/blog/"];

self.addEventListener("install", (event) => {
  event.waitUntil(precacheOfflineApp());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && !activeCaches.has(key))
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      isOfflinePagePath(url.pathname)
        ? networkFirstPage(request, url)
        : fetch(request).catch(offlineResponse),
    );
    return;
  }

  if (isOfflinePagePath(url.pathname) && isNextAppDataRequest(request, url)) {
    event.respondWith(networkFirstCachedRequest(request));
    return;
  }

  if (isStaticAssetRequest(request, url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

const activeCaches = new Set([STATIC_CACHE, PAGE_CACHE]);

async function precacheOfflineApp() {
  const [staticCache, pageCache] = await Promise.all([
    caches.open(STATIC_CACHE),
    caches.open(PAGE_CACHE),
  ]);

  await staticCache.addAll(PRECACHE_STATIC_URLS.map(toCacheUrl));
  await Promise.all(
    PRECACHE_PAGE_URLS.map((url) => cachePage(pageCache, url)),
  );
}

async function cachePage(cache, url) {
  try {
    const response = await fetch(
      new Request(toCacheUrl(url), {
        credentials: "same-origin",
      }),
    );

    if (isCacheableResponse(response)) {
      await cache.put(toCacheUrl(url), response.clone());
    }
  } catch {
    // A single dynamic page should not prevent the service worker from installing.
  }
}

function isStaticAssetRequest(request, url) {
  return (
    request.destination === "font" ||
    request.destination === "image" ||
    request.destination === "script" ||
    request.destination === "style" ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/pictograms/") ||
    url.pathname.startsWith("/pwa/")
  );
}

function isNextAppDataRequest(request, url) {
  return (
    request.headers.get("rsc") === "1" ||
    request.headers.get("next-router-prefetch") === "1" ||
    url.searchParams.has("_rsc")
  );
}

function isOfflinePagePath(pathname) {
  const normalizedPath = normalizePath(pathname);

  return (
    OFFLINE_PAGE_PATHS.has(normalizedPath) ||
    OFFLINE_PAGE_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))
  );
}

function normalizePath(pathname) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

async function networkFirstPage(request, url) {
  const cache = await caches.open(PAGE_CACHE);
  const cacheKey = toCacheUrl(normalizePath(url.pathname));

  try {
    const response = await fetch(request);

    if (isCacheableResponse(response)) {
      await cache.put(cacheKey, response.clone());
    }

    return response;
  } catch {
    return (await cache.match(cacheKey)) ?? (await offlineResponse());
  }
}

async function networkFirstCachedRequest(request) {
  const cache = await caches.open(PAGE_CACHE);

  try {
    const response = await fetch(request);

    if (isCacheableResponse(response)) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    return (await cache.match(request)) ?? Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  try {
    const response = await fetch(request);

    if (isCacheableResponse(response)) {
      await cache.put(request, response.clone());
    }

    return cached ?? response;
  } catch {
    return cached ?? Response.error();
  }
}

function isCacheableResponse(response) {
  return response.ok && (response.type === "basic" || response.type === "default");
}

async function offlineResponse() {
  const cache = await caches.open(STATIC_CACHE);

  return (
    (await cache.match(toCacheUrl(OFFLINE_URL))) ??
    new Response("Michelin Ride est hors ligne.", {
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      status: 503,
    })
  );
}

function toCacheUrl(pathname) {
  return new URL(pathname, self.location.origin).href;
}
