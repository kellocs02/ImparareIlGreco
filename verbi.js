// VERBI FONDAMENTALI — schermate, esercizi e progressi.
// Modulo autonomo: usa soltanto gli strumenti generali dell'app (view, go, speak, toast) e il suo salvataggio (localStorage "verbi-v1").
// I contenuti stanno in verbi-data*.js (window.VerbiData).
window.Verbi = (() => {
  const KEY = "verbi-v1", PASS = 70; // percentuale minima per segnare una lezione come completata
  const E = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = (a) => [...new Set(a)];
  // Pronomi personali greci con la traduzione italiana (mostrata nelle tabelle e usata negli esercizi)
  const PRON_IT = { "εγώ": "io", "εσύ": "tu", "αυτός / αυτή / αυτό": "lui / lei / esso", "εμείς": "noi", "εσείς": "voi / Lei", "αυτοί / αυτές / αυτά": "loro" };
  const WIN = 10, NEED = 9; // argomento imparato = almeno 9 risposte giuste nelle ultime 10
  const D = () => window.VerbiData || { sections: [] };
  const sections = () => D().sections.slice().sort((a, b) => a.n - b.n);
  const findSection = (id) => sections().find((s) => s.id === id);
  const findLesson = (id) => { for (const s of sections()) { const l = s.lessons.find((x) => x.id === id); if (l) return { s, l }; } return null; };

  // ---------- Salvataggio ----------
  let db = load();
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || "null");
      if (d && d.v === 1 && d.lessons && typeof d.lessons === "object") return { v: 1, lessons: d.lessons, tests: d.tests || {} };
    } catch (e) { /* dati assenti o illeggibili: si riparte da zero */ }
    return { v: 1, lessons: {}, tests: {} };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toastSafe("Impossibile salvare i progressi: memoria del browser piena o bloccata"); } }
  const toastSafe = (m) => { try { toast(m); } catch (e) { /* niente */ } };
  const rec = (store, id, pct) => {
    const r = store[id] || { best: 0, tries: 0, last: 0 };
    r.best = Math.max(r.best, pct); r.tries++; r.last = Date.now(); store[id] = r; save(); return r;
  };
  const doneLesson = (id) => (db.lessons[id] ? db.lessons[id].best >= PASS : false);
  const doneCount = (s) => s.lessons.filter((l) => doneLesson(l.id)).length;
  function exportData() { return JSON.parse(JSON.stringify(db)); }
  function importData(d) {
    if (!d || d.v !== 1 || typeof d.lessons !== "object" || d.lessons === null) throw new Error("dati dei verbi non validi");
    const clean = (o) => { const out = {}; Object.keys(o || {}).forEach((k) => { const r = o[k]; if (r && Number.isFinite(r.best) && r.best >= 0 && r.best <= 100) out[k] = { best: Math.round(r.best), tries: Math.max(1, Math.min(9999, r.tries | 0)), last: Number.isFinite(r.last) ? r.last : 0 }; }); return out; };
    db = { v: 1, lessons: clean(d.lessons), tests: clean(d.tests) }; save();
  }

  // ---------- Audio ----------
  const speechOf = (t) => String(t).replace(/\([^)]*\)/g, "").replace(/[…«»]/g, "").split(/\s[–\/]\s/)[0].replace(/\s+/g, " ").trim();
  const say = (t) => { try { if (typeof speak === "function") speak(speechOf(t)); else toastSafe("Audio non disponibile"); } catch (e) { toastSafe("Audio non disponibile su questo dispositivo"); } };

  // ---------- Esercizi: generati dai contenuti (nulla di inventato fuori dalle lezioni) ----------
  const pickOthers = (pool, correct, n = 3) => shuffle(uniq(pool.filter((x) => x !== correct))).slice(0, n);
  function mk(prompt, sub, correct, wrong, why, speakText, kind) {
    const opts = uniq([correct].concat(wrong));
    if (opts.length < 3) return null;
    const o = shuffle(opts);
    return { prompt, sub, options: o, correct: o.indexOf(correct), why, say: speakText, kind };
  }
  function autoQuestions(l) {
    const qs = [];
    l.blocks.forEach((b) => {
      if (b.k === "table" && b.kind === "conj") {
        const forms = b.rows.map((r) => r[1]), its = b.rows.map((r) => r[3]);
        b.rows.forEach((r) => {
          qs.push(mk(`Come si dice «${r[3]}»?`, b.title, r[1], pickOthers(forms, r[1]), `${r[0]} → ${r[1]} (${r[2]}) = ${r[3]}`, r[1], "conj"));
          if (forms.filter((f) => f === r[1]).length === 1) qs.push(mk(`Che cosa significa «${r[1]}»?`, b.title, r[3], pickOthers(its, r[3]), `${r[1]} (${r[2]}) = ${r[3]}`, r[1], "conj"));
        });
        const pg = Object.keys(PRON_IT), pit = pg.map((p) => PRON_IT[p]);
        b.rows.forEach((r) => { const it = PRON_IT[r[0]]; if (!it) return;
          qs.push(mk(`Che cosa significa «${r[0]}»?`, "Pronomi personali", it, pickOthers(pit, it), `${r[0]} = ${it}`, r[0], "pron"));
          qs.push(mk(`Come si dice «${it}» in greco?`, "Pronomi personali", r[0], pickOthers(pg, r[0]), `${it} = ${r[0]}`, r[0], "pron"));
        });
      } else if (b.k === "table" && b.kind === "vocab") {
        const grs = b.rows.map((r) => r[0]), its = b.rows.map((r) => r[2]);
        b.rows.forEach((r) => {
          qs.push(mk(`Che cosa significa «${r[0]}»?`, b.title, r[2], pickOthers(its, r[2]), `${r[0]} (${r[1]}) = ${r[2]}`, r[0], "vocab"));
          qs.push(mk(`Come si dice «${r[2]}» in greco?`, b.title, r[0], pickOthers(grs, r[0]), `${r[2]} = ${r[0]} (${r[1]})`, r[0], "vocab"));
        });
      } else if (b.k === "ex") {
        const grs = b.items.map((x) => x[0]), its = b.items.map((x) => x[1]);
        b.items.forEach((x) => {
          qs.push(mk(`Come si dice: «${x[1]}»`, "Traduci in greco", x[0], pickOthers(grs, x[0]), `${x[0]} = ${x[1]}`, x[0], "ex"));
          qs.push(mk(`Che cosa significa: «${x[0]}»`, "Traduci in italiano", x[1], pickOthers(its, x[1]), `${x[0]} = ${x[1]}`, x[0], "ex"));
        });
      }
    });
    return qs.filter(Boolean);
  }
  function fillQuestions(l) {
    return l.fills.map((f) => {
      const o = shuffle(f.o);
      return { prompt: "Completa la frase", sub: f.q, options: o, correct: o.indexOf(f.a), why: f.why, say: f.q.replace("___", f.a), kind: "fill" };
    });
  }
  const dedupe = (qs) => { const seen = new Set(); return qs.filter((q) => (seen.has(q.prompt + "|" + q.sub) ? false : seen.add(q.prompt + "|" + q.sub))); };
  function lessonQuiz(l) {
    const f = fillQuestions(l), auto = shuffle(dedupe(autoQuestions(l))).slice(0, Math.max(4, 10 - f.length));
    return shuffle(f.concat(auto));
  }
  function poolQuiz(lessons, n) { // test di sezione / allenamento misto: domande scelte a caso da più lezioni
    const all = [];
    lessons.forEach((l) => all.push(...fillQuestions(l), ...shuffle(autoQuestions(l)).slice(0, 4)));
    return shuffle(dedupe(all)).slice(0, n);
  }

  // ---------- Stato di navigazione ----------
  let st = { screen: "hub", sec: null, lesson: null, quiz: null, hideTr: false };
  const mount = () => { if (!view.__verbi) { view.__verbi = true; view.addEventListener("click", onClick); } };
  const set = (o) => { st = Object.assign(st, o); render(); window.scrollTo(0, 0); };
  const open = () => { mount(); set({ screen: "hub", quiz: null }); };

  // ---------- Pezzi comuni ----------
  const bar = (pct, label) => `<i class="vb-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${E(label)}"><b style="width:${pct}%"></b></i>`;
  const back = (act, label, extra = "") => `<button class="vb-back" data-vb="${act}" ${extra}>‹ ${E(label)}</button>`;
  const spk = (t) => `<button class="vb-sp" data-sp="${E(t)}" aria-label="Ascolta: ${E(speechOf(t))}">🔊</button>`;

  function renderBlock(b) {
    if (b.k === "note") return `<p class="vb-note ${b.tone || ""}"><span>${b.tone === "warn" ? "⚠️" : b.tone === "tip" ? "💡" : "ℹ️"}</span>${E(b.text)}</p>`;
    if (b.k === "table") {
      const conjK = b.kind === "conj";
      return `<h3 class="vb-h3">${E(b.title)}</h3><div class="vb-tab">${b.rows.map((r) => conjK
        ? `<div class="vb-r conj"><span class="vb-who">${E(r[0])}${PRON_IT[r[0]] ? `<em class="vb-pit">${E(PRON_IT[r[0]])}</em>` : ""}</span><span class="vb-gr"><b>${E(r[1])}</b><i>${E(r[2])}</i></span>${spk(r[1])}<span class="vb-it">${E(r[3])}</span></div>`
        : `<div class="vb-r"><span class="vb-gr"><b>${E(r[0])}</b><i>${E(r[1])}</i></span>${spk(r[0])}<span class="vb-it">${E(r[2])}</span></div>`).join("")}</div>`;
    }
    if (b.k === "ex") return `<h3 class="vb-h3">${E(b.title)}</h3><div class="vb-ex">${b.items.map((x) => `<div class="vb-e"><p class="vb-g2">${E(x[0])}</p>${spk(x[0])}<p class="vb-it">${E(x[1])}</p></div>`).join("")}</div>`;
    if (b.k === "dlg") return `<h3 class="vb-h3">${E(b.title)} <button class="vb-mini" data-vb="dlgall" data-t="${E(b.lines.map((x) => speechOf(x[1])).join("|"))}">▶ Ascolta tutto</button></h3><div class="vb-dlg">${b.lines.map((x) => `<div class="vb-l"><b>${E(x[0])}</b><p class="vb-g2">${E(x[1])}</p>${spk(x[1])}<p class="vb-it">${E(x[2])}</p></div>`).join("")}</div>`;
    return "";
  }

  // ---------- Schermate ----------
  function hub() {
    const secs = sections(), total = secs.reduce((n, s) => n + s.lessons.length, 0), done = secs.reduce((n, s) => n + doneCount(s), 0);
    return `<div class="vb">${back("home", "Home")}
      <h1>Verbi fondamentali <small>essere, avere e verbi modali · ${done}/${total} lezioni completate</small></h1>
      <p class="vb-lead">${["", "Una", "Due", "Tre", "Quattro", "Cinque", "Sei"][secs.length] || secs.length} sezioni per partire dalle basi: ogni lezione ha tabelle con pronuncia, frasi da ascoltare ed esercizi senza fine: ti alleni su quell'argomento finché non lo sai (almeno ${NEED} risposte giuste su ${WIN}) e la lezione risulta completata.</p>
      ${secs.map((s) => { const d = doneCount(s), pct = Math.round((100 * d) / s.lessons.length); return `<button class="vb-sec" data-vb="sec" data-id="${s.id}">
        <span class="vb-n">${s.n}</span><span class="vb-st"><b>${E(s.title)}</b><em>${E(s.it)}</em><small>${E(s.sub)}</small>${bar(pct, "Progresso " + s.it)}<small>${d} / ${s.lessons.length} lezioni</small></span><span class="vb-go" aria-hidden="true">›</span></button>`; }).join("")}
      <button class="vb-wide" data-vb="mixed">🎯 Allenamento misto <small>15 domande da tutte le sezioni</small></button></div>`;
  }
  function section() {
    const s = findSection(st.sec); if (!s) return hub();
    const d = doneCount(s), pct = Math.round((100 * d) / s.lessons.length), t = db.tests[s.id];
    let parts = [], last = null;
    s.lessons.forEach((l, i) => { if (l.part !== last) { parts.push({ part: l.part, items: [] }); last = l.part; } parts[parts.length - 1].items.push({ l, i }); });
    return `<div class="vb">${back("hub", "Verbi fondamentali")}
      <h1>${E(s.title)} <small>${E(s.it)} · ${d}/${s.lessons.length} lezioni</small></h1>
      <p class="vb-lead">${E(s.intro)}</p>${bar(pct, "Progresso")}
      ${parts.map((p) => `<h2 class="vb-part">${E(p.part)}</h2>${p.items.map(({ l, i }) => { const r = db.lessons[l.id], ok = doneLesson(l.id);
        return `<button class="vb-les${ok ? " ok" : ""}" data-vb="lesson" data-id="${l.id}"><span class="vb-ck" aria-hidden="true">${ok ? "✓" : i + 1}</span><span class="vb-lt"><b>${E(l.title)}</b><small>${ok ? "Imparata ✓" : r ? "In corso" : "Da iniziare"}</small></span><span class="vb-go" aria-hidden="true">›</span></button>`; }).join("")}`).join("")}
      <h2 class="vb-part">Test della sezione</h2>
      <button class="vb-wide" data-vb="sectest" data-id="${s.id}">📝 Test finale: ${E(s.it)} <small>${t ? `Miglior risultato: ${t.best}% · ` : ""}12 domande da tutte le lezioni</small></button></div>`;
  }
  function lesson() {
    const f = findLesson(st.lesson); if (!f) return hub();
    const { s, l } = f, i = s.lessons.indexOf(l), prev = s.lessons[i - 1], next = s.lessons[i + 1], r = db.lessons[l.id];
    return `<div class="vb${st.hideTr ? " hide-tr" : ""}">${back("sec", s.title, `data-id="${s.id}"`)}
      <p class="vb-kicker">${E(s.it)} · lezione ${i + 1} di ${s.lessons.length} · ${E(l.part)}</p>
      <h1>${E(l.title)}</h1>
      ${l.intro.map((p) => `<p class="vb-p">${E(p)}</p>`).join("")}
      <div class="vb-tools"><button class="vb-mini" data-vb="tr" aria-pressed="${st.hideTr}">${st.hideTr ? "👁 Mostra le traduzioni" : "🙈 Nascondi le traduzioni"}</button></div>
      ${l.blocks.map(renderBlock).join("")}
      <button class="vb-wide primary" data-vb="drill" data-id="${l.id}">✍️ Allenati su questo argomento <small>${doneLesson(l.id) ? "Già imparato ✓ · puoi continuare ad allenarti" : "Esercizi senza fine, finché non lo sai"}</small></button>
      <div class="vb-pn">${prev ? `<button data-vb="lesson" data-id="${prev.id}">‹ ${E(prev.title)}</button>` : "<span></span>"}${next ? `<button data-vb="lesson" data-id="${next.id}">${E(next.title)} ›</button>` : "<span></span>"}</div></div>`;
  }
  function drill(q) {
    const cur = q.cur, answered = q.picked !== null, good = answered && q.picked === cur.correct, ok = q.win.filter(Boolean).length, num = q.n + (answered ? 0 : 1);
    const dots = Array.from({ length: WIN }, (_, i) => `<i class="vb-dot${q.win[i] === true ? " ok" : q.win[i] === false ? " bad" : ""}"></i>`).join("");
    const done = answered && q.masteredAt === q.n;
    return `<div class="vb">${back("quit", "Esci dall'allenamento")}
      <p class="vb-kicker">${E(q.title)} · allenamento senza fine · domanda ${num}</p>
      <div class="vb-win" role="img" aria-label="Ultime risposte: ${ok} giuste su ${q.win.length}">${dots}</div>
      <p class="vb-winl">Ultime ${WIN} risposte: ${ok} giuste su ${q.win.length}. Quando ne hai almeno ${NEED} su ${WIN} giuste, hai imparato l'argomento.</p>
      <h2 class="vb-q">${E(cur.prompt)}</h2>${cur.sub ? `<p class="vb-qs${cur.kind === "fill" ? " gr" : ""}">${E(cur.sub)}</p>` : ""}
      <div class="vb-opts" role="group" aria-label="Risposte">${cur.options.map((o, i) => `<button class="vb-o${answered ? (i === cur.correct ? " ok" : i === q.picked ? " bad" : " dim") : ""}" data-vb="ans" data-i="${i}" ${answered ? "disabled" : ""}><span>${"ABCD"[i]}</span>${E(o)}</button>`).join("")}</div>
      <div class="vb-fb" aria-live="polite">${answered ? `<p class="${good ? "ok" : "bad"}"><b>${good ? "Esatto!" : "Non proprio."}</b> ${E(cur.why)}${good ? "" : " Questa domanda tornerà tra qualche risposta."}</p>
        ${done ? `<p class="vb-res ok">Argomento imparato! 🎉 ${ok} giuste su ${WIN}. La lezione è segnata come completata: puoi continuare ad allenarti o tornare alla lezione.</p>` : ""}
        <div class="vb-fbb"><button class="vb-mini" data-sp="${E(cur.say)}">🔊 Ascolta</button><button class="vb-wide primary" data-vb="next">${done ? "Continua ad allenarti" : "Avanti"} ›</button></div>
        ${done ? `<div class="vb-fbb"><button class="vb-wide" data-vb="after">‹ Torna alla lezione</button></div>` : ""}` : ""}</div></div>`;
  }
  function quiz() {
    const q = st.quiz; if (!q) return hub();
    if (q.endless) return drill(q);
    if (q.i >= q.qs.length) return result();
    const cur = q.qs[q.i], pct = Math.round((100 * q.i) / q.qs.length), answered = q.picked !== null;
    return `<div class="vb">${back("quit", "Esci dall'esercizio")}
      <p class="vb-kicker">${E(q.title)} · domanda ${q.i + 1} di ${q.qs.length}</p>${bar(pct, "Avanzamento")}
      <h2 class="vb-q">${E(cur.prompt)}</h2>${cur.sub ? `<p class="vb-qs${cur.kind === "fill" ? " gr" : ""}">${E(cur.sub)}</p>` : ""}
      <div class="vb-opts" role="group" aria-label="Risposte">${cur.options.map((o, i) => `<button class="vb-o${answered ? (i === cur.correct ? " ok" : i === q.picked ? " bad" : " dim") : ""}" data-vb="ans" data-i="${i}" ${answered ? "disabled" : ""}><span>${"ABCD"[i]}</span>${E(o)}</button>`).join("")}</div>
      <div class="vb-fb" aria-live="polite">${answered ? `<p class="${q.picked === cur.correct ? "ok" : "bad"}"><b>${q.picked === cur.correct ? "Esatto!" : "Non proprio."}</b> ${E(cur.why)}</p>
        <div class="vb-fbb"><button class="vb-mini" data-sp="${E(cur.say)}">🔊 Ascolta</button><button class="vb-wide primary" data-vb="next">${q.i + 1 >= q.qs.length ? "Vedi il risultato" : "Avanti"} ›</button></div>` : ""}</div></div>`;
  }
  function result() {
    const q = st.quiz, n = q.qs.length, pct = Math.round((100 * q.score) / n), ok = pct >= PASS;
    const wrong = q.log.filter((x) => !x.ok);
    return `<div class="vb"><p class="vb-kicker">${E(q.title)}</p><h1>${pct}% <small>${q.score} risposte giuste su ${n}</small></h1>
      <p class="vb-res ${ok ? "ok" : "bad"}">${q.store === "lesson" ? (ok ? "Lezione completata! 🎉" : `Per completare la lezione serve almeno il ${PASS}%: rileggila e riprova.`) : ok ? "Ottimo risultato! 🎉" : "Ripassa le lezioni e riprova: più lo fai, più i modelli diventano automatici."}</p>
      ${wrong.length ? `<h2 class="vb-part">Da rivedere</h2><div class="vb-wr">${wrong.map((x) => `<div><b>${E(x.prompt)}</b>${x.sub ? `<small>${E(x.sub)}</small>` : ""}<p>Risposta giusta: <b class="gr">${E(x.right)}</b></p><p class="why">${E(x.why)}</p></div>`).join("")}</div>` : `<p class="vb-lead">Nessun errore: perfetto.</p>`}
      <div class="vb-fbb col"><button class="vb-wide primary" data-vb="again">↻ Rifai (nuove domande)</button><button class="vb-wide" data-vb="after">${q.store === "lesson" ? "‹ Torna alla lezione" : q.store === "test" ? "‹ Torna alla sezione" : "‹ Torna ai verbi"}</button></div></div>`;
  }
  function render() {
    mount();
    const h = st.screen === "sec" ? section() : st.screen === "lesson" ? lesson() : st.screen === "quiz" ? quiz() : hub();
    view.innerHTML = h;
  }

  // ---------- Avvio degli esercizi ----------
  // Flusso infinito di domande su una lezione: i round si rigenerano (nuove opzioni sbagliate) e gli errori tornano dopo 3 risposte.
  const round = (l, avoid) => { const r = shuffle(dedupe(fillQuestions(l).concat(autoQuestions(l)))); if (avoid && r.length > 1) { const t = r[r.length - 1]; if (t.prompt + "|" + t.sub === avoid) r.unshift(r.pop()); } return r; };
  const reshuffle = (c) => { const right = c.options[c.correct], o = shuffle(c.options); return Object.assign({}, c, { options: o, correct: o.indexOf(right) }); };
  function drawNext(q) {
    if (q.retry.length && q.retry[0].due <= q.n) return q.retry.shift().item;
    if (!q.pool.length) q.pool = round(q.lesson, q.cur ? q.cur.prompt + "|" + q.cur.sub : null);
    return q.pool.pop();
  }
  function startDrill(id) {
    const f = findLesson(id); if (!f) return;
    const q = { kind: "drill", id, store: "lesson", sid: null, title: f.l.title, endless: true, lesson: f.l, pool: [], retry: [], win: [], n: 0, score: 0, picked: null, log: [], cur: null, masteredAt: -1 };
    q.cur = drawNext(q); if (!q.cur) return toastSafe("Nessuna domanda disponibile");
    st.quiz = q; set({ screen: "quiz" });
  }
  function start(kind, id) {
    if (kind === "drill") return startDrill(id);
    let qs, title, store = kind, sid = id;
    if (kind === "lesson") { const f = findLesson(id); if (!f) return; qs = lessonQuiz(f.l); title = f.l.title; }
    else if (kind === "test") { const s = findSection(id); if (!s) return; qs = poolQuiz(s.lessons, 12); title = "Test: " + s.it; }
    else { qs = poolQuiz(sections().flatMap((s) => s.lessons), 15); title = "Allenamento misto"; store = "mixed"; sid = null; }
    if (!qs.length) return toastSafe("Nessuna domanda disponibile");
    st.quiz = { kind, id, store, sid, title, qs, i: 0, picked: null, score: 0, log: [] };
    set({ screen: "quiz" });
  }
  function answer(i) {
    const q = st.quiz; if (!q || q.picked !== null) return;
    const cur = q.endless ? q.cur : q.qs[q.i];
    q.picked = i; const ok = i === cur.correct; if (ok) q.score++;
    q.log.push({ ok, prompt: cur.prompt, sub: cur.sub, right: cur.options[cur.correct], why: cur.why });
    if (q.endless) {
      q.n++; q.win.push(ok); if (q.win.length > WIN) q.win.shift();
      if (!ok) q.retry.push({ due: q.n + 3, item: reshuffle(cur) });
      const good = q.win.filter(Boolean).length;
      if (q.masteredAt < 0 && q.win.length >= WIN && good >= NEED) { q.masteredAt = q.n; rec(db.lessons, q.id, Math.round((100 * good) / WIN)); }
    }
    render();
    const fb = view.querySelector(".vb-fb"); if (fb && fb.scrollIntoView) fb.scrollIntoView({ block: "nearest" });
  }
  function next() {
    const q = st.quiz;
    if (q.endless) { q.picked = null; q.cur = drawNext(q); return set({}); }
    q.i++; q.picked = null;
    if (q.i >= q.qs.length) {
      const pct = Math.round((100 * q.score) / q.qs.length);
      if (q.store === "lesson") rec(db.lessons, q.id, pct); else if (q.store === "test") rec(db.tests, q.id, pct);
    }
    set({});
  }

  // ---------- Eventi ----------
  function onClick(ev) {
    if (!view.querySelector(".vb")) return;
    const sp = ev.target.closest("[data-sp]"); if (sp) { say(sp.dataset.sp); return; }
    const b = ev.target.closest("[data-vb]"); if (!b) return;
    const a = b.dataset.vb;
    if (a === "home") return go("home");
    if (a === "hub") return set({ screen: "hub", quiz: null });
    if (a === "sec") return set({ screen: "sec", sec: b.dataset.id, quiz: null });
    if (a === "lesson") { const f = findLesson(b.dataset.id); return set({ screen: "lesson", lesson: b.dataset.id, sec: f ? f.s.id : st.sec, quiz: null }); }
    if (a === "tr") { st.hideTr = !st.hideTr; return render(); }
    if (a === "dlgall") { const t = (b.dataset.t || "").split("|").filter(Boolean); try { if (typeof speakMany === "function") speakMany(t); } catch (e) { toastSafe("Audio non disponibile"); } return; }
    if (a === "quiz") return start("lesson", b.dataset.id);
    if (a === "drill") return start("drill", b.dataset.id);
    if (a === "sectest") return start("test", b.dataset.id);
    if (a === "mixed") return start("mixed");
    if (a === "ans") return answer(+b.dataset.i);
    if (a === "next") return next();
    if (a === "again") return start(st.quiz.kind, st.quiz.id);
    if (a === "quit") { const q = st.quiz; return set(q && q.store === "lesson" ? { screen: "lesson", lesson: q.id, quiz: null } : q && q.store === "test" ? { screen: "sec", sec: q.id, quiz: null } : { screen: "hub", quiz: null }); }
    if (a === "after") { const q = st.quiz; return set(q.store === "lesson" ? { screen: "lesson", lesson: q.id, quiz: null } : q.store === "test" ? { screen: "sec", sec: q.id, quiz: null } : { screen: "hub", quiz: null }); }
  }

  return {
    open, exportData, importData,
    summary: () => { const s = sections(); return { done: s.reduce((n, x) => n + doneCount(x), 0), total: s.reduce((n, x) => n + x.lessons.length, 0) }; },
    // aiuti per i test automatici (non usati dall'app)
    _test: { correctIndex: () => st.quiz && st.quiz.endless ? st.quiz.cur.correct : st.quiz && st.quiz.qs[st.quiz.i] ? st.quiz.qs[st.quiz.i].correct : -1, PRON_IT, lessonQuiz, poolQuiz, autoQuestions, fillQuestions, state: () => st, reset: () => { db = { v: 1, lessons: {}, tests: {} }; save(); } }
  };
})();
