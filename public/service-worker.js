// public/service-worker.js
// A minimal no-op service worker to avoid 404s in development.
// This does not cache anything and simply lets requests pass through.

self.addEventListener('install', (event) => {
  // Activate immediately on install
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of uncontrolled clients
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through network requests
  return; // no-op
});
