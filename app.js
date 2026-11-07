// Ελληνικά — app per imparare il greco moderno. Tutto offline, progressi salvati sul telefono.
const KEY = "ellinika-v1";
const INTERVALS = [0, 1, 3, 7, 14, 30]; // giorni per ogni "scatola" Leitner
const $ = (s) => document.querySelector(s);
const view = $("#view");

const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
const fresh = () => ({ cards: {}, streak: { last: -1, count: 0 }, reviews: 0, cat: "tutte", done: {}, last: null, added: {}, pu: {}, pl: {}, free: false, goal: 20, log: {}, ach: {}, bk: 0, tp: 0, perf: 0, err: {}, al: {} });

function load() {
  try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY)) || {}); }
  catch (e) { return fresh(); }
}
let state = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- Mazzo: parole base + parole delle lezioni aggiunte al ripasso ----------
const BASE_WORDS = WORDS.slice();
const isShort = (r) => r[0].trim().split(/\s+/).length <= 4;
function lessonWords() {
  const out = [];
  LEVELS.forEach((l, a) => l.sections.forEach((s, b) => {
    if (!state.added[a + "-" + b]) return;
    (s.rows || []).forEach((r, i) => { if (isShort(r)) out.push({ id: `L${a}-${b}-${i}`, cat: "lezioni", gr: r[0], tr: r[1], it: r[2] }); });
  }));
  return out;
}
function syncDeck() { WORDS.length = 0; WORDS.push(...BASE_WORDS, ...lessonWords()); }
syncDeck();

// ---------- Audio ----------
// Prima i file registrati in audio/ (lista.json: testo -> file, creati con genera_audio.py),
// altrimenti la voce greca del dispositivo.
let AUDIO = {};          // testo pulito -> nome file
let audioOk = false;     // almeno un file audio è stato caricato
const clips = new Map(); // nome file -> blob URL, tenuti in memoria così partono subito al tocco
const player = new Audio();
let queueId = 0;

const speechText = (text) => text.split("→").pop().replace(/[…;?]/g, "").replace(/[\/·]/g, ",").trim();

async function clipUrl(file) {
  if (clips.has(file)) return clips.get(file);
  const r = await fetch("audio/" + file);
  if (!r.ok) throw new Error("clip mancante");
  const url = URL.createObjectURL(await r.blob());
  clips.set(file, url);
  audioOk = true;
  return url;
}
async function warmClips() { // scarica in background tutti i file, così funzionano anche offline
  const files = [...new Set(Object.values(AUDIO))];
  let i = 0, fails = 0;
  const worker = async () => {
    while (i < files.length) {
      if (fails >= 5 && !audioOk) return; // i file non ci sono: inutile insistere
      try { await clipUrl(files[i++]); } catch (e) { fails++; }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
}
fetch("audio/lista.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((m) => {
  AUDIO = m;
  if (Object.keys(m).length) setTimeout(warmClips, 1500);
});

// iOS: il primo suono deve partire da un tocco. Sblocco il player con un file silenzioso al primo tocco.
const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
function unlockAudio() {
  document.removeEventListener("pointerdown", unlockAudio);
  player.src = SILENT;
  player.play().then(() => { if (player.src === SILENT) player.pause(); }).catch(() => {});
}
document.addEventListener("pointerdown", unlockAudio);

function greekVoice() {
  return "speechSynthesis" in window && speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith("el"));
}
function utter(text) {
  const u = new SpeechSynthesisUtterance(speechText(text));
  u.lang = "el-GR"; u.rate = 0.85;
  const v = greekVoice();
  if (v) u.voice = v;
  return u;
}
let pendingClip = null; // { res, rej } dell'mp3 attualmente in attesa: va sbloccato se un nuovo audio lo interrompe
function settlePendingClip() {
  if (!pendingClip) return;
  const p = pendingClip; pendingClip = null;
  p.res(); // interrotto, non è un errore: lo risolviamo e basta, così la chiamata che lo aspettava non resta bloccata per sempre
}
function playUrl(url) {
  return new Promise((res, rej) => {
    settlePendingClip();
    pendingClip = { res, rej };
    player.onended = () => { pendingClip = null; res(); };
    player.onerror = () => { pendingClip = null; rej(new Error("riproduzione audio non riuscita")); };
    player.src = url;
    player.play().catch((e) => { pendingClip = null; rej(e); });
  });
}
function synthSay(text) {
  return new Promise((res) => {
    if (!("speechSynthesis" in window)) { toast("Audio non disponibile su questo dispositivo"); return res(); }
    if (!greekVoice() && speechSynthesis.getVoices().length) toast("Manca la voce greca: la pronuncia non sarà corretta");
    const u = utter(text);
    u.onend = u.onerror = res;
    speechSynthesis.speak(u);
  });
}
async function playList(list) {
  const id = ++queueId;
  player.pause();
  settlePendingClip(); // sblocca subito un eventuale audio precedente ancora in attesa, prima di iniziarne uno nuovo
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  for (const t of list) {
    if (id !== queueId) return; // un nuovo audio ha preso il posto di questo
    const file = AUDIO[speechText(t)];
    let done = false;
    if (file) {
      try {
        const url = clips.get(file) || (await clipUrl(file)); // già in memoria: parte subito, dentro il tocco
        if (id !== queueId) return;
        await playUrl(url);
        done = true;
      } catch (e) { /* file mancante o bloccato: ripiego sulla voce del dispositivo */ }
    }
    if (!done && id === queueId) await synthSay(t);
  }
}
const speak = (text) => playList([text]);
const speakMany = (list) => playList(list);
if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = () => {};

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 3200);
}

