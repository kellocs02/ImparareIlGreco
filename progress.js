// Obiettivo giornaliero, statistiche, traguardi e backup dei progressi.
// Usa state, view, $, esc, toast, save, today, touchStreak, learnedCount, syncDeck, fresh, go, KEY (app.js)
// e UNITS, LEVELS, passedU (units.js, lessons.js, path.js) solo a run-time, dentro le funzioni.
//
// Dati salvati in state:
//   goal   obiettivo giornaliero (numero di risposte)
//   log    { [giorno]: { n: risposte, ok: giuste, g: 1 se l'obiettivo è stato raggiunto } }
//   ach    { [id traguardo]: giorno di sblocco }
//   bk     giorno dell'ultimo backup
//   tp / perf  test superati / test chiusi al 100%
const GOALS = [10, 20, 30, 50];
const LOG_DAYS = 400; // quanti giorni di storico tenere
const DOW = ["D", "L", "M", "M", "G", "V", "S"];

const dayEntry = (d = today()) => state.log[d] || { n: 0, ok: 0 };
const todayCount = () => dayEntry().n;
const goalOf = () => state.goal || 20;

// ---------- Registrazione delle risposte ----------
function logAnswer(ok) {
  state.reviews++;
  const t = today();
  if (!state.log[t]) {
    state.log[t] = { n: 0, ok: 0 };
    Object.keys(state.log).forEach((k) => { if (+k < t - LOG_DAYS) delete state.log[k]; });
  }
  const e = state.log[t];
  e.n++; if (ok) e.ok++;
  touchStreak();
  progressCheck();
  save();
}

function noteTest(ok, pct) {
  if (ok) { state.tp = (state.tp || 0) + 1; if (pct === 100) state.perf = (state.perf || 0) + 1; }
  touchStreak();
  progressCheck();
  save();
}

// ---------- Traguardi ----------
const bestStreak = () => Math.max(state.streak.best || 0, state.streak.count || 0);
const goalDays = () => Object.values(state.log).filter((e) => e.g).length;
const totalUnits = () => UNITS.reduce((n, us) => n + us.length, 0);
const passedUnits = () => UNITS.reduce((n, us) => n + us.filter((u) => passedU(u.id)).length, 0);
const passedLevels = () => Object.keys(state.pl).length;

const A = (id, i, t, d, cur, max) => ({ id, i, t, d, cur, max });
const ACH = [
  A("r1", "👣", "Primo passo", "Rispondi alla tua prima domanda", () => state.reviews, 1),
  A("r100", "📝", "Cento risposte", "Rispondi a 100 domande", () => state.reviews, 100),
  A("r500", "📚", "Cinquecento risposte", "Rispondi a 500 domande", () => state.reviews, 500),
  A("r1000", "🏛️", "Mille risposte", "Rispondi a 1000 domande", () => state.reviews, 1000),
  A("s3", "🔥", "Tre giorni di fila", "Studia per 3 giorni consecutivi", bestStreak, 3),
  A("s7", "🔥", "Una settimana", "Studia per 7 giorni consecutivi", bestStreak, 7),
  A("s14", "🔥", "Due settimane", "Studia per 14 giorni consecutivi", bestStreak, 14),
  A("s30", "🌟", "Un mese intero", "Studia per 30 giorni consecutivi", bestStreak, 30),
  A("g1", "🎯", "Obiettivo centrato", "Raggiungi l'obiettivo giornaliero", goalDays, 1),
  A("g7", "🎯", "Costanza", "Raggiungi l'obiettivo in 7 giorni", goalDays, 7),
  A("g30", "🎯", "Metodo", "Raggiungi l'obiettivo in 30 giorni", goalDays, 30),
  A("w25", "🌱", "25 parole", "Impara 25 parole", () => learnedCount(), 25),
  A("w100", "🌿", "100 parole", "Impara 100 parole", () => learnedCount(), 100),
  A("w250", "🌳", "250 parole", "Impara 250 parole", () => learnedCount(), 250),
  A("u1", "✅", "Prima unità", "Supera la tua prima unità", passedUnits, 1),
  A("u10", "🧭", "Dieci unità", "Supera 10 unità", passedUnits, 10),
  A("u25", "⛰️", "Venticinque unità", "Supera 25 unità", passedUnits, 25),
  A("uall", "🗺️", "Tutte le unità", "Supera tutte le unità del percorso", passedUnits, totalUnits()),
  A("al12", "🔤", "Dodici lettere", "Impara 12 lettere dell'alfabeto", () => alphaLearned(), 12),
  A("al24", "🔠", "Alfabeto completo", "Impara tutte le 24 lettere", () => alphaLearned(), 24),
  ...LEVELS.map((l, a) => A("lv" + a, "🏁", `Livello ${l.n} superato`, `Supera il test finale del livello ${l.n}`, () => (state.pl[a] ? 1 : 0), 1)),
  A("p1", "💯", "Test perfetto", "Chiudi un test al 100%", () => state.perf || 0, 1),
  A("p5", "💎", "Cinque test perfetti", "Chiudi 5 test al 100%", () => state.perf || 0, 5),
  A("all", "🎓", "Percorso completato", "Supera il test finale di tutti i livelli", passedLevels, LEVELS.length)
];

