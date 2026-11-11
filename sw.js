const CACHE = "ellinika-v33";
const AUDIO_CACHE = "ellinika-audio"; // separata: gli audio non si riscaricano a ogni nuova versione
const IMG_CACHE = "ellinika-arete-img"; // separata: immagini di ARETE (statue/, esercizi/) messe dall'utente
const FILES = ["./", "index.html", "style.css", "data.js", "lessons.js", "units.js", "path.js", "progress.js", "app.js", "ripasso.js", "letture.js", "extra.js", "layout.js", "forget.js", "leggere.js", "infinito.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png",
  "tank-battle.css", "tank-rules.js", "tank-arena.js", "tank-words.js", "tank-progress.js", "tank-battle.js",
  "arete.css", "arete-data.js", "arete-db.js", "arete.js", "arete-workout.js", "arete-routines.js", "arete-diary.js", "arete-progress.js", "arete-library.js", "verbi.css", "verbi-data.js", "verbi-data-avere.js", "verbi-data-modali.js", "verbi.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((file) => new Request(file, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== AUDIO_CACHE && k !== IMG_CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
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
  if (url.origin === location.origin && (url.pathname.includes("/statue/") || url.pathname.includes("/esercizi/"))) {
    // immagini facoltative: crediti sempre dalla rete (se c'è), foto prima dalla copia salvata
    const fresh = url.pathname.endsWith(".json");
    e.respondWith(caches.open(IMG_CACHE).then(async (c) => {
      const hit = await c.match(e.request);
      if (hit && !fresh) return hit;
      try {
        const res = await fetch(e.request);
        if (res.ok) c.put(e.request, res.clone()); // se manca (404) non si salva: la schermata passa all'estensione successiva
        return res;
      } catch (err) { if (hit) return hit; throw err; }
    }));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});