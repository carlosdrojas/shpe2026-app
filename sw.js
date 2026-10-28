// Offline cache for the SHPE prep app. Bump CACHE when any shell file changes.
const CACHE = "shpe2026-v7";
const SHELL = ["./", "index.html", "roster.js", "floorplan.js", "manifest.json", "icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first: once loaded on wifi, the app opens with no connection.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // only the app's own files; sync calls to api.github.com must always hit the network
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(event.request, copy));
      return res;
    }).catch(() => caches.match("index.html")))
  );
});