// Controlla obiettivo e traguardi. silent = true: sblocca senza avvisi (serve a recuperare i traguardi già meritati).
function progressCheck(silent) {
  const t = today(), msgs = [];
  const e = state.log[t];
  if (!silent && e && e.n >= goalOf() && !e.g) { e.g = 1; msgs.push("🎯 Obiettivo di oggi raggiunto!"); }
  ACH.forEach((a) => {
    if (state.ach[a.id] || a.cur() < a.max) return;
    state.ach[a.id] = t;
    if (!silent) msgs.push(`${a.i} Traguardo: ${a.t}`);
  });
  if (msgs.length) toast(msgs.join("  ·  "));
  if (silent) save();
}

// ---------- Home: obiettivo di oggi e promemoria backup ----------
function goalCard() {
  const n = todayCount(), g = goalOf(), done = n >= g;
  return `<button class="goal${done ? " hit" : ""}" id="goGoal">
    <div><b>${done ? "🎯 Obiettivo raggiunto!" : "Obiettivo di oggi"}</b><span>${n} / ${g}</span></div>
    <div class="progress"><div style="width:${Math.min(100, Math.round((n / g) * 100))}%"></div></div></button>`;
}

function backupAgo() {
  if (!state.bk) return "mai";
  const d = today() - state.bk;
  return d <= 0 ? "oggi" : d === 1 ? "ieri" : d + " giorni fa";
}

function backupNudge() {
  if (state.reviews < 50) return "";
  if (state.bk && today() - state.bk < 14) return "";
  return `<button class="note nudge" id="goBk"><span>💾 ${state.bk ? "Ultimo backup " + backupAgo() : "Non hai ancora fatto un backup"}: salva i tuoi progressi</span><span>›</span></button>`;
}

function bindHome() {
  if ($("#goGoal")) $("#goGoal").onclick = () => go("stats");
  if ($("#goBk")) $("#goBk").onclick = () => go("stats");
}

