// Cache dei file per far funzionare l'app anche offline.
const VERSION = "ascensore-v2";
const FILES = [
  "./",
  "index.html",
  "css/style.css",
  "js/config.js",
  "js/app.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/apple-touch-icon.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Prima prova la rete (così gli aggiornamenti arrivano subito), se offline usa la cache.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