// ---------- Logica di ripasso ----------
const pool = () => WORDS.filter((w) => state.cat === "tutte" || w.cat === state.cat);
const boxOf = (w) => (state.cards[w.id] ? state.cards[w.id].box : -1);
const isDue = (w) => !state.cards[w.id] || state.cards[w.id].due <= today();
const learnedCount = () => WORDS.filter((w) => boxOf(w) >= 3).length;

function grade(w, known) {
  const c = state.cards[w.id] || { box: 0, due: 0 };
  c.box = known ? Math.min(c.box + 1, INTERVALS.length - 1) : 0;
  c.due = today() + (known ? INTERVALS[c.box] : 0);
  state.cards[w.id] = c;
  const e = state.err[w.id] || 0; // errori netti: +1 se sbagli, -1 se rispondi bene
  if (known) { if (e > 1) state.err[w.id] = e - 1; else delete state.err[w.id]; } else state.err[w.id] = Math.min(e + 1, 9);
  logAnswer(known); // progress.js: conta la risposta, aggiorna serie, obiettivo e traguardi, salva
}
function touchStreak() {
  const t = today(), s = state.streak;
  if (s.last === t) return;
  s.count = s.last === t - 1 ? s.count + 1 : 1;
  s.best = Math.max(s.best || 0, s.count);
  s.last = t;
}
function currentStreak() {
  const s = state.streak, t = today();
  return s.last === t || s.last === t - 1 ? s.count : 0;
}

// ---------- Navigazione ----------
let tab = "home";
const NAV_OF = { quiz: "train", match: "train", dict: "train", tank: "home" };
function go(t) {
  if (tab === "tank") window.TankBattle.leave();
  tab = t;
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === (NAV_OF[t] || t)));
  // renderHome (il percorso a livelli) è in path.js
  ({ home: renderHome, train: renderTrain, lessons: renderLessons, review: startReview, quiz: startQuiz, alpha: renderAlpha, match: startMatch, stats: renderStats, dict: renderDict, tank: () => window.TankBattle.hub() })[t]();
  window.scrollTo(0, 0);
}
document.querySelectorAll("nav button").forEach((b) => (b.onclick = () => {
  if (b.dataset.tab === "lessons") { lv = null; sec = null; } // toccare la tab riporta alla lista dei livelli
  go(b.dataset.tab);
}));