// ---------- Schermata Progressi ----------
function renderStats() {
  const t = today(), g = goalOf(), n = todayCount();
  const days = Array.from({ length: 7 }, (_, k) => t - 6 + k);
  const max = Math.max(g, ...days.map((d) => dayEntry(d).n));
  const chart = days.map((d) => {
    const c = dayEntry(d).n;
    return `<div class="col"><i class="b${c >= g ? " hit" : d === t ? " today" : ""}" style="height:${Math.round((c / max) * 100)}%"></i></div>`;
  }).join("");
  const axis = days.map((d) => `<div class="${d === t ? "today" : ""}"><b>${DOW[new Date(d * 864e5).getUTCDay()]}</b>${dayEntry(d).n || "·"}</div>`).join("");
  const all = Object.values(state.log);
  const tot = all.reduce((s, e) => s + e.n, 0), right = all.reduce((s, e) => s + e.ok, 0);
  const got = ACH.filter((a) => state.ach[a.id]).length;

  view.innerHTML = `<h1>Progressi <small>obiettivo, statistiche e traguardi</small></h1>
    <button class="goal${n >= g ? " hit" : ""}" style="margin-top:0;cursor:default">
      <div><b>${n >= g ? "🎯 Obiettivo raggiunto!" : "Obiettivo di oggi"}</b><span>${n} / ${g} risposte</span></div>
      <div class="progress"><div style="width:${Math.min(100, Math.round((n / g) * 100))}%"></div></div></button>
    <h2>Risposte al giorno</h2>
    <div class="chips">${GOALS.map((x) => `<button class="chip ${x === g ? "on" : ""}" data-g="${x}">${x}</button>`).join("")}</div>
    <div class="chart" style="margin-top:14px"><div class="gline" style="bottom:${(g / max) * 100}%"></div>${chart}</div>
    <div class="axis">${axis}</div>
    <h2>Calendario</h2>
    ${calendarHtml()}
    <h2>Statistiche</h2>
    <div class="kpi">
      <div><b>${currentStreak()}</b><span>giorni di fila 🔥</span></div>
      <div><b>${bestStreak()}</b><span>serie migliore</span></div>
      <div><b>${state.reviews}</b><span>risposte totali</span></div>
      <div><b>${tot ? Math.round((right / tot) * 100) + "%" : "–"}</b><span>risposte giuste</span></div>
      <div><b>${all.filter((e) => e.n > 0).length}</b><span>giorni di studio</span></div>
      <div><b>${goalDays()}</b><span>obiettivi raggiunti</span></div>
      <div><b>${learnedCount()}<i>/${WORDS.length}</i></b><span>parole imparate</span></div>
      <div><b>${passedUnits()}<i>/${totalUnits()}</i></b><span>unità superate</span></div>
      <div><b>${state.tp || 0}</b><span>test superati</span></div>
      <div><b>${errCount()}</b><span>parole da rivedere</span></div>
    </div>
    <h2>Traguardi · ${got} / ${ACH.length}</h2>
    ${ACH.map((a) => {
      const c = Math.min(a.cur(), a.max), has = !!state.ach[a.id];
      return `<div class="ach ${has ? "got" : "lock"}"><span class="ai">${a.i}</span><span><b>${esc(a.t)}</b><small>${esc(a.d)}</small></span><em>${has ? "✓" : c + "/" + a.max}</em></div>`;
    }).join("")}
    <h2>Backup dei progressi</h2>
    <p class="note">I progressi sono salvati solo su questo telefono: se cancelli i dati del browser o disinstalli l'app, si perdono. Salva ogni tanto un backup (ad esempio su Drive, iCloud o nei messaggi a te stesso).<br><b>Ultimo backup: ${backupAgo()}</b></p>
    <button class="big" id="bkFile">Salva backup <span>file .json</span></button>
    <button class="big alt" id="bkCopy">Copia come testo <span>negli appunti</span></button>
    <button class="big alt" id="bkLoad">Ripristina da file <span>.json</span></button>
    <button class="big alt" id="bkPaste">Ripristina da testo <span>incolla</span></button>
    <div id="bkBox" hidden>
      <textarea id="bkText" rows="6" spellcheck="false" placeholder="Incolla qui il backup"></textarea>
      <button class="big" id="bkGo" style="justify-content:center">Ripristina</button>
    </div>
    <input type="file" id="bkIn" accept=".json,application/json,text/plain" hidden>
    <p class="hint">Ripristinare sostituisce i progressi attuali con quelli del backup.</p>`;

  view.querySelectorAll("[data-g]").forEach((b) => (b.onclick = () => { state.goal = +b.dataset.g; save(); renderStats(); }));
  $("#bkFile").onclick = backupFile;
  $("#bkCopy").onclick = backupCopy;
  $("#bkLoad").onclick = () => $("#bkIn").click();
  $("#bkIn").onchange = async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    try { restoreFrom(await f.text()); } catch (err) { toast("Non riesco a leggere il file"); }
  };
  $("#bkPaste").onclick = () => { $("#bkBox").hidden = false; $("#bkText").focus(); };
  $("#bkGo").onclick = () => restoreFrom($("#bkText").value);
}

