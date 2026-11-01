// Percorso a unità: home (livelli) → livello (unità) → studio delle parole → test → sblocco.
// Usa state, view, speak, grade, norm, shuffle, esc, isShort, sentencesIn, makeFillQs, makeConjQs... di app.js,
// ma solo a run-time (dentro le funzioni), quindi l'ordine di caricamento rispetto ad app.js non conta.
const PASS = 0.8;   // quota di risposte giuste per superare un test
const TEST_N = 10;  // domande di un test d'unità
const FINAL_N = 15; // domande del test finale di livello

// ---------- Stato: sblocchi ----------
// state.pu[id] = { pct, t }  unità superata (miglior risultato) · state.pl[a] = { pct, t }  test finale superato
// state.free = modalità prova (tutto sbloccato)
const passedU = (id) => !!state.pu[id];
const levelOpen = (a) => !!state.free || a === 0 || !!state.pl[a - 1];
const unitOpen = (a, i) => !!state.free || (levelOpen(a) && (i === 0 || passedU(UNITS[a][i - 1].id) || passedU(UNITS[a][i].id)));
const finalOpen = (a) => !!state.free || (levelOpen(a) && UNITS[a].every((u) => passedU(u.id)));

// Prossima cosa da fare: { a, i } unità, oppure { a, final: true }, oppure null se il percorso è finito.
function nextStep() {
  for (let a = 0; a < UNITS.length; a++) {
    if (!levelOpen(a)) return null;
    for (let i = 0; i < UNITS[a].length; i++) if (!passedU(UNITS[a][i].id)) return { a, i };
    if (!state.pl[a]) return { a, final: true };
  }
  return null;
}

function inHome() { // le schermate del percorso vivono sotto la tab Home
  tab = "home";
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === "home"));
  window.scrollTo(0, 0);
}

// ---------- Contenuto di un'unità ----------
const learnable = (r) => isShort(r) && !r[0].includes("→");

function partOf(a, b, from, to) {
  const s = LEVELS[a].sections[b], off = from || 0, rows = (s.rows || []).slice(off, to);
  return { a, b, off, rows, sec: { t: s.t, note: s.note, rows, conj: s.conj, dialog: s.dialog } };
}
const unitParts = (u) => u.parts.map((p) => partOf(p.a, p.b, p.from, p.to));
const levelParts = (a) => LEVELS[a].sections.map((_, b) => partOf(a, b));

// Parole imparabili: stessi id di lessonWords() in app.js, così progressi e ripasso restano allineati.
function wordsOf(parts) {
  const out = [];
  parts.forEach(({ a, b, off, rows }) => rows.forEach((r, i) => {
    if (learnable(r)) out.push({ id: `L${a}-${b}-${off + i}`, cat: "lezioni", gr: r[0], tr: r[1], it: r[2] });
  }));
  return out;
}
const ctxOf = (a, parts) => ({ secs: parts.map((x) => x.sec), words: wordsOf(parts), levelWords: wordsOf(levelParts(a)) });

function unitMeta(u) {
  const ps = unitParts(u), nw = wordsOf(ps).length, nf = sentencesIn(ps.map((x) => x.sec)).length;
  const hasConj = ps.some((x) => x.sec.conj);
  return [nw ? nw + " parole" : "", nf ? nf + " frasi" : "", hasConj ? "verbi" : ""].filter(Boolean).join(" · ");
}

// ---------- Domande dei test ----------
// Una domanda è un oggetto: { kind, prompt, main, sub?, spk?, auto?, opts[], ans, typed?, accept?, say, after, pre?, w? }
// (w = parola da registrare nel ripasso a scatole quando si risponde).
const RANK = { gr2it: 0, tf: 1, listen: 1, fill: 2, conj: 2, it2gr: 3, type: 4 }; // dalle più facili alle più difficili
const wordKinds = () => ("speechSynthesis" in window ? ["gr2it", "it2gr", "listen", "type"] : ["gr2it", "it2gr", "type"]);