// ---------- Allenati (la vecchia home: esercizi liberi) ----------
function renderTrain() {
  if (state.cat === "lezioni" && !WORDS.some((w) => w.cat === "lezioni")) state.cat = "tutte";
  const due = pool().filter(isDue).length;
  const L = state.last && LEVELS[state.last.lv] && LEVELS[state.last.lv].sections[state.last.sec];
  const lastBtn = L ? `<button class="big alt" id="goLast">Continua la lezione <span>${esc(L.t)}</span></button>` : "";
  const chips = [["tutte", "Tutte", "📚"]].concat(CATS.map((c) => [c.id, c.nome, c.emoji])).concat(WORDS.some((w) => w.cat === "lezioni") ? [["lezioni", "Dalle lezioni", "📖"]] : [])
    .map(([id, n, e]) => `<button class="chip ${state.cat === id ? "on" : ""}" data-cat="${id}">${e} ${esc(n)}</button>`).join("");
  view.innerHTML = `
    <h1>Allenati <small>esercizi liberi, quando e come vuoi</small></h1>
    <div class="stats">
      <div><b>${currentStreak()}</b><span>giorni di fila 🔥</span></div>
      <div><b>${learnedCount()}<i>/${WORDS.length}</i></b><span>parole imparate</span></div>
      <div><b>${state.reviews}</b><span>ripassi fatti</span></div>
    </div>
    <h2>Scegli un tema</h2>
    <div class="chips">${chips}</div>
    <button class="big" id="goReview">Ripassa ora <span>${due} da fare</span></button>
    ${lastBtn}
    <button class="big alt" id="goQuiz">Fai un quiz <span>10 domande</span></button>
    <button class="big alt" id="goMatch">Abbina le coppie <span>gioco</span></button>
    <button class="big alt" id="goErr">Ripassa i miei errori <span>${errCount()} parole</span></button>
    <button class="big alt" id="goDict">Dizionario <span>cerca parole</span></button>
    <button class="big alt" id="goFill">Completa la frase <span>dalle lezioni</span></button>
    <button class="big alt" id="goConj">Allena i verbi <span>coniugazioni</span></button>
    <button class="big alt" id="goLessons">Leggi le lezioni <span>${LEVELS.length} livelli</span></button>
    <button class="big alt" id="goAlpha">Impara l'alfabeto <span>Α–Ω</span></button>
    <p class="hint">Consiglio: 10 minuti al giorno valgono più di un'ora una volta a settimana.</p>`;
  view.querySelectorAll(".chip").forEach((c) => (c.onclick = () => { state.cat = c.dataset.cat; save(); renderTrain(); }));
  $("#goReview").onclick = () => go("review");
  $("#goQuiz").onclick = () => go("quiz");
  $("#goMatch").onclick = () => go("match");
  $("#goErr").onclick = startErrors;
  $("#goDict").onclick = () => go("dict");
  $("#goConj").onclick = () => startConj(LEVELS.flatMap((l) => l.sections), () => go("train"), "Allenati");
  $("#goFill").onclick = () => startFill(LEVELS.flatMap((l) => l.sections), () => go("train"), "Allenati");
  if ($("#goLast")) $("#goLast").onclick = () => { lv = state.last.lv; sec = state.last.sec; go("lessons"); };
  $("#goAlpha").onclick = () => go("alpha");
  $("#goLessons").onclick = () => { lv = null; sec = null; go("lessons"); };
}

// ---------- Ripasso ----------
// La versione vera è in ripasso.js (sostituisce questa funzione): niente più "lo so/non lo so",
// un esercizio diverso in base a quanto conosci ogni parola.
function startReview() { if (window.console) console.warn("startReview: ripasso.js non è stato caricato"); }

// ---------- Quiz (4 tipi di domanda) ----------
// Confronto tollerante: ignora accenti, maiuscole, spazi e punteggiatura; ς = σ.
const norm = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/ς/g, "σ").replace(/[^a-z0-9α-ω]/g, "");
const sameAnswer = (input, w) => { const n = norm(input); return n !== "" && (n === norm(w.tr) || n === norm(w.gr)); };