// ---------- Backup ----------
function backupJson() {
  return JSON.stringify({ app: "ellinika", v: 1, saved: new Date().toISOString(), state, arete: window.AreteDB ? AreteDB.exportData() : undefined });
}
function backupName() {
  const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return `ellinika-backup-${d}.json`;
}
function markBackup() {
  state.bk = today(); save();
  toast("Backup salvato ✓");
  if (tab === "stats") renderStats();
}

async function backupFile() {
  const name = backupName(), file = new File([backupJson()], name, { type: "application/json" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Backup Ελληνικά" });
      return markBackup();
    }
  } catch (e) {
    if (e && e.name === "AbortError") return; // l'utente ha chiuso il foglio di condivisione
  }
  const url = URL.createObjectURL(file), a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  markBackup();
}

async function backupCopy() {
  const json = backupJson();
  try {
    await navigator.clipboard.writeText(json);
    markBackup();
  } catch (e) { // niente appunti: mostro il testo da copiare a mano
    $("#bkBox").hidden = false;
    const ta = $("#bkText");
    ta.value = json; ta.focus(); ta.select();
    toast("Seleziona il testo e copialo");
  }
}

function restoreFrom(text) {
  let data;
  try { data = JSON.parse(text); } catch (e) { return toast("Backup non valido"); }
  const s = data && data.app === "ellinika" ? data.state : null;
  if (!s || typeof s !== "object" || typeof s.cards !== "object" || !s.streak) return toast("Questo non è un backup di Ελληνικά");
  const units = Object.keys(s.pu || {}).length, when = String(data.saved || "").slice(0, 10);
  if (!confirm(`Ripristinare il backup${when ? " del " + when : ""}?\n${s.reviews | 0} risposte, ${units} unità superate.\nI progressi attuali su questo telefono verranno sostituiti.`)) return;
  try { localStorage.setItem(KEY + "-prima-del-ripristino", JSON.stringify(state)); } catch (e) {} // rete di sicurezza
  state = Object.assign(fresh(), s);
  ["cards", "added", "pu", "pl", "log", "ach", "done", "err", "al"].forEach((k) => { if (!state[k] || typeof state[k] !== "object") state[k] = {}; });
  state.streak = Object.assign({ last: -1, count: 0 }, state.streak);
  let ar = "";
  if (data.arete && window.AreteDB) { try { AreteDB.importData(data.arete); ar = " (allenamenti ARETE inclusi)"; } catch (e) { ar = " (i dati ARETE del file non erano validi e non sono stati toccati)"; } }
  save(); syncDeck(); progressCheck(true);
  toast("Progressi ripristinati ✓" + ar);
  renderStats();
}

// ---------- Parole difficili: ripasso degli errori ----------
// state.err[id] = errori netti della parola: +1 se sbagli, -1 se rispondi bene (sparisce a 0). Aggiornato da grade() in app.js.
let _wmap = null;
function wordMap() { // id -> parola, per ritrovare anche le parole delle lezioni che non sono nel mazzo
  if (!_wmap) {
    _wmap = new Map();
    BASE_WORDS.forEach((w) => _wmap.set(w.id, w));
    LEVELS.forEach((_, a) => wordsOf(levelParts(a)).forEach((w) => _wmap.set(w.id, w)));
    WORDS.forEach((w) => { if (!_wmap.has(w.id)) _wmap.set(w.id, w); });
  }
  return _wmap;
}
const errWords = () => Object.keys(state.err).map((id) => wordMap().get(id)).filter(Boolean);
const errCount = () => errWords().length;

