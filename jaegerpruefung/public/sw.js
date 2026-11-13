/* Service worker for the Jägerprüfung Trainer: keeps lessons and quizzes on the device. */
const PAGES = "jagd-pages-v1";
const ASSETS = "jagd-assets-v1";
const META = "jagd-meta-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = [PAGES, ASSETS, META];
      for (const key of await caches.keys()) if (!keep.includes(key)) await caches.delete(key);
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "sync") event.waitUntil(syncAll(Boolean(event.data.force)));
  if (event.data && event.data.type === "status") event.waitUntil(reportStatus());
});

async function broadcast(msg) {
  for (const client of await self.clients.matchAll({ includeUncontrolled: true })) client.postMessage(msg);
}

async function reportStatus() {
  const meta = await caches.open(META);
  const res = await meta.match("/__offline-meta");
  const info = res ? await res.json() : null;
  await broadcast({ type: "offline-status", state: info ? "ready" : "none", ...(info || {}) });
}

let syncing = null;
function syncAll(force) {
  if (!syncing) syncing = doSync(force).finally(() => (syncing = null));
  return syncing;
}

/** Downloads every page plus the scripts and styles they need. */
async function doSync(force) {
  let list;
  try {
    const res = await fetch("/api/offline-pages", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    list = await res.json();
  } catch {
    return reportStatus(); // offline: keep what we have
  }

  const meta = await caches.open(META);
  const prev = await meta.match("/__offline-meta");
  const prevInfo = prev ? await prev.json() : null;
  if (!force && prevInfo && prevInfo.version === list.version) {
    return broadcast({ type: "offline-status", state: "ready", ...prevInfo });
  }

  const pages = await caches.open(PAGES);
  const assets = await caches.open(ASSETS);
  const assetUrls = new Set();
  let done = 0;
  let failed = 0;
  await broadcast({ type: "offline-status", state: "syncing", done, total: list.pages.length });

  for (const path of list.pages) {
    try {
      const res = await fetch(path, { cache: "no-store", credentials: "same-origin" });
      if (!res.ok) throw new Error(String(res.status));
      const html = await res.clone().text();
      await pages.put(path, res);
      for (const m of html.matchAll(/["'](\/_next\/static\/[^"'\s]+?\.(?:js|css|woff2))["']/g)) assetUrls.add(m[1]);
    } catch {
      failed++;
    }
    done++;
    await broadcast({ type: "offline-status", state: "syncing", done, total: list.pages.length });
  }

  for (const url of ["/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/apple-icon.png", ...assetUrls]) {
    if (await assets.match(url)) continue;
    try {
      const res = await fetch(url);
      if (res.ok) await assets.put(url, res);
    } catch {}
  }

  const info = { version: list.version, pages: list.pages.length - failed, savedAt: new Date().toISOString() };
  if (failed === 0) {
    await meta.put("/__offline-meta", new Response(JSON.stringify(info)));
    // Drop script files from older deploys.
    for (const req of await assets.keys()) {
      const p = new URL(req.url).pathname;
      if (p.startsWith("/_next/static/") && !assetUrls.has(p)) await assets.delete(req);
    }
  }
  await broadcast({ type: "offline-status", state: failed ? "partial" : "ready", ...info, failed });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // tutor and agent need the network

  // Hashed build files never change: cache first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(req, ASSETS));
    return;
  }

  // Client-side navigations fetch an RSC payload. Offline, fail fast so the
  // router falls back to a full page load, which is served from the cache.
  if (req.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) {
    event.respondWith(fetch(req).catch(() => Response.error()));
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(networkFirstPage(req, url));
    return;
  }

  // Icons, manifest, other public files: serve the saved copy, refresh it in the background.
  event.respondWith(staleWhileRevalidate(req, ASSETS));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreSearch: true });
  const update = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit || Response.error());
  return hit || update;
}

async function networkFirstPage(req, url) {
  const cache = await caches.open(PAGES);
  const key = url.pathname;
  try {
    const res = await withTimeout(fetch(req), 6000);
    if (res.ok) cache.put(key, res.clone());
    return res;
  } catch {
    const hit = (await cache.match(key)) || (await cache.match("/"));
    if (hit) return hit;
    return new Response(
      '<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:system-ui;padding:2rem;background:#f6f4ee;color:#1d2318"><h1>Offline</h1><p>This page is not saved on your phone yet. Open the app once while online so it can download everything.</p><p><a href="/">Back to the start</a></p>',
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}