function startQuiz() {
  const p = pool();
  if (p.length < 4) { view.innerHTML = `<p class="hint">Serve un tema con almeno 4 parole. Scegli "Tutte" nella home.</p>`; return; }
  // gr2it: greco→italiano · it2gr: italiano→greco · listen: ascolto→italiano · type: scrivi la risposta
  const kinds = "speechSynthesis" in window ? ["gr2it", "it2gr", "listen", "type"] : ["gr2it", "it2gr", "type"];
  const words = shuffle(p).slice(0, 10);
  const order = shuffle(words.map((_, n) => kinds[n % kinds.length]));
  const qs = words.map((w, n) => {
    const kind = order[n];
    const wrong = shuffle(WORDS.filter((x) => x.id !== w.id && (x.cat === w.cat || p.length < 8))).slice(0, 3);
    const extra = shuffle(WORDS.filter((x) => x.id !== w.id && !wrong.includes(x))).slice(0, 3 - wrong.length);
    return { w, kind, opts: shuffle([w].concat(wrong, extra)) };
  });
  let i = 0, score = 0;
  const LABEL = { gr2it: "Che cosa significa?", it2gr: "Come si dice in greco?", listen: "Ascolta e scegli il significato", type: "Scrivilo in greco o con lettere latine" };
  const show = () => {
    if (i >= qs.length) {
      view.innerHTML = `<div class="done"><div class="emoji">${score >= 8 ? "🏆" : score >= 5 ? "👍" : "💪"}</div>
        <h2>${score} / ${qs.length}</h2><p>${score >= 8 ? "Bravissimo!" : score >= 5 ? "Bene, continua così!" : "Ripassa ancora un po' e riprova."}</p>
        <button class="big" id="again">Rifai il quiz</button><button class="big alt" id="home">Allenati</button></div>`;
      $("#again").onclick = startQuiz; $("#home").onclick = () => go("train");
      return;
    }
    const q = qs[i], w = q.w;
    const main = q.kind === "listen" ? "🔊" : esc(q.kind === "gr2it" ? w.gr : w.it);
    const spk = q.kind === "gr2it" || q.kind === "listen" ? `<button class="spk" id="spk" aria-label="Ascolta">🔊</button>` : "";
    const body = q.kind === "type"
      ? `<div class="typebox"><input id="ans" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Scrivi qui la risposta">
           <button class="big" id="chk" style="justify-content:center">Controlla</button>
           <button class="big alt" id="skip" style="justify-content:center">Salta</button></div>`
      : `<div class="opts">${q.opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(q.kind === "it2gr" ? o.gr : o.it)}</button>`).join("")}</div>`;
    view.innerHTML = `
      <div class="progress"><div style="width:${(i / qs.length) * 100}%"></div></div>
      <p class="count">Domanda ${i + 1} / ${qs.length}</p>
      <div class="card q">
        <div class="prompt">${LABEL[q.kind]}</div>
        <div class="gr">${main}</div>${spk}
      </div>${body}<p class="fb" id="fb"></p>`;
    if (spk) $("#spk").onclick = () => speak(w.gr);
    if (q.kind === "listen") speak(w.gr);

    const reveal = (ok) => {
      if (ok) score++;
      grade(w, ok);
      speak(w.gr);
      $("#fb").innerHTML = `${ok ? "✅ Giusto!" : "❌ Era"} <b>${esc(w.gr)}</b> <i>(${esc(w.tr)})</i> = ${esc(w.it)}
        <button class="big" id="nx">${i + 1 === qs.length ? "Vedi il risultato" : "Avanti"}</button>`;
      $("#nx").onclick = () => { i++; show(); };
    };

    if (q.kind === "type") {
      const inp = $("#ans");
      let answered = false;
      const check = () => {
        if (answered) return;
        if (!inp.value.trim()) return toast("Scrivi una risposta, anche solo con lettere latine");
        answered = true; inp.disabled = true; $("#chk").hidden = true;
        const ok = sameAnswer(inp.value, w);
        inp.classList.add(ok ? "ok" : "bad");
        reveal(ok);
        $("#nx").focus();
      };
      $("#chk").onclick = check;
      inp.onkeydown = (e) => { if (e.key === "Enter") check(); };
      $("#skip").onclick = () => { if (answered) return; answered = true; inp.disabled = true; $("#chk").hidden = true; $("#skip").hidden = true; reveal(false); };
    } else {
      view.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        const ok = q.opts[+b.dataset.k].id === w.id;
        view.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (q.opts[+x.dataset.k].id === w.id) x.classList.add("ok"); });
        if (!ok) b.classList.add("bad");
        reveal(ok);
      }));
    }
  };
  show();
}

// ---------- Abbina le coppie ----------
function startMatch() {
  const p = pool();
  if (p.length < 4) { view.innerHTML = `<p class="hint">Serve un tema con almeno 4 parole. Scegli "Tutte" nella home.</p>`; return; }
  const ws = shuffle(p).slice(0, Math.min(6, p.length));
  const left = shuffle(ws), right = shuffle(ws);
  const missed = new Set();
  let sel = null, found = 0, errors = 0;
  view.innerHTML = `<h1>Abbina <small>tocca una parola greca e il suo significato</small></h1>
    <div class="match">
      <div>${left.map((w) => `<button class="mt" data-side="l" data-id="${w.id}">${esc(w.gr)}</button>`).join("")}</div>
      <div>${right.map((w) => `<button class="mt" data-side="r" data-id="${w.id}">${esc(w.it)}</button>`).join("")}</div>
    </div><p class="count" id="cnt">0 / ${ws.length} coppie</p><div id="end"></div>`;
  const finish = () => {
    ws.forEach((w) => grade(w, !missed.has(w.id)));
    $("#end").innerHTML = `<div class="done"><div class="emoji">${errors === 0 ? "🏆" : errors <= 3 ? "👍" : "💪"}</div>
      <h2>${errors === 0 ? "Nessun errore!" : errors === 1 ? "1 errore" : errors + " errori"}</h2>
      <button class="big" id="again">Altro giro</button><button class="big alt" id="home">Allenati</button></div>`;
    $("#again").onclick = startMatch; $("#home").onclick = () => go("train");
  };
  view.querySelectorAll(".mt").forEach((b) => (b.onclick = () => {
    if (b.disabled) return;
    const side = b.dataset.side, id = b.dataset.id;
    if (side === "l") speak(WORDS.find((x) => x.id === id).gr);
    if (!sel || sel.side === side) { // nuova selezione, o cambio di scelta sullo stesso lato
      if (sel) sel.el.classList.remove("sel");
      sel = { side, id, el: b }; b.classList.add("sel");
      return;
    }
    const prev = sel; sel = null;
    prev.el.classList.remove("sel");
    if (prev.id === id) {
      [prev.el, b].forEach((x) => { x.classList.add("ok"); x.disabled = true; });
      found++; $("#cnt").textContent = `${found} / ${ws.length} coppie`;
      if (found === ws.length) finish();
    } else {
      errors++; missed.add(prev.id); missed.add(id);
      [prev.el, b].forEach((x) => x.classList.add("bad"));
      setTimeout(() => [prev.el, b].forEach((x) => x.classList.remove("bad")), 500);
    }
  }));
}

// ---------- Completa la frase (generato dalle lezioni) ----------
// @fill-pure-start
const coreOf = (t) => t.replace(/[.,!?;:·«»"“”()…]/g, "");
const isWord = (c) => /^\p{L}+$/u.test(c);
function sentencesIn(secs) {
  const out = [];
  secs.forEach((s) => {
    (s.dialog || []).forEach((d) => out.push({ gr: d[1], it: d[2], tr: "" }));
    (s.rows || []).forEach((r) => {
      if (/[\/→…(]/.test(r[0]) || r[0].trim().split(/\s+/).length < 3) return;
      out.push({ gr: r[0], it: r[2], tr: r[1] });
    });
  });
  return out;
}
let _cores = null;
function allCores() {
  if (!_cores) {
    const m = new Map();
    sentencesIn(LEVELS.flatMap((l) => l.sections)).forEach((s) =>
      s.gr.split(/\s+/).map(coreOf).filter((c) => isWord(c) && [...c].length >= 3).forEach((c) => m.set(norm(c), c)));
    _cores = [...m.values()];
  }
  return _cores;
}
function makeFillQs(secs, n = 8) {
  const qs = [];
  shuffle(sentencesIn(secs)).forEach((s) => {
    if (qs.length >= n) return;
    const toks = s.gr.split(/\s+/);
    const pick = (min) => toks.map((t, i) => [i, coreOf(t)]).filter(([, c]) => isWord(c) && [...c].length >= min);
    const cand = pick(4).length ? pick(4) : pick(3);
    if (!cand.length) return;
    const [k, ans] = shuffle(cand)[0];
    const cap = ans[0] !== ans[0].toLowerCase();
    const fit = (w) => (cap ? w[0].toUpperCase() : w[0].toLowerCase()) + w.slice(1);
    const here = new Set(toks.map((t) => norm(coreOf(t))));
    const len = [...ans].length;
    const pool = allCores().filter((c) => !here.has(norm(c)));
    const d = shuffle(pool.filter((c) => Math.abs([...c].length - len) <= 2)).concat(shuffle(pool))
      .filter((c, i, arr) => arr.indexOf(c) === i).slice(0, 3).map(fit);
    if (d.length < 3) return;
    qs.push({ s, ans, text: toks.map((t, i) => (i === k ? t.replace(ans, "_____") : t)).join(" "), opts: shuffle([ans].concat(d)) });
  });
  return qs;
}
// @fill-pure-end

function startFill(secs, back, backLabel) {
  const qs = makeFillQs(secs);
  if (qs.length < 3) return toast("Servono almeno 3 frasi per questo esercizio");
  let i = 0, score = 0;
  const show = () => {
    if (i >= qs.length) {
      view.innerHTML = `<div class="done"><div class="emoji">${score >= qs.length * 0.8 ? "🏆" : score >= qs.length / 2 ? "👍" : "💪"}</div>
        <h2>${score} / ${qs.length}</h2><p>${score >= qs.length * 0.8 ? "Bravissimo!" : "Rileggi la lezione e riprova."}</p>
        <button class="big" id="again">Rifai</button><button class="big alt" id="bk2">${esc(backLabel)}</button></div>`;
      $("#again").onclick = () => startFill(secs, back, backLabel); $("#bk2").onclick = back;
      return;
    }
    const q = qs[i];
    view.innerHTML = `
      <div class="progress"><div style="width:${(i / qs.length) * 100}%"></div></div>
      <p class="count">Frase ${i + 1} / ${qs.length}</p>
      <div class="card q"><div class="prompt">Completa la frase</div>
        <div class="gr sm">${esc(q.text)}</div><div class="it sm">${esc(q.s.it)}</div></div>
      <div class="opts">${q.opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join("")}</div>
      <p class="fb" id="fb"></p>`;
    view.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
      const ok = q.opts[+b.dataset.k] === q.ans;
      view.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (q.opts[+x.dataset.k] === q.ans) x.classList.add("ok"); });
      if (!ok) b.classList.add("bad"); else score++;
      logAnswer(ok);
      speak(q.s.gr);
      $("#fb").innerHTML = `${ok ? "✅ Giusto!" : "❌ La parola era " + esc(q.ans) + "."}<br><b>${esc(q.s.gr)}</b>${q.s.tr ? ` <i>(${esc(q.s.tr)})</i>` : ""}
        <button class="big" id="nx">${i + 1 === qs.length ? "Vedi il risultato" : "Avanti"}</button>`;
      $("#nx").onclick = () => { i++; show(); };
    }));
  };
  show();
}

// ---------- Allenatore di coniugazioni (dalle tabelle delle lezioni) ----------
// @conj-pure-start
function makeConjQs(secs, n = 10) {
  const items = [];
  secs.forEach((s) => { if (s.conj) s.conj.rows.forEach((r, i) => { for (let j = 1; j < r.length; j++) items.push({ s, r, i, j }); }); });
  const qs = [];
  shuffle(items).forEach(({ s, r, i, j }) => {
    if (qs.length >= n) return;
    const ans = r[j], pool = [];
    s.conj.rows.forEach((rr, ii) => { if (ii !== i) pool.push(rr[j]); }); // altre persone, stessa colonna
    for (let jj = 1; jj < r.length; jj++) if (jj !== j) pool.push(r[jj]); // stessa persona, altre colonne
    const seen = new Set([norm(ans[0])]);
    const d = shuffle(pool).filter((c) => !seen.has(norm(c[0])) && seen.add(norm(c[0]))).slice(0, 3);
    if (d.length < 3) return;
    qs.push({ pron: r[0], col: s.conj.head[j], ans, opts: shuffle([ans].concat(d)) });
  });
  return qs;
}
// @conj-pure-end

function startConj(secs, back, backLabel) {
  const qs = makeConjQs(secs);
  if (qs.length < 3) return toast("Servono almeno 3 forme per questo esercizio");
  let i = 0, score = 0;
  const show = () => {
    if (i >= qs.length) {
      view.innerHTML = `<div class="done"><div class="emoji">${score >= qs.length * 0.8 ? "🏆" : score >= qs.length / 2 ? "👍" : "💪"}</div>
        <h2>${score} / ${qs.length}</h2><p>${score >= qs.length * 0.8 ? "Bravissimo!" : "Ripassa la tabella e riprova."}</p>
        <button class="big" id="again">Rifai</button><button class="big alt" id="bk2">${esc(backLabel)}</button></div>`;
      $("#again").onclick = () => startConj(secs, back, backLabel); $("#bk2").onclick = back;
      return;
    }
    const q = qs[i], typed = i % 2 === 1;
    view.innerHTML = `
      <div class="progress"><div style="width:${(i / qs.length) * 100}%"></div></div>
      <p class="count">Forma ${i + 1} / ${qs.length}</p>
      <div class="card q"><div class="prompt">Coniuga: ${esc(q.col)}</div>
        <div class="gr${q.pron[0].length > 8 ? " sm" : ""}">${esc(q.pron[0])}</div><div class="it sm">${esc(q.pron[2])}</div></div>
      ${typed
        ? `<div class="typebox"><input id="ans" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Scrivi in greco o come si pronuncia">
           <button class="big" id="chk" style="justify-content:center">Controlla</button></div>`
        : `<div class="opts">${q.opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o[0])}</button>`).join("")}</div>`}
      <p class="fb" id="fb"></p>`;
    const reveal = (ok) => {
      if (ok) score++;
      logAnswer(ok);
      speak(q.ans[0]);
      $("#fb").innerHTML = `${ok ? "✅ Giusto!" : "❌ Era"} <b>${esc(q.ans[0])}</b> <i>(${esc(q.ans[1])})</i>
        <button class="big" id="nx">${i + 1 === qs.length ? "Vedi il risultato" : "Avanti"}</button>`;
      $("#nx").onclick = () => { i++; show(); };
    };
    if (typed) {
      const inp = $("#ans");
      let answered = false;
      const check = () => {
        if (answered) return;
        if (!inp.value.trim()) return toast("Scrivi una risposta, anche solo con lettere latine");
        answered = true; inp.disabled = true; $("#chk").hidden = true;
        const ok = sameAnswer(inp.value, { gr: q.ans[0], tr: q.ans[1] });
        inp.classList.add(ok ? "ok" : "bad");
        reveal(ok); $("#nx").focus();
      };
      $("#chk").onclick = check;
      inp.onkeydown = (e) => { if (e.key === "Enter") check(); };
    } else {
      view.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        const ok = q.opts[+b.dataset.k] === q.ans;
        view.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (q.opts[+x.dataset.k] === q.ans) x.classList.add("ok"); });
        if (!ok) b.classList.add("bad");
        reveal(ok);
      }));
    }
  };
  show();
}