function startErrors() {
  const ws = shuffle(errWords()).sort((x, y) => state.err[y.id] - state.err[x.id]).slice(0, 10);
  if (!ws.length) return toast("Nessun errore da ripassare 🎉");
  const ctx = { words: ws, levelWords: [...wordMap().values()].filter((w) => w.cat === "lezioni") };
  const kinds = wordKinds();
  const qs = shuffle(ws.map((w, i) => wordQ(w, kinds[i % kinds.length], ctx)));
  runTest(qs, {
    title: "I miei errori",
    onExit: () => go("train"),
    onEnd: ({ score, total }) => {
      const left = errCount();
      view.innerHTML = `<div class="done"><div class="emoji">${score === total ? "🏆" : score >= total / 2 ? "👍" : "💪"}</div>
        <h2>${score} / ${total}</h2>
        <p>${left ? `Ti restano ${left} parole da rivedere.` : "Hai ripulito tutti gli errori! 🎉"}</p>
        ${left ? `<button class="big" id="again">Ancora</button>` : ""}<button class="big alt" id="bk">Allenati</button></div>`;
      if ($("#again")) $("#again").onclick = startErrors;
      $("#bk").onclick = () => go("train");
    }
  });
}

// ---------- Calendario dell'attività (ultime 15 settimane, lunedì in alto) ----------
function calendarHtml() {
  const W = 15, t = today(), g = goalOf();
  const dow = (d) => (new Date(d * 864e5).getUTCDay() + 6) % 7;
  const start = t - dow(t) - (W - 1) * 7;
  let cells = "";
  for (let r = 0; r < 7; r++) for (let c = 0; c < W; c++) {
    const d = start + c * 7 + r;
    if (d > t) { cells += `<i class="cal0 fut"></i>`; continue; }
    const n = dayEntry(d).n, lvl = n === 0 ? 0 : n >= g ? 3 : n >= g / 2 ? 2 : 1, dt = new Date(d * 864e5);
    cells += `<i class="cal${lvl}${d === t ? " cur" : ""}" title="${dt.getUTCDate()}/${dt.getUTCMonth() + 1}: ${n} risposte"></i>`;
  }
  return `<div class="cal" style="--w:${W}">${cells}</div>
    <p class="legend">Un quadrato per giorno · <i class="cal1"></i> poco <i class="cal2"></i> metà obiettivo <i class="cal3"></i> obiettivo raggiunto</p>`;
}

// ---------- Dizionario: cerca in greco, italiano o pronuncia ----------
let _dict = null;
function dictIndex() {
  if (_dict) return _dict;
  const seen = new Set(), out = [];
  const add = (gr, tr, it, src) => {
    if (!gr || (!it && !tr)) return;
    const key = norm(gr) + "|" + norm(it || "");
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ gr, tr: tr || "", it: it || "", src, k: [norm(gr), norm(tr || ""), norm(it || "")] });
  };
  CATS.forEach((c) => c.words.forEach((w) => add(w[0], w[1], w[2], c.emoji + " " + c.nome)));
  LEVELS.forEach((l) => l.sections.forEach((s) => {
    const src = `Livello ${l.n} · ${s.t}`;
    (s.rows || []).forEach((r) => add(r[0], r[1], r[2], src));
    (s.dialog || []).forEach((d) => add(d[1], "", d[2], src));
    if (s.conj) s.conj.rows.forEach((r) => { for (let j = 1; j < r.length; j++) add(r[j][0], r[j][1], `${r[0][2]} · ${s.conj.head[j]}`, src); });
  }));
  return (_dict = out);
}