// 3 risposte sbagliate plausibili: prima parole della stessa unità, poi del livello, poi del mazzo base.
function wrongOpts(w, ctx, field) {
  const seen = new Set([norm(w[field])]), out = [];
  for (const c of shuffle(ctx.words).concat(shuffle(ctx.levelWords), shuffle(BASE_WORDS))) {
    if (out.length >= 3) break;
    const k = norm(c[field]);
    if (!k || seen.has(k) || norm(c.it) === norm(w.it)) continue; // niente doppioni né sinonimi
    seen.add(k); out.push(c[field]);
  }
  return out;
}

function wordQ(w, kind, ctx) {
  const base = { w, kind, say: w.gr, after: `<b>${esc(w.gr)}</b> <i>(${esc(w.tr)})</i> = ${esc(w.it)}` };
  if (kind === "gr2it") return { ...base, prompt: "Che cosa significa?", main: w.gr, spk: w.gr, opts: shuffle([w.it, ...wrongOpts(w, ctx, "it")]), ans: w.it };
  if (kind === "listen") return { ...base, prompt: "Ascolta e scegli il significato", main: "🔊", spk: w.gr, auto: true, opts: shuffle([w.it, ...wrongOpts(w, ctx, "it")]), ans: w.it };
  if (kind === "it2gr") return { ...base, prompt: "Come si dice in greco?", main: w.it, opts: shuffle([w.gr, ...wrongOpts(w, ctx, "gr")]), ans: w.gr };
  return { ...base, prompt: "Scrivilo in greco o con lettere latine", main: w.it, typed: true, accept: (s) => sameAnswer(s, w) };
}

// Righe "A → B" (plurali, accusativo): "metti al plurale / all'accusativo".
function makeTransformQs(secs, n) {
  const qs = [];
  secs.forEach((s) => {
    const rows = (s.rows || []).filter((r) => r[0].includes("→"));
    if (rows.length < 4) return;
    const prompt = /accusativo plurale/i.test(s.t) ? "Metti all'accusativo plurale" : /accusativo/i.test(s.t) ? "Metti all'accusativo" : /plural/i.test(s.t) ? "Metti al plurale" : "Trasforma";
    rows.forEach((r) => {
      const [src, tgt] = r[0].split("→").map((x) => x.trim());
      const seen = new Set([norm(tgt)]);
      const wrong = shuffle(rows.map((x) => x[0].split("→")[1].trim())).filter((x) => !seen.has(norm(x)) && seen.add(norm(x))).slice(0, 3);
      if (wrong.length < 3) return;
      qs.push({ kind: "tf", prompt, main: src, opts: shuffle([tgt].concat(wrong)), ans: tgt, say: tgt, after: `${esc(src)} → <b>${esc(tgt)}</b> <i>(${esc(r[2])})</i>` });
    });
  });
  return shuffle(qs).slice(0, n);
}