// ---------- Alfabeto ----------
function renderAlpha() {
  view.innerHTML = `
    <h1>Alfabeto <small>το αλφάβητο</small></h1>
    ${alphaHub()}
    <h2>Tutte le lettere</h2>
    <p class="hint" style="margin-top:0">Tocca una lettera per ascoltarne il nome.</p>
    <div class="grid">${ALPHABET.map((l, i) => `<button class="letter${alphaBox(i) >= 3 ? " got" : ""}" data-i="${i}"><b>${l[0]}${l[1].split(" ")[0]}</b><span>${esc(l[2])}</span></button>`).join("")}</div>
    <div id="detail" class="detail" hidden></div>
    <h2>Gruppi di lettere</h2>
    <div class="dig">${DIGRAPHS.map((d) => `<div><b>${d[0]}</b><span>${esc(d[1])}</span><em>${esc(d[2])}</em></div>`).join("")}</div>`;
  view.querySelectorAll(".letter").forEach((b) => (b.onclick = () => {
    const l = ALPHABET[+b.dataset.i];
    const d = $("#detail");
    d.hidden = false;
    d.innerHTML = `<div class="big-letter">${l[0]} ${l[1]}</div><div><b>${esc(l[2])}</b> · ${ALPHA_IT[+b.dataset.i]}<br>${esc(l[3])}</div>`;
    speak(l[2]);
  }));
  bindAlpha();
}