function renderDict() {
  const D = dictIndex();
  view.innerHTML = `<h1>Dizionario <small>${D.length} voci tra parole, frasi e verbi</small></h1>
    <div class="typebox" style="margin-top:0"><input id="dq" type="search" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Cerca in greco, italiano o pronuncia"></div>
    <div id="dres" class="words" style="margin-top:14px"></div>`;
  const show = () => {
    const q = norm($("#dq").value), box = $("#dres");
    if (!q) { box.innerHTML = `<p class="hint" style="margin:0">Scrivi una parola: trovi la traduzione, la pronuncia e dove l'hai incontrata. Tocca un risultato per ascoltarlo.</p>`; return; }
    const hits = [];
    D.forEach((e) => { const s = e.k.some((x) => x.startsWith(q)) ? 0 : e.k.some((x) => x.includes(q)) ? 1 : -1; if (s >= 0) hits.push([s, e]); });
    hits.sort((a, b) => a[0] - b[0] || a[1].gr.length - b[1].gr.length);
    const shown = hits.slice(0, 40);
    box.innerHTML = shown.length
      ? shown.map(([, e], i) => `<button class="wr" data-i="${i}"><span class="g">${esc(e.gr)}</span><span class="p">${esc(e.tr)}</span>
          <span class="i">${esc(e.it)}<small class="src">${esc(e.src)}</small></span><u>🔊</u></button>`).join("")
        + (hits.length > 40 ? `<p class="hint">Altri ${hits.length - 40} risultati: scrivi di più per restringere.</p>` : "")
      : `<p class="hint" style="margin:0">Nessun risultato.</p>`;
    box.querySelectorAll(".wr").forEach((b) => (b.onclick = () => speak(shown[+b.dataset.i][1].gr)));
  };
  $("#dq").oninput = show;
  show();
  $("#dq").focus();
}

// ---------- Alfabeto: flashcard e quiz delle lettere ----------
// state.al[indice lettera in ALPHABET] = { box, due }: stesso ripasso a scatole delle parole.
const ALPHA_IT = ["alfa", "vita", "gamma", "delta", "epsilon", "zita", "ita", "thita", "iota", "kappa", "lambda", "mi", "ni", "xi", "omicron", "pi", "ro", "sigma", "tau", "ipsilon", "fi", "chi", "psi", "omega"];
// Lettere facili da confondere (per aspetto o per suono): servono a scegliere le risposte sbagliate più insidiose.
const ALPHA_GROUPS = [[1, 12, 6], [16, 15], [19, 12], [21, 22, 13], [14, 7, 23], [8, 6, 19], [10, 0], [5, 13, 4], [20, 22]];
const alphaBox = (k) => (state.al[k] ? state.al[k].box : -1);
const alphaLearned = () => ALPHABET.filter((_, k) => alphaBox(k) >= 3).length;
const alphaDue = () => ALPHABET.filter((_, k) => !state.al[k] || state.al[k].due <= today()).length;
const lower = (k) => ALPHABET[k][1].split(" ")[0];
const both = (k) => `${ALPHABET[k][0]} ${lower(k)}`;

// ok = true avanza la scatola solo se la lettera era da ripassare; sbagliare la riporta sempre all'inizio.
function gradeLetter(k, ok) {
  const c = state.al[k] || { box: 0, due: 0 };
  if (ok) { if (state.al[k] && c.due > today()) return; c.box = Math.min(c.box + 1, 5); }
  else c.box = 0;
  c.due = today() + INTERVALS[c.box];
  state.al[k] = c;
}

function alphaOpts(i) { // 4 scelte: la giusta, fino a 2 lettere simili, il resto a caso
  const sim = shuffle([...new Set(ALPHA_GROUPS.filter((g) => g.includes(i)).flat())].filter((x) => x !== i));
  const rest = shuffle(ALPHABET.map((_, k) => k).filter((k) => k !== i && !sim.includes(k)));
  return shuffle([i, ...sim.slice(0, 2), ...rest].slice(0, 4));
}