// Compone un test mescolando parole, frasi, verbi e trasformazioni, dalle domande più facili alle più difficili.
// ctx.prefer (opzionale): id di parole sbagliate al tentativo precedente, da riproporre per prime.
function composeTest(ctx, N) {
  const kinds = wordKinds(), prefer = ctx.prefer || new Set();
  const W = shuffle(ctx.words).sort((x, y) => (prefer.has(y.id) ? 1 : 0) - (prefer.has(x.id) ? 1 : 0));
  const lists = {
    fill: makeFillQs(ctx.secs, N).map((q) => ({ kind: "fill", prompt: "Completa la frase", main: q.text, sm: true, sub: q.s.it, opts: q.opts, ans: q.ans, say: q.s.gr,
      pre: `La parola era <b>${esc(q.ans)}</b>.<br>`, after: `<b>${esc(q.s.gr)}</b>${q.s.tr ? ` <i>(${esc(q.s.tr)})</i>` : ""}` })),
    conj: makeConjQs(ctx.secs, N).map((q) => ({ kind: "conj", prompt: "Coniuga: " + q.col, main: q.pron[0], sub: q.pron[2], sm: true, opts: q.opts.map((o) => o[0]), ans: q.ans[0], say: q.ans[0],
      after: `<b>${esc(q.ans[0])}</b> <i>(${esc(q.ans[1])})</i>` })),
    tf: makeTransformQs(ctx.secs, N)
  };
  const keys = Object.keys(lists), take = { fill: 0, conj: 0, tf: 0 };
  const spread = (budget) => { // distribuisce a turno il budget tra frasi, verbi e trasformazioni
    while (budget > 0) {
      let moved = false;
      keys.forEach((k) => { if (budget > 0 && take[k] < lists[k].length) { take[k]++; budget--; moved = true; } });
      if (!moved) break;
    }
  };
  const minWords = W.length >= 4 ? Math.ceil(N * 0.4) : 0; // se ci sono parole, almeno il 40% del test sono parole
  spread(N - minWords);
  const nonword = () => take.fill + take.conj + take.tf;
  const nw = Math.min(W.length * kinds.length, Math.max(0, N - nonword()));
  spread(N - nonword() - nw); // se le parole non bastano, riempi con altra grammatica
  const qs = [];
  keys.forEach((k) => qs.push(...lists[k].slice(0, take[k])));
  // parole: a ogni giro ogni parola riceve un tipo di domanda diverso
  let n = 0;
  for (let r = 0; r < kinds.length && n < nw; r++) for (let i = 0; i < W.length && n < nw; i++, n++) qs.push(wordQ(W[i], kinds[(i + r) % kinds.length], ctx));
  return shuffle(qs).sort((x, y) => RANK[x.kind] - RANK[y.kind]);
}

