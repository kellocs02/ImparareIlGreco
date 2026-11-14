// Installa il consigliere dei cambi di ARETE. Uso (dalla cartella del progetto o da dove sta questo file):
//   node installa-swap.js
// Idempotente: se è già tutto a posto non cambia nulla. Controlla la sintassi prima di scrivere.
const fs = require("fs"), path = require("path"), vm = require("vm");
const dir = process.cwd(), P = (f) => path.join(dir, f);
const need = ["index.html", "sw.js", "arete-workout.js", "arete-routines.js", "arete-swap.js", "arete-swap.css"];
const miss = need.filter((f) => !fs.existsSync(P(f)));
if (miss.length) { console.error("Mancano questi file nella cartella corrente: " + miss.join(", ")); process.exit(1); }

const out = {}, log = [];
const read = (f) => (out[f] !== undefined ? out[f] : (out[f] = fs.readFileSync(P(f), "utf8")));
function patch(f, label, done, fn) {
  let s = read(f);
  if (done(s)) return log.push("ok già presente: " + label);
  const n = fn(s);
  if (n === s) { console.error("ATTENZIONE: non trovo il punto dove agganciare «" + label + "» in " + f + ". Non tocco nulla."); process.exit(1); }
  out[f] = n; log.push("aggiunto: " + label);
}
patch("index.html", "arete-swap.css", (s) => s.includes("arete-swap.css"), (s) => s.replace(/(<link[^>]*href="arete\.css"[^>]*>)/, '$1\n<link rel="stylesheet" href="arete-swap.css">'));
patch("index.html", "arete-swap.js", (s) => s.includes("arete-swap.js"), (s) => s.replace(/(<script src="arete-library\.js"><\/script>)/, '$1\n<script src="arete-swap.js"></script>'));
patch("sw.js", "file nella cache", (s) => s.includes('"arete-swap.js"'), (s) => s.replace('"arete-library.js",', '"arete-library.js", "arete-swap.css", "arete-swap.js",'));
patch("arete-workout.js", "pulsante «Cambia» nel menu esercizio", (s) => s.includes('data-act="ex-swap"'),
  (s) => s.replace(/(Sposta giù<\/button><\/div>)/, '$1\n        <button class="ar-btn ghost" data-act="ex-swap" data-we="${x.id}">⇄ Cambia con un altro esercizio</button>'));
patch("arete-routines.js", "pulsante ⇄ nell'editor routine", (s) => s.includes('data-act="rt-swap"'),
  (s) => s.replace('<button class="ar-dots danger" data-act="rt-rm"', '<button class="ar-dots" data-act="rt-swap" data-i="${i}" aria-label="Cambia esercizio">⇄</button><button class="ar-dots danger" data-act="rt-rm"'));
patch("arete-routines.js", "azione rt-swap", (s) => s.includes('"rt-swap":'),
  (s) => s.replace(/(\n\s*)("rt-rm":)/, '$1"rt-swap": (el) => { sync(); const i = +el.dataset.i, it = ed.items[i]; A.swap.open({ exerciseId: it.exerciseId, onPick: (id) => { const e = DB.exercises.get(id); it.exerciseId = id; it.name = e.name; A.render(); } }); },$1$2'));

// Cache: aumenta il numero solo se qualcosa è cambiato
if (Object.keys(out).some((f) => out[f] !== fs.readFileSync(P(f), "utf8"))) {
  out["sw.js"] = read("sw.js").replace(/(const CACHE = "[a-z-]*v)(\d+)(")/, (m, a, n, b) => a + (+n + 1) + b);
  log.push("cache aumentata in sw.js");
}
for (const f of Object.keys(out)) if (f.endsWith(".js")) { try { new vm.Script(out[f], { filename: f }); } catch (e) { console.error("Errore di sintassi in " + f + ": " + e.message + "\nNon scrivo nulla."); process.exit(1); } }
let changed = 0;
for (const f of Object.keys(out)) if (out[f] !== fs.readFileSync(P(f), "utf8")) { fs.writeFileSync(P(f), out[f]); changed++; }
console.log(log.join("\n") + "\n" + (changed ? changed + " file modificati." : "Niente da fare: è già tutto installato."));