function voiceNote() { // il browser usa le voci del dispositivo: se manca quella greca, spiega come aggiungerla
  if (audioOk || !("speechSynthesis" in window) || !speechSynthesis.getVoices().length || greekVoice()) return "";
  return `<p class="note">🔊 Su questo dispositivo manca la voce greca, quindi la pronuncia non è corretta. Aggiungila nelle impostazioni di sistema: <b>Windows</b> Lingua e area geografica → Greco → Voce · <b>Android</b> Sintesi vocale → Google → Greco · <b>iPhone</b> Accessibilità → Contenuto letto → Voci → Greco.</p>`;
}
function alphaHub() {
  const n = alphaLearned(), d = alphaDue();
  return voiceNote() + `<div class="goal" style="cursor:default;margin-top:0"><div><b>Impara l'alfabeto</b><span>${n} / ${ALPHABET.length} lettere</span></div>
    <div class="progress"><div style="width:${Math.round((n / ALPHABET.length) * 100)}%"></div></div></div>
    <button class="big" id="alCards">Flashcard <span>${d} da fare</span></button>
    <button class="big alt" id="alQuiz">Quiz delle lettere <span>senza fine</span></button>`;
}
function bindAlpha() {
  $("#alCards").onclick = startAlphaCards;
  $("#alQuiz").onclick = startAlphaQuiz;
}

function startAlphaCards() {
  const due = ALPHABET.map((_, k) => k).filter((k) => !state.al[k] || state.al[k].due <= today());
  const queue = shuffle(due.filter((k) => state.al[k]).concat(due.filter((k) => !state.al[k]).slice(0, 6))).slice(0, 12);
  if (!queue.length) {
    view.innerHTML = `<div class="done"><div class="emoji">🎉</div><h2>Per oggi hai finito</h2>
      <p>Tutte le lettere sono ripassate. Torna domani, oppure metti alla prova quello che sai.</p>
      <button class="big" id="b1">Fai il quiz</button><button class="big alt" id="b2">Alfabeto</button></div>`;
    $("#b1").onclick = startAlphaQuiz; $("#b2").onclick = () => go("alpha");
    return;
  }
  let i = 0, right = 0;
  const show = () => {
    if (i >= queue.length) {
      view.innerHTML = `<div class="done"><div class="emoji">✅</div><h2>Sessione finita</h2><p>Ne sapevi ${right} su ${queue.length}.</p>
        <button class="big" id="b1">Fai il quiz</button><button class="big alt" id="b2">Alfabeto</button></div>`;
      $("#b1").onclick = startAlphaQuiz; $("#b2").onclick = () => go("alpha");
      return;
    }
    const k = queue[i], l = ALPHABET[k], opts = alphaOpts(k);
    view.innerHTML = `
      <div class="progress"><div style="width:${(i / queue.length) * 100}%"></div></div>
      <p class="count">${i + 1} / ${queue.length}</p>
      <div class="card" id="card">
        <div class="gr xl">${both(k)}</div>
        <button class="spk" id="spk" aria-label="Ascolta">🔊</button>
        <p class="tap">Qual è il nome di questa lettera?</p>
      </div>
      <div class="opts">${opts.map((o) => `<button class="opt" data-k="${o}">${both(o)} · ${esc(ALPHABET[o][2])}</button>`).join("")}</div>
      <p class="fb" id="fb"></p>`;
    $("#spk").onclick = (e) => { e.stopPropagation(); speak(l[2]); };
    view.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
      const o = +b.dataset.k, ok = o === k;
      view.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (+x.dataset.k === k) x.classList.add("ok"); });
      if (!ok) b.classList.add("bad");
      gradeLetter(k, ok); logAnswer(ok); if (ok) right++;
      speak(l[2]);
      $("#fb").innerHTML = `${ok ? "✅ Giusto!" : "❌ Era"} <b>${both(k)}</b> <i>${esc(l[2])}</i> · ${ALPHA_IT[k]}<br>${esc(l[3])}
        <button class="big" id="nx">Avanti</button>`;
      $("#nx").onclick = () => { i++; show(); };
    }));
  };
  show();
}