// ---------- Esecuzione di un test ----------
function runTest(qs, { title, onEnd, onExit }) {
  let i = 0, score = 0;
  const missed = [];
  const show = () => {
    if (i >= qs.length) return onEnd({ score, total: qs.length, missed });
    const q = qs[i];
    const body = q.typed
      ? `<div class="typebox"><input id="ans" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Scrivi qui la risposta">
           <button class="big" id="chk" style="justify-content:center">Controlla</button></div>`
      : `<div class="opts">${q.opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join("")}</div>`;
    const sm = q.sm || [...q.main].length > 16;
    view.innerHTML = `
      <button class="back" id="exit">← Esci dal test</button>
      <div class="progress"><div style="width:${(i / qs.length) * 100}%"></div></div>
      <p class="count">${esc(title)} · domanda ${i + 1} / ${qs.length}</p>
      <div class="card q"><div class="prompt">${esc(q.prompt)}</div>
        <div class="gr${sm ? " sm" : ""}">${esc(q.main)}</div>${q.sub ? `<div class="it sm">${esc(q.sub)}</div>` : ""}
        ${q.spk ? `<button class="spk" id="spk" aria-label="Ascolta">🔊</button>` : ""}</div>${body}<p class="fb" id="fb"></p>`;
    $("#exit").onclick = onExit;
    if (q.spk) $("#spk").onclick = () => speak(q.spk);
    if (q.auto) speak(q.spk);
    const reveal = (ok) => {
      if (ok) score++;
      if (q.w) { grade(q.w, ok); if (!ok) missed.push(q.w); } else { state.reviews++; touchStreak(); save(); }
      if (q.say) speak(q.say);
      $("#fb").innerHTML = `${ok ? "✅ Giusto!" : "❌ " + (q.pre || "Era ")} ${q.after}
        <button class="big" id="nx">${i + 1 === qs.length ? "Vedi il risultato" : "Avanti"}</button>`;
      $("#nx").onclick = () => { i++; show(); };
    };
    if (q.typed) {
      const inp = $("#ans");
      let answered = false;
      const check = () => {
        if (answered) return;
        if (!inp.value.trim()) return toast("Scrivi una risposta, anche solo con lettere latine");
        answered = true; inp.disabled = true; $("#chk").hidden = true;
        const ok = q.accept(inp.value);
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

// ---------- Home: i livelli ----------
function renderHome() {
  inHome();
  const total = UNITS.reduce((n, us) => n + us.length, 0), done = Object.keys(state.pu).filter((id) => UNITS.some((us) => us.some((u) => u.id === id))).length;
  const nx = nextStep(), due = pool().filter(isDue).length;
  const nxLabel = !nx ? "" : nx.final ? `Test finale · Livello ${LEVELS[nx.a].n}` : UNITS[nx.a][nx.i].t;
  let h = `<h1>Ελληνικά <small>il tuo percorso</small></h1>
    <div class="stats">
      <div><b>${currentStreak()}</b><span>giorni di fila 🔥</span></div>
      <div><b>${done}<i>/${total}</i></b><span>unità superate</span></div>
      <div><b>${learnedCount()}<i>/${WORDS.length}</i></b><span>parole imparate</span></div>
    </div>`;
  h += nx ? `<button class="big" id="goNext">Continua <span>${esc(nxLabel)}</span></button>`
    : `<p class="hint">🎉 Hai completato tutto il percorso. Ripassa e allenati per non perdere quello che hai imparato.</p>`;
  h += `<button class="big alt" id="goReview">Ripassa ora <span>${due} da fare</span></button><h2>Livelli</h2>`;
  LEVELS.forEach((l, a) => {
    const n = UNITS[a].filter((u) => passedU(u.id)).length, open = levelOpen(a);
    h += `<button class="lvl${open ? "" : " lock"}" data-a="${a}"><b>Livello ${l.n}${open ? "" : " 🔒"}</b><span>${esc(l.sub)}</span>
      <em>${n} / ${UNITS[a].length} unità${state.pl[a] ? " · test finale ✓" : ""}</em>
      <div class="progress" style="margin-top:10px"><div style="width:${(n / UNITS[a].length) * 100}%"></div></div></button>`;
  });
  h += `<button class="big alt" id="free" style="margin-top:22px">Modalità prova <span>${state.free ? "attiva: tutto sbloccato" : "spenta"}</span></button>`;
  view.innerHTML = h;
  view.querySelectorAll(".lvl").forEach((b) => (b.onclick = () => {
    const a = +b.dataset.a;
    if (!levelOpen(a)) return toast(`Supera il test finale del livello ${LEVELS[a - 1].n} per sbloccarlo`);
    openLevel(a);
  }));
  if ($("#goNext")) $("#goNext").onclick = () => (nx.final ? startFinal(nx.a) : openUnit(nx.a, nx.i));
  $("#goReview").onclick = () => go("review");
  $("#free").onclick = () => { state.free = !state.free; save(); renderHome(); };
}

// ---------- Livello: elenco delle unità ----------
function openLevel(a) {
  inHome();
  const l = LEVELS[a], us = UNITS[a], fin = state.pl[a];
  let h = `<button class="back" id="bk">← Home</button><h1>Livello ${l.n} <small>${esc(l.sub)}</small></h1>`;
  us.forEach((u, i) => {
    const p = state.pu[u.id], open = unitOpen(a, i);
    h += `<button class="unit ${p ? "fin" : open ? "" : "lock"}" data-i="${i}"><span class="ub">${p ? "✓" : open ? i + 1 : "🔒"}</span>
      <span><b>${esc(u.t)}</b><small>${esc(unitMeta(u))}${p ? ` · migliore ${p.pct}%` : ""}</small></span><i>›</i></button>`;
  });
  const fo = finalOpen(a);
  h += `<button class="unit ${fin ? "fin" : fo ? "" : "lock"}" id="fin"><span class="ub">${fin ? "✓" : fo ? "🏁" : "🔒"}</span>
    <span><b>Test finale del livello</b><small>${FINAL_N} domande su tutto il livello${fin ? ` · migliore ${fin.pct}%` : ""}</small></span><i>›</i></button>`;
  view.innerHTML = h;
  $("#bk").onclick = renderHome;
  view.querySelectorAll(".unit[data-i]").forEach((b) => (b.onclick = () => {
    const i = +b.dataset.i;
    if (!unitOpen(a, i)) return toast("Prima supera: " + us[i - 1].t);
    openUnit(a, i);
  }));
  $("#fin").onclick = () => (finalOpen(a) ? startFinal(a) : toast("Prima supera tutte le unità del livello"));
}

// ---------- Unità: studio delle parole ----------
function learnHtml(parts) {
  const q = [], sp = (t) => q.push(t) - 1;
  const cell = (c) => typeof c === "string"
    ? `<td class="lab">${esc(c)}</td>`
    : `<td class="t" data-s="${sp(c[0])}"><b>${esc(c[0])}</b><small>${esc(c[1] || "")}</small>${c[2] ? `<em>${esc(c[2])}</em>` : ""}</td>`;
  let h = "";
  parts.forEach(({ sec }) => {
    if (parts.length > 1) h += `<h2>${esc(sec.t)}</h2>`;
    if (sec.note) h += `<p class="note">${esc(sec.note)}</p>`;
    if (sec.conj) {
      h += `<div class="scroll"><table class="conj"><thead><tr>${sec.conj.head.map((x) => `<th>${esc(x)}</th>`).join("")}</tr></thead>
        <tbody>${sec.conj.rows.map((r) => `<tr>${r.map(cell).join("")}</tr>`).join("")}</tbody></table></div>`;
    }
    if (sec.rows && sec.rows.length) {
      const from = q.length;
      h += `<div class="words">${sec.rows.map((r) => `<button class="wr" data-s="${sp(r[0])}">
        <span class="g">${esc(r[0])}</span><span class="p">${esc(r[1])}</span><span class="i">${esc(r[2])}</span><u>🔊</u></button>`).join("")}</div>
        <button class="big alt" data-play="${from}-${q.length}">▶ Ascolta tutte</button>`;
    }
    if (sec.dialog) {
      const from = q.length;
      h += `<div class="dlg">${sec.dialog.map((d) => `<button class="dl" data-s="${sp(d[1])}"><b>${esc(d[0])}</b>
        <span class="g">${esc(d[1])}</span><span class="i">${esc(d[2])}</span></button>`).join("")}</div>
        <button class="big alt" data-play="${from}-${q.length}">▶ Ascolta tutto il dialogo</button>`;
    }
  });
  return { h, q };
}

function openUnit(a, i) {
  inHome();
  const u = UNITS[a][i], { h, q } = learnHtml(unitParts(u));
  view.innerHTML = `<button class="back" id="bk">← Livello ${LEVELS[a].n}</button>
    <h1>${esc(u.t)}<small>Unità ${i + 1} di ${UNITS[a].length} · studia, poi fai il test</small></h1>
    <p class="hint" style="margin-top:0">Tocca una riga per ascoltarla. Quando ti senti pronto, fai il test.</p>${h}
    <button class="big" id="go" style="margin-top:22px">Inizia il test <span>serve il ${Math.round(PASS * 100)}%</span></button>`;
  view.querySelectorAll("[data-s]").forEach((el) => (el.onclick = () => speak(q[+el.dataset.s])));
  view.querySelectorAll("[data-play]").forEach((el) => (el.onclick = () => { const [x, y] = el.dataset.play.split("-").map(Number); speakMany(q.slice(x, y)); }));
  $("#bk").onclick = () => openLevel(a);
  $("#go").onclick = () => startUnitTest(a, i);
}

// ---------- Test di unità e test finale ----------
function startUnitTest(a, i, prefer) {
  const u = UNITS[a][i], ctx = ctxOf(a, unitParts(u));
  ctx.prefer = prefer;
  const qs = composeTest(ctx, TEST_N);
  if (qs.length < 3) return toast("Per questa unità non ci sono abbastanza domande");
  runTest(qs, {
    title: u.t,
    onExit: () => openUnit(a, i),
    onEnd: (r) => testResult(r, {
      title: u.t,
      pass: (pct) => { const p = state.pu[u.id]; state.pu[u.id] = { pct: Math.max(pct, p ? p.pct : 0), t: today() }; addToReview(a); },
      retry: (missed) => startUnitTest(a, i, missed),
      study: () => openUnit(a, i),
      back: () => openLevel(a),
      next: () => {
        if (i + 1 < UNITS[a].length) return { label: "Prossima unità: " + UNITS[a][i + 1].t, go: () => openUnit(a, i + 1) };
        return { label: "Al test finale del livello", go: () => openLevel(a) };
      }
    })
  });
}

function startFinal(a) {
  startFinalWith(a, undefined);
}
function startFinalWith(a, prefer) {
  const ctx = ctxOf(a, levelParts(a));
  ctx.prefer = prefer;
  const qs = composeTest(ctx, FINAL_N);
  runTest(qs, {
    title: `Test finale · Livello ${LEVELS[a].n}`,
    onExit: () => openLevel(a),
    onEnd: (r) => testResult(r, {
      title: `Test finale · Livello ${LEVELS[a].n}`,
      pass: (pct) => { const p = state.pl[a]; state.pl[a] = { pct: Math.max(pct, p ? p.pct : 0), t: today() }; },
      retry: (missed) => startFinalWith(a, missed),
      study: () => openLevel(a),
      back: () => openLevel(a),
      next: () => a + 1 < LEVELS.length
        ? { label: `Vai al livello ${LEVELS[a + 1].n}`, go: () => openLevel(a + 1) }
        : { label: "Torna alla home", go: renderHome },
      final: true
    })
  });
}

// Quando superi un'unità, le parole di una sezione entrano nel ripasso solo se tutte le unità che la usano sono superate.
function addToReview(a) {
  UNITS[a].forEach((u) => u.parts.forEach((p) => {
    const used = UNITS[a].filter((x) => x.parts.some((y) => y.b === p.b));
    if (used.every((x) => passedU(x.id))) state.added[a + "-" + p.b] = 1;
  }));
  syncDeck();
}

function testResult({ score, total, missed }, o) {
  const ratio = score / total, pct = Math.round(ratio * 100), ok = ratio >= PASS;
  if (ok) o.pass(pct);
  touchStreak(); save();
  const uniq = [...new Map(missed.map((w) => [w.id, w])).values()];
  const nx = ok ? o.next() : null;
  view.innerHTML = `<div class="done"><div class="emoji">${ok ? (pct === 100 ? "🏆" : "🎉") : "💪"}</div>
    <h2>${score} / ${total} · ${pct}%</h2>
    <p>${ok ? (o.final ? "Livello superato!" : "Unità superata!") : `Non ancora: serve almeno il ${Math.round(PASS * 100)}%. Rivedi le parole e riprova.`}</p>
    ${uniq.length ? `<p class="hint">Da rivedere: ${uniq.slice(0, 6).map((w) => `${esc(w.gr)} (${esc(w.it)})`).join(" · ")}${uniq.length > 6 ? " …" : ""}</p>` : ""}
    ${ok ? `<button class="big" id="nx">${esc(nx.label)}</button><button class="big alt" id="again">Rifai il test</button>`
         : `<button class="big" id="again">Riprova</button><button class="big alt" id="study">${o.final ? "Torna al livello" : "Rivedi le parole"}</button>`}
    <button class="big alt" id="bk">${o.final ? "Home" : "Torna al livello"}</button></div>`;
  const ids = new Set(uniq.map((w) => w.id));
  if (ok) $("#nx").onclick = nx.go;
  $("#again").onclick = () => o.retry(ids);
  if ($("#study")) $("#study").onclick = o.study;
  $("#bk").onclick = o.final ? renderHome : o.back;
}
