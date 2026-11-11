// Installa la sezione «Verbi fondamentali» nell'app: collega i nuovi file a index.html, sw.js, app.js, layout.js e progress.js.
// Uso (dalla cartella del progetto, quella con index.html):   node installa-verbi.js
// È sicuro rilanciarlo: se una modifica c'è già, la salta. Se un file ha un aspetto inatteso non lo tocca e te lo dice.
const fs = require("fs"), vm = require("vm"), path = require("path");
const NEW_FILES = ["verbi.css", "verbi-data.js", "verbi-data-avere.js", "verbi-data-modali.js", "verbi.js"];
const log = [], problems = [];
const read = (f) => fs.readFileSync(f, "utf8");
function write(f, text) {
  if (f.endsWith(".js")) { try { new vm.Script(text, { filename: f }); } catch (e) { problems.push(`${f}: la modifica produrrebbe un errore di sintassi (${e.message}). File NON modificato.`); return false; } }
  fs.writeFileSync(f, text); return true;
}
function edit(f, fn) {
  if (!fs.existsSync(f)) { problems.push(`${f}: file non trovato (esegui lo script dalla cartella del progetto)`); return; }
  const src = read(f); let out;
  try { out = fn(src); } catch (e) { problems.push(`${f}: ${e.message}`); return; }
  if (out === src) { log.push(`= ${f}: già a posto`); return; }
  if (write(f, out)) log.push(`✓ ${f}: aggiornato`);
}
for (const f of NEW_FILES) if (!fs.existsSync(f)) problems.push(`${f}: manca! Copia nella cartella tutti i file dell'aggiornamento prima di lanciare lo script.`);
if (problems.length) { console.log(problems.join("\n")); process.exit(1); }

edit("index.html", (s) => {
  if (!s.includes('href="verbi.css"')) {
    const links = [...s.matchAll(/<link[^>]*rel="stylesheet"[^>]*>\s*\n?/g)];
    if (links.length) { const m = links[links.length - 1], at = m.index + m[0].length; s = s.slice(0, at) + '<link rel="stylesheet" href="verbi.css">\n' + s.slice(at); }
    else s = s.replace("</head>", '<link rel="stylesheet" href="verbi.css">\n</head>');
  }
  if (!s.includes('src="verbi.js"')) {
    const tags = [...s.matchAll(/<script[^>]*src="[^"]+"[^>]*><\/script>\s*\n?/g)];
    const add = NEW_FILES.filter((f) => f.endsWith(".js")).map((f) => `<script src="${f}"></script>\n`).join("");
    if (!tags.length) throw new Error("non trovo i tag <script>");
    const m = tags[tags.length - 1], at = m.index + m[0].length; s = s.slice(0, at) + add + s.slice(at);
  }
  return s;
});

edit("sw.js", (s) => {
  const m = s.match(/(const\s+FILES\s*=\s*\[)([\s\S]*?)(\]\s*;)/);
  if (!m) throw new Error("non trovo l'elenco FILES");
  let out = s;
  if (!m[2].includes('"verbi.js"')) {
    const body = m[2].replace(/\s+$/, "").replace(/,$/, ""), add = NEW_FILES.map((f) => `"${f}"`).join(", ");
    out = s.replace(m[0], m[1] + body + ", " + add + m[3]);
  }
  const c = out.match(/(const\s+CACHE\s*=\s*"[^"]*?v)(\d+)(")/); // nuova versione della cache, così i file nuovi si scaricano
  if (c && out !== s) out = out.replace(c[0], c[1] + (+c[2] + 1) + c[3]);
  return out;
});

edit("app.js", (s) => {
  if (!/verbi:\s*"home"/.test(s)) {
    const m = s.match(/const NAV_OF = \{([^}]*)\}/); if (!m) throw new Error("non trovo NAV_OF");
    s = s.replace(m[0], `const NAV_OF = {${m[1].replace(/\s+$/, "")}, verbi: "home" }`);
  }
  if (!s.includes("window.Verbi.open()")) {
    const m = s.match(/\s*\}\)\[t\]\(\);/); if (!m) throw new Error("non trovo la tabella delle schermate in go()");
    s = s.replace(m[0], `, verbi: () => window.Verbi.open() })[t]();`);
  }
  return s;
});

edit("layout.js", (s) => {
  if (!s.includes('id="goVerbi"')) {
    const lines = s.split("\n"), i = lines.findIndex((l) => l.includes('id="goRead"'));
    if (i < 0) throw new Error('non trovo il pulsante "Letture" (goRead)');
    lines.splice(i + 1, 0, '        <button class="tile2 vb-tile" id="goVerbi"><i aria-hidden="true">είμαι</i><b>Verbi fondamentali</b><span>Essere, avere e verbi modali: lezioni, frasi ed esercizi</span></button>');
    s = lines.join("\n");
  }
  if (!s.includes('$("#goVerbi")')) {
    const lines = s.split("\n"), i = lines.findIndex((l) => l.includes('$("#goRead").onclick'));
    if (i < 0) throw new Error("non trovo il gestore di goRead");
    lines.splice(i + 1, 0, '    $("#goVerbi").onclick = () => go("verbi");');
    s = lines.join("\n");
  }
  return s;
});

// Facoltativo: i progressi dei verbi entrano nel backup dell'app. Se il file è diverso dal previsto si salta senza problemi.
edit("progress.js", (s) => {
  if (s.includes("Verbi.exportData")) return s;
  const a = "arete: window.AreteDB ? AreteDB.exportData() : undefined", i = s.indexOf(a);
  if (i < 0) { log.push("· progress.js: backup dei verbi non collegato (facoltativo: i progressi restano nel browser)"); return s; }
  s = s.replace(a, a + ", verbi: window.Verbi ? Verbi.exportData() : undefined");
  const lines = s.split("\n"), j = lines.findIndex((l) => l.includes("data.arete") && l.includes("AreteDB"));
  if (j >= 0) lines.splice(j + 1, 0, "  if (data.verbi && window.Verbi) { try { Verbi.importData(data.verbi); } catch (e) { /* dati dei verbi non validi: ignorati */ } }");
  return lines.join("\n");
});

console.log(log.join("\n"));
if (problems.length) { console.log("\nATTENZIONE:\n" + problems.join("\n")); process.exit(1); }
console.log("\nFatto. Riavvia il server, poi in Chrome: F12 → Application → Service Workers → Unregister, e Ctrl+Shift+R.");