// ---------- Lezioni per livelli ----------
// lv = livello aperto, sec = sezione aperta (null = nessuno: si vede l'elenco precedente)
let lv = null, sec = null;
const countRows = (l) => l.sections.reduce((n, s) => n + (s.rows ? s.rows.length : 0) + (s.dialog ? s.dialog.length : 0), 0);

function renderLessons() {
  if (lv === null) return lessonLevels();
  if (sec === null) return lessonSections();
  return lessonSection();
}
function openLessons(l, s) { lv = l; sec = s; renderLessons(); window.scrollTo(0, 0); }

function lessonLevels() {
  view.innerHTML = `<h1>Lezioni <small>leggi parole e frasi, livello per livello</small></h1>
    <p class="hint">Tocca una riga per ascoltare la pronuncia. Ogni livello corrisponde a una dispensa.</p><button class="big alt" id="goDict2" style="margin-top:0">🔍 Cerca nel dizionario <span></span></button>` +
    LEVELS.map((l, i) => `<button class="lvl" data-i="${i}"><b>Livello ${l.n}</b><span>${esc(l.sub)}</span>
      <em>${l.sections.length} sezioni · ${countRows(l)} parole e frasi · ${l.sections.filter((_, j) => state.done[i + "-" + j]).length} completate</em></button>`).join("");
  view.querySelectorAll(".lvl").forEach((b) => (b.onclick = () => openLessons(+b.dataset.i, null)));
  $("#goDict2").onclick = () => go("dict");
}

