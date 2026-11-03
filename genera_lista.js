// Elenca tutti i testi greci che l'app può pronunciare e li scrive in audio/lista.json (testo -> nome file).
// Uso: node genera_lista.js   (poi: python genera_audio.py)
// I nomi dei file derivano dal testo, quindi quelli già generati restano validi quando aggiungi contenuti.
const fs = require("fs"), crypto = require("crypto"), vm = require("vm");
const ctx = vm.createContext({});
for (const f of ["data.js", "lessons.js"]) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
const { ALPHABET, CATS, LEVELS } = vm.runInContext("({ ALPHABET, CATS, LEVELS })", ctx);

// Stessa pulizia che fa l'app (speechText in app.js) prima di pronunciare un testo.
const clean = (t) => t.split("→").pop().replace(/[…;?]/g, "").replace(/[\/·]/g, ",").trim();
const texts = new Set();
const add = (t) => {
  if (!t) return;
  texts.add(clean(t));
  t.split("→").forEach((p) => p.trim() && texts.add(clean(p)));
};
ALPHABET.forEach((l) => add(l[2]));
CATS.forEach((c) => c.words.forEach((w) => add(w[0])));
LEVELS.forEach((l) => l.sections.forEach((s) => {
  (s.rows || []).forEach((r) => add(r[0]));
  (s.dialog || []).forEach((d) => add(d[1]));
  if (s.conj) s.conj.rows.forEach((r) => r.slice(1).forEach((c) => add(c[0])));
}));
texts.delete("");

fs.mkdirSync("audio", { recursive: true });
let old = {};
try { old = JSON.parse(fs.readFileSync("audio/lista.json", "utf8")); } catch (e) {}
const lista = { ...old };
texts.forEach((t) => { lista[t] = crypto.createHash("sha1").update(t).digest("hex").slice(0, 10) + ".mp3"; });
const sorted = Object.fromEntries(Object.entries(lista).sort((a, b) => a[0].localeCompare(b[0], "el")));
fs.writeFileSync("audio/lista.json", JSON.stringify(sorted, null, 1));
console.log(Object.keys(sorted).length + " testi in audio/lista.json");
