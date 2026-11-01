// Ελληνικά — app per imparare il greco moderno. Tutto offline, progressi salvati sul telefono.
const KEY = "ellinika-v1";
const INTERVALS = [0, 1, 3, 7, 14, 30]; // giorni per ogni "scatola" Leitner
const $ = (s) => document.querySelector(s);
const view = $("#view");

const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
const fresh = () => ({ cards: {}, streak: { last: -1, count: 0 }, reviews: 0, cat: "tutte" });

function load() {
  try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY)) || {}); }
  catch (e) { return fresh(); }
}
let state = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- Audio (sintesi vocale del telefono) ----------
function greekVoice() {
  return speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith("el"));
}
function utter(text) {
  // Nelle righe "singolare → plurale" si pronuncia solo la parte dopo la freccia.
  const clean = text.split("→").pop().replace(/[…;?]/g, "").replace(/[\/·]/g, ",").trim();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = "el-GR"; u.rate = 0.85;
  const v = greekVoice();
  if (v) u.voice = v;
  return u;
}
function speak(text) {
  if (!("speechSynthesis" in window)) return toast("Sintesi vocale non disponibile su questo dispositivo");
  if (!greekVoice() && speechSynthesis.getVoices().length) toast("Installa la voce greca nelle impostazioni del telefono per sentire la pronuncia");
  speechSynthesis.cancel();
  speechSynthesis.speak(utter(text));
}
function speakMany(list) {
  if (!("speechSynthesis" in window)) return toast("Sintesi vocale non disponibile su questo dispositivo");
  speechSynthesis.cancel();
  list.forEach((t) => speechSynthesis.speak(utter(t)));
}
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
  state.reviews++;
  touchStreak();
  save();
}
function touchStreak() {
  const t = today(), s = state.streak;
  if (s.last === t) return;
  s.count = s.last === t - 1 ? s.count + 1 : 1;
  s.last = t;
}
function currentStreak() {
  const s = state.streak, t = today();
  return s.last === t || s.last === t - 1 ? s.count : 0;
}

// ---------- Navigazione ----------
let tab = "home";
function go(t) {
  tab = t;
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t));
  ({ home: renderHome, lessons: renderLessons, review: startReview, quiz: startQuiz, alpha: renderAlpha, match: startMatch })[t]();
  window.scrollTo(0, 0);
}
document.querySelectorAll("nav button").forEach((b) => (b.onclick = () => {
  if (b.dataset.tab === "lessons") { lv = null; sec = null; } // toccare la tab riporta alla lista dei livelli
  go(b.dataset.tab);
}));

// ---------- Home ----------
function renderHome() {
  const due = pool().filter(isDue).length;
  const chips = [["tutte", "Tutte", "📚"]].concat(CATS.map((c) => [c.id, c.nome, c.emoji]))
    .map(([id, n, e]) => `<button class="chip ${state.cat === id ? "on" : ""}" data-cat="${id}">${e} ${esc(n)}</button>`).join("");
  view.innerHTML = `
    <h1>Ελληνικά <small>greco moderno</small></h1>
    <div class="stats">
      <div><b>${currentStreak()}</b><span>giorni di fila 🔥</span></div>
      <div><b>${learnedCount()}<i>/${WORDS.length}</i></b><span>parole imparate</span></div>
      <div><b>${state.reviews}</b><span>ripassi fatti</span></div>
    </div>
    <h2>Scegli un tema</h2>
    <div class="chips">${chips}</div>
    <button class="big" id="goReview">Ripassa ora <span>${due} da fare</span></button>
    <button class="big alt" id="goQuiz">Fai un quiz <span>10 domande</span></button>
    <button class="big alt" id="goMatch">Abbina le coppie <span>gioco</span></button>
    <button class="big alt" id="goLessons">Leggi le lezioni <span>4 livelli</span></button>
    <button class="big alt" id="goAlpha">Impara l'alfabeto <span>Α–Ω</span></button>
    <p class="hint">Consiglio: 10 minuti al giorno valgono più di un'ora una volta a settimana.</p>`;
  view.querySelectorAll(".chip").forEach((c) => (c.onclick = () => { state.cat = c.dataset.cat; save(); renderHome(); }));
  $("#goReview").onclick = () => go("review");
  $("#goQuiz").onclick = () => go("quiz");
  $("#goMatch").onclick = () => go("match");
  $("#goAlpha").onclick = () => go("alpha");
  $("#goLessons").onclick = () => { lv = null; sec = null; go("lessons"); };
}