function lessonSections() {
  const l = LEVELS[lv];
  view.innerHTML = `<button class="back" id="bk">← Tutti i livelli</button>
    <h1>Livello ${l.n} <small>${esc(l.sub)}</small></h1>` +
    l.sections.map((s, i) => `<button class="sec" data-i="${i}"><span>${esc(s.t)}</span><i${state.done[lv + "-" + i] ? ' class="done"' : ""}>${state.done[lv + "-" + i] ? "✓" : "›"}</i></button>`).join("")
    + (sentencesIn(l.sections).length >= 5 ? `<button class="big alt" id="fillLv" style="margin-top:16px">Completa la frase su tutto il livello <span></span></button>` : "");
  $("#bk").onclick = () => openLessons(null, null);
  if ($("#fillLv")) $("#fillLv").onclick = () => startFill(l.sections, () => openLessons(lv, null), "Torna al livello");
  view.querySelectorAll(".sec").forEach((b) => (b.onclick = () => openLessons(lv, +b.dataset.i)));
}

function lessonSection() {
  const l = LEVELS[lv], s = l.sections[sec];
  state.last = { lv, sec }; save();
  const markDone = () => { state.done[lv + "-" + sec] = 1; save(); };
  const q = []; // testi da pronunciare: ogni elemento cliccabile ha un indice in q
  const sp = (t) => q.push(t) - 1;
  const cell = (c) => typeof c === "string"
    ? `<td class="lab">${esc(c)}</td>`
    : `<td class="t" data-s="${sp(c[0])}"><b>${esc(c[0])}</b><small>${esc(c[1] || "")}</small>${c[2] ? `<em>${esc(c[2])}</em>` : ""}</td>`;

  let h = `<button class="back" id="bk">← Livello ${l.n}</button><h1>${esc(s.t)}<small>Livello ${l.n} · sezione ${sec + 1} di ${l.sections.length}</small></h1>`;
  if (s.note) h += `<p class="note">${esc(s.note)}</p>`;
  if (s.conj) {
    h += `<div class="scroll"><table class="conj"><thead><tr>${s.conj.head.map((x) => `<th>${esc(x)}</th>`).join("")}</tr></thead>
      <tbody>${s.conj.rows.map((r) => `<tr>${r.map(cell).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  if (s.rows) {
    h += `<div class="words">${s.rows.map((r) => `<button class="wr" data-s="${sp(r[0])}">
      <span class="g">${esc(r[0])}</span><span class="p">${esc(r[1])}</span><span class="i">${esc(r[2])}</span><u>🔊</u></button>`).join("")}</div>`;
  }
  if (s.dialog) {
    const start = q.length;
    h += `<div class="dlg">${s.dialog.map((d) => `<button class="dl" data-s="${sp(d[1])}"><b>${esc(d[0])}</b>
      <span class="g">${esc(d[1])}</span><span class="i">${esc(d[2])}</span></button>`).join("")}</div>
      <button class="big alt" id="playAll">▶ Ascolta tutto il dialogo</button>`;
    s._start = start;
  }
  const key = lv + "-" + sec, nw = (s.rows || []).filter(isShort).length;
  const addTxt = () => (state.added[key] ? "✓ Nel ripasso (tocca per togliere)" : "Aggiungi al ripasso") + " ";
  if (nw) h += `<button class="big alt" id="addRev">${addTxt()}<span>${nw} voci</span></button>`;
  if (s.conj) h += `<button class="big alt" id="conjEx">Esercizio: coniuga questo verbo <span>6 persone</span></button>`;
  const nf = sentencesIn([s]).length;
  if (nf >= 3) h += `<button class="big alt" id="fill">Esercizio: completa la frase <span>${Math.min(nf, 8)} frasi</span></button>`;
  h += `<div class="pager">${sec > 0 ? `<button id="prev">← Precedente</button>` : "<span></span>"}
    ${sec < l.sections.length - 1 ? `<button id="next">Successiva →</button>` : `<button id="done">Fine livello ✓</button>`}</div>`;
  view.innerHTML = h;

  view.querySelectorAll("[data-s]").forEach((el) => (el.onclick = () => speak(q[+el.dataset.s])));
  $("#bk").onclick = () => openLessons(lv, null);
  if ($("#addRev")) $("#addRev").onclick = (e) => {
    if (state.added[key]) delete state.added[key]; else state.added[key] = 1;
    save(); syncDeck();
    e.currentTarget.firstChild.nodeValue = addTxt();
    if (state.added[key]) toast("Aggiunte al ripasso: torneranno a intervalli");
  };
  if ($("#conjEx")) $("#conjEx").onclick = () => startConj([s], () => openLessons(lv, sec), "Torna alla lezione");
  if ($("#fill")) $("#fill").onclick = () => startFill([s], () => openLessons(lv, sec), "Torna alla lezione");
  if (s.dialog) $("#playAll").onclick = () => speakMany(q.slice(s._start));
  if ($("#prev")) $("#prev").onclick = () => openLessons(lv, sec - 1);
  if ($("#next")) $("#next").onclick = () => { markDone(); openLessons(lv, sec + 1); };
  if ($("#done")) $("#done").onclick = () => { markDone(); openLessons(lv, null); };
}

// ---------- Avvio ----------
progressCheck(true); // recupera in silenzio i traguardi già meritati
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); // chiede al browser di non cancellare i dati
document.addEventListener("DOMContentLoaded", () => go("home"), { once: true });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
