const CACHE_VERSION = "stonefinder-pwa-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("stonefinder-pwa-") && key !== CACHE_VERSION)
            .map((key) => caches.delete(key)),
        ),
      ),
    ]),
  );
});

// We intentionally do not cache dynamic marketplace pages yet.
// This service worker is the foundation for PWA installation and future push notifications.