// ---------- Ripasso (flashcard a ripetizione dilazionata) ----------
function startReview() {
  const all = pool().filter(isDue);
  const fresh_ = all.filter((w) => !state.cards[w.id]).slice(0, 8);
  const old = all.filter((w) => state.cards[w.id]);
  const queue = shuffle(old.concat(fresh_));
  if (!queue.length) {
    view.innerHTML = `<div class="done"><div class="emoji">🎉</div><h2>Tutto in regola!</h2>
      <p>Per questo tema non hai nulla da ripassare. Prova un altro tema o fai un quiz.</p>
      <button class="big" id="b1">Fai un quiz</button></div>`;
    $("#b1").onclick = () => go("quiz");
    return;
  }
  let i = 0, right = 0;
  const show = () => {
    if (i >= queue.length) {
      view.innerHTML = `<div class="done"><div class="emoji">✅</div><h2>Sessione finita</h2>
        <p>Ne sapevi ${right} su ${queue.length}. Ottimo lavoro!</p>
        <button class="big" id="b1">Torna alla home</button></div>`;
      $("#b1").onclick = () => go("home");
      return;
    }
    const w = queue[i];
    view.innerHTML = `
      <div class="progress"><div style="width:${(i / queue.length) * 100}%"></div></div>
      <p class="count">${i + 1} / ${queue.length}</p>
      <div class="card" id="card">
        <div class="gr">${esc(w.gr)}</div>
        <button class="spk" id="spk" aria-label="Ascolta">🔊</button>
        <div class="back" id="back" hidden>
          <div class="tr">${esc(w.tr)}</div>
          <div class="it">${esc(w.it)}</div>
        </div>
        <p class="tap" id="tap">Tocca per vedere la traduzione</p>
      </div>
      <div class="row" id="btns" hidden>
        <button class="no" id="no">Non lo so</button>
        <button class="yes" id="yes">Lo so</button>
      </div>`;
    $("#spk").onclick = (e) => { e.stopPropagation(); speak(w.gr); };
    $("#card").onclick = () => {
      $("#back").hidden = false; $("#btns").hidden = false; $("#tap").hidden = true;
    };
    const next = (ok) => { grade(w, ok); if (ok) right++; i++; show(); };
    $("#no").onclick = () => next(false);
    $("#yes").onclick = () => next(true);
  };
  show();
}

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
        <button class="big" id="again">Rifai il quiz</button><button class="big alt" id="home">Home</button></div>`;
      $("#again").onclick = startQuiz; $("#home").onclick = () => go("home");
      return;
    }
    const q = qs[i], w = q.w;
    const main = q.kind === "listen" ? "🔊" : esc(q.kind === "gr2it" ? w.gr : w.it);
    const spk = q.kind === "gr2it" || q.kind === "listen" ? `<button class="spk" id="spk" aria-label="Ascolta">🔊</button>` : "";
    const body = q.kind === "type"
      ? `<div class="typebox"><input id="ans" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Scrivi qui la risposta">
           <button class="big" id="chk" style="justify-content:center">Controlla</button></div>`
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
      <button class="big" id="again">Altro giro</button><button class="big alt" id="home">Home</button></div>`;
    $("#again").onclick = startMatch; $("#home").onclick = () => go("home");
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

// ---------- Alfabeto ----------
function renderAlpha() {
  view.innerHTML = `
    <h1>Alfabeto <small>το αλφάβητο</small></h1>
    <p class="hint">Tocca una lettera per ascoltarne il nome.</p>
    <div class="grid">${ALPHABET.map((l, i) => `<button class="letter" data-i="${i}"><b>${l[0]}${l[1].split(" ")[0]}</b><span>${esc(l[2])}</span></button>`).join("")}</div>
    <div id="detail" class="detail" hidden></div>
    <h2>Gruppi di lettere</h2>
    <div class="dig">${DIGRAPHS.map((d) => `<div><b>${d[0]}</b><span>${esc(d[1])}</span><em>${esc(d[2])}</em></div>`).join("")}</div>`;
  view.querySelectorAll(".letter").forEach((b) => (b.onclick = () => {
    const l = ALPHABET[+b.dataset.i];
    const d = $("#detail");
    d.hidden = false;
    d.innerHTML = `<div class="big-letter">${l[0]} ${l[1]}</div><div><b>${esc(l[2])}</b><br>${esc(l[3])}</div>`;
    speak(l[2]);
  }));
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
    <p class="hint">Tocca una riga per ascoltare la pronuncia. Ogni livello corrisponde a una dispensa.</p>` +
    LEVELS.map((l, i) => `<button class="lvl" data-i="${i}"><b>Livello ${l.n}</b><span>${esc(l.sub)}</span>
      <em>${l.sections.length} sezioni · ${countRows(l)} parole e frasi</em></button>`).join("");
  view.querySelectorAll(".lvl").forEach((b) => (b.onclick = () => openLessons(+b.dataset.i, null)));
}

function lessonSections() {
  const l = LEVELS[lv];
  view.innerHTML = `<button class="back" id="bk">← Tutti i livelli</button>
    <h1>Livello ${l.n} <small>${esc(l.sub)}</small></h1>` +
    l.sections.map((s, i) => `<button class="sec" data-i="${i}"><span>${esc(s.t)}</span><i>›</i></button>`).join("");
  $("#bk").onclick = () => openLessons(null, null);
  view.querySelectorAll(".sec").forEach((b) => (b.onclick = () => openLessons(lv, +b.dataset.i)));
}

function lessonSection() {
  const l = LEVELS[lv], s = l.sections[sec];
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
  h += `<div class="pager">${sec > 0 ? `<button id="prev">← Precedente</button>` : "<span></span>"}
    ${sec < l.sections.length - 1 ? `<button id="next">Successiva →</button>` : `<button id="done">Fine livello ✓</button>`}</div>`;
  view.innerHTML = h;

  view.querySelectorAll("[data-s]").forEach((el) => (el.onclick = () => speak(q[+el.dataset.s])));
  $("#bk").onclick = () => openLessons(lv, null);
  if (s.dialog) $("#playAll").onclick = () => speakMany(q.slice(s._start));
  if ($("#prev")) $("#prev").onclick = () => openLessons(lv, sec - 1);
  if ($("#next")) $("#next").onclick = () => openLessons(lv, sec + 1);
  if ($("#done")) $("#done").onclick = () => openLessons(lv, null);
}

// ---------- Avvio ----------
go("home");
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});