// Quiz senza fine: le lettere tornano a ripetizione (più spesso quelle deboli o appena sbagliate) finché non premi «Termina».
function pickLetter(recent, boost) {
  const pool = ALPHABET.map((_, k) => k).filter((k) => !recent.includes(k));
  const wt = (k) => (alphaBox(k) <= 0 ? 4 : alphaBox(k) <= 2 ? 2.5 : 1) + (boost[k] || 0);
  let r = Math.random() * pool.reduce((s, k) => s + wt(k), 0);
  for (const k of pool) { r -= wt(k); if (r <= 0) return k; }
  return pool[pool.length - 1];
}

function startAlphaQuiz() {
  const kinds = ["name", "name", "letter", "sound"]; // lettera→nome (il più frequente), nome→lettera, ascolto→lettera
  let n = 0, right = 0, run = 0;
  const missed = [], recent = [], boost = {};
  const show = () => {
    const i = pickLetter(recent, boost);
    recent.push(i); if (recent.length > 4) recent.shift();
    Object.keys(boost).forEach((k) => { boost[k] = Math.max(0, boost[k] - 1); });
    const q = { i, kind: kinds[Math.floor(Math.random() * kinds.length)], up: Math.random() < 0.5 };
    const l = ALPHABET[i], opts = alphaOpts(i);
    const ask = q.kind === "name" ? "Come si chiama questa lettera?" : q.kind === "letter" ? "Quale lettera è questa?" : "Ascolta: quale lettera è?";
    const bigHtml = q.kind === "name" ? `<div class="gr xl">${q.up ? l[0] : lower(i)}</div>`
      : q.kind === "letter" ? `<div class="gr lg">${ALPHA_IT[i]}</div>`
      : `<button class="replay" id="spk" aria-label="Riascolta">🔊</button>`;
    view.innerHTML = `
      <div class="qtop"><button class="back" id="end">Termina</button><span>${right} giuste su ${n}${run >= 3 ? " · 🔥 " + run : ""}</span></div>
      <div class="card" style="min-height:210px"><div class="prompt">${ask}</div>${bigHtml}</div>
      <div class="opts">${opts.map((k) => `<button class="opt" data-k="${k}">${q.kind === "name" ? ALPHA_IT[k] : both(k)}</button>`).join("")}</div>
      <div class="fb" id="fb"></div>`;
    $("#end").onclick = () => (n ? alphaResult(right, n, missed) : go("alpha"));
    if (q.kind === "sound") { $("#spk").onclick = () => speak(l[2]); speak(l[2]); }
    view.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
      const ok = +b.dataset.k === i;
      view.querySelectorAll(".opt").forEach((o) => { o.disabled = true; if (+o.dataset.k === i) o.classList.add("ok"); });
      n++;
      if (ok) { right++; run++; } else { b.classList.add("bad"); missed.push(i); run = 0; boost[i] = 3; }
      gradeLetter(i, ok); logAnswer(ok);
      if (q.kind !== "sound") speak(l[2]);
      $("#fb").innerHTML = `<p class="note">${ok ? "✓ Giusto! " : "Era "}<b>${both(i)}</b>: si chiama <b>${ALPHA_IT[i]}</b> (${esc(l[2])})</p><button class="big" id="nx" style="justify-content:center">Avanti</button>`;
      $("#nx").onclick = show;
    }));
  };
  show();
}

function alphaResult(right, total, missed) {
  const uniq = [...new Set(missed)];
  view.innerHTML = `<div class="done"><div class="emoji">${right === total ? "🏆" : right >= total * 0.7 ? "👍" : "💪"}</div><h2>${right} / ${total}</h2>
    <p>${uniq.length ? "Da rivedere: " + uniq.map((k) => `<b>${both(k)}</b> (${ALPHA_IT[k]})`).join(" · ") : "Nessun errore!"}</p>
    <button class="big" id="again">Ancora un quiz</button><button class="big alt" id="fc">Flashcard</button><button class="big alt" id="bk">Alfabeto</button></div>`;
  $("#again").onclick = startAlphaQuiz; $("#fc").onclick = startAlphaCards; $("#bk").onclick = () => go("alpha");
}