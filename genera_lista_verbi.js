// Aggiunge a audio/lista.json tutti i testi greci del modulo "Verbi fondamentali".
// Uso: node genera_lista_verbi.js   (poi: python genera_audio.py)
// Non tocca i file mp3 già generati: aggiunge solo i testi nuovi.
const fs = require("fs"), crypto = require("crypto"), vm = require("vm");
const ctx = vm.createContext({ window: {} });
ctx.window = ctx;
for (const f of ["verbi-data.js", "verbi-data-avere.js", "verbi-data-modali.js"])
  vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
const D = ctx.VerbiData;

// Stesse pulizie di verbi.js (speechOf) e di app.js (speechText).
const speechOf = (t) => String(t).replace(/\([^)]*\)/g, "").replace(/[…«»]/g, "").split(/\s[–\/]\s/)[0].replace(/\s+/g, " ").trim();
const speechText = (t) => t.split("→").pop().replace(/[…;?]/g, "").replace(/[\/·]/g, ",").trim();
const clean = (t) => speechText(speechOf(t));

const texts = new Set();
const add = (t) => { if (t) { const c = clean(t); if (c) texts.add(c); } };
for (const s of D.sections) for (const l of s.lessons) {
  (l.blocks || []).forEach((b) => {
    if (b.k === "table") b.rows.forEach((r) => add(b.kind === "conj" ? r[1] : r[0]));
    if (b.k === "ex") b.items.forEach((i) => add(i[0]));
    if (b.k === "dlg") b.lines.forEach((x) => add(x[1]));
  });
}
fs.mkdirSync("audio", { recursive: true });
let old = {};
try { old = JSON.parse(fs.readFileSync("audio/lista.json", "utf8")); } catch (e) {}
const lista = { ...old };
let nuovi = 0;
texts.forEach((t) => { if (!lista[t]) nuovi++; lista[t] = crypto.createHash("sha1").update(t).digest("hex").slice(0, 10) + ".mp3"; });
const sorted = Object.fromEntries(Object.entries(lista).sort((a, b) => a[0].localeCompare(b[0], "el")));
fs.writeFileSync("audio/lista.json", JSON.stringify(sorted, null, 1));
console.log(`${texts.size} testi del modulo verbi, ${nuovi} nuovi. Totale in lista.json: ${Object.keys(sorted).length}`);
