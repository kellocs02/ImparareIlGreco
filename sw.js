const CACHE = "ellinika-v28";
const AUDIO_CACHE = "ellinika-audio"; // separata: gli audio non si riscaricano a ogni nuova versione
const FILES = ["./", "index.html", "style.css", "data.js", "lessons.js", "units.js", "path.js", "progress.js", "app.js", "ripasso.js", "letture.js", "extra.js", "layout.js", "forget.js", "leggere.js", "infinito.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png",
  "tank-battle.css", "tank-rules.js", "tank-arena.js", "tank-words.js", "tank-progress.js", "tank-battle.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((file) => new Request(file, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== AUDIO_CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin && url.pathname.includes("/audio/")) {
    // lista.json: prima la rete (così vedi i nuovi audio), file mp3: prima la copia salvata
    const isList = url.pathname.endsWith("lista.json");
    e.respondWith(caches.open(AUDIO_CACHE).then(async (c) => {
      const hit = await c.match(e.request);
      if (hit && !isList) return hit;
      try {
        const res = await fetch(e.request);
        if (res.ok) c.put(e.request, res.clone());
        return res;
      } catch (err) { if (hit) return hit; throw err; }
    }));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
