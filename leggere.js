// Sezione "Impara a leggere": flashcard e quiz per i gruppi di lettere (ει, οι, αι, ου, μπ, ντ, γκ,
// τσ, τζ), più un esercizio che scompone parole vere, un pezzo alla volta, per collegare la lettura
// alla pronuncia. Non tocca il sistema delle lettere singole, che resta quello già esistente.
(function () {
  state.dg = state.dg || {}; // stessa idea di state.al (lettere), ma per i gruppi

  const DG_SOUND = ['i (come "vita")', 'i (come "vita")', 'e (come "pesca")', 'u (come "luna")', 'b (come "banana")', 'd (come "dado")', 'g (come "gatto")', 'ts (come "pizza")', 'dz (come "zero")'];
  const DG_EX = DIGRAPH_EX; // definito in data.js, così genera_lista.js trova questi testi e genera il loro audio
  const DG_IT = ["sono", "nave", "e", "dove", "papà", "pomodoro", "gol", "tè", "camino"];

  const digraphBox = (k) => (state.dg[k] ? state.dg[k].box : -1);
  const digraphLearned = () => DIGRAPHS.filter((_, k) => digraphBox(k) >= 3).length;
  const digraphDue = () => DIGRAPHS.filter((_, k) => !state.dg[k] || state.dg[k].due <= today()).length;
  function gradeDigraph(k, ok) {
    const c = state.dg[k] || { box: 0, due: 0 };
    if (ok) { if (state.dg[k] && c.due > today()) return; c.box = Math.min(c.box + 1, 5); }
    else c.box = 0;
    c.due = today() + INTERVALS[c.box];
    state.dg[k] = c; save();
  }

  // ---------- Schermata principale ----------
  function renderReadLetters() {
    const n = digraphLearned(), d = digraphDue();
    view.innerHTML = `<button class="back" id="bk">‹ Alfabeto</button><h1>Impara a leggere<small>le lettere combinate e la lettura delle parole</small></h1>
      <div class="goal" style="cursor:default;margin-top:0"><div><b>Gruppi di lettere</b><span>${n} / ${DIGRAPHS.length}</span></div>
        <div class="progress"><div style="width:${Math.round((n / DIGRAPHS.length) * 100)}%"></div></div></div>
      <button class="big" id="dgCards">Flashcard <span>${d} da fare</span></button>
      <button class="big alt" id="dgQuiz">Quiz dei gruppi <span>senza fine</span></button>
      <button class="big alt" id="dgWord" style="margin-top:26px">Decodifica le parole <span>leggi parole vere, un pezzo alla volta</span></button>
      <div class="dig" style="margin-top:20px">${DIGRAPHS.map((dd, k) => `<div><b>${esc(dd[0])}</b><span>${esc(DG_SOUND[k].split(" ")[0])}</span><em>${esc(DG_EX[k])}</em></div>`).join("")}</div>`;
    $("#bk").onclick = () => go("alpha");
    $("#dgCards").onclick = startDgCards;
    $("#dgQuiz").onclick = startDgQuiz;
    $("#dgWord").onclick = startDecode;
  }
  function doneDg(title, msg) {
    view.innerHTML = `<div class="done"><div class="emoji">✅</div><h2>${title}</h2><p>${msg}</p>
      <button class="big" id="b1">Fai il quiz</button><button class="big alt" id="b2">Impara a leggere</button></div>`;
    $("#b1").onclick = startDgQuiz; $("#b2").onclick = renderReadLetters;
  }

  // ---------- Flashcard dei gruppi ----------
  function startDgCards() {
    const due = DIGRAPHS.map((_, k) => k).filter((k) => !state.dg[k] || state.dg[k].due <= today());
    const queue = shuffle(due.filter((k) => state.dg[k]).concat(due.filter((k) => !state.dg[k]))).slice(0, 9);
    if (!queue.length) return doneDg("Per oggi hai finito", "Tutti i gruppi sono ripassati.");
    let i = 0, right = 0;
    const show = () => {
      if (i >= queue.length) return doneDg("Sessione finita", `Ne sapevi ${right} su ${queue.length}.`);
      const k = queue[i];
      const distractPool = DIGRAPHS.map((_, j) => j).filter((j) => j !== k && DG_SOUND[j] !== DG_SOUND[k]);
      const opts = shuffle([k, ...shuffle(distractPool).slice(0, 3)]);
      view.innerHTML = `<div class="progress"><div style="width:${(i / queue.length) * 100}%"></div></div><p class="count">${i + 1} / ${queue.length}</p>
        <div class="card" id="card"><div class="gr xl">${esc(DIGRAPHS[k][0])}</div><button class="spk" id="spk" aria-label="Ascolta">🔊</button>
          <p class="tap">Che suono fa?</p></div>
        <div class="opts">${opts.map((o) => `<button class="opt" data-k="${o}">${esc(DG_SOUND[o])}</button>`).join("")}</div>
        <p class="fb" id="fb"></p>`;
      $("#spk").onclick = (e) => { e.stopPropagation(); speak(DG_EX[k]); };
      view.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        const o = +b.dataset.k, ok = o === k;
        view.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (+x.dataset.k === k) x.classList.add("ok"); });
        if (!ok) b.classList.add("bad");
        gradeDigraph(k, ok); if (ok) right++;
        speak(DG_EX[k]);
        $("#fb").innerHTML = `${ok ? "✅ Giusto!" : "❌ Era"} <b>${esc(DIGRAPHS[k][0])}</b> = ${esc(DG_SOUND[k])}<br>esempio: ${esc(DG_EX[k])} = ${esc(DG_IT[k])}
          <button class="big" id="nx">Avanti</button>`;
        $("#nx").onclick = () => { i++; show(); };
      }));
    };
    show();
  }

  // ---------- Quiz senza fine dei gruppi ----------
  function pickDigraph(recent) {
    const pool = DIGRAPHS.map((_, k) => k).filter((k) => !recent.includes(k));
    const wt = (k) => (digraphBox(k) <= 0 ? 4 : digraphBox(k) <= 2 ? 2.5 : 1);
    let r = Math.random() * pool.reduce((s, k) => s + wt(k), 0);
    for (const k of pool) { r -= wt(k); if (r <= 0) return k; }
    return pool[pool.length - 1];
  }
  function startDgQuiz() {
    let n = 0, right = 0;
    const recent = [];
    const show = () => {
      const i = pickDigraph(recent); recent.push(i); if (recent.length > 3) recent.shift();
      const kind = Math.random() < 0.5 ? "sound" : "listen";
      let opts, label, main;
      if (kind === "sound") {
        main = esc(DIGRAPHS[i][0]); label = "Che suono fa?";
        // niente distrattori col suono identico (ει/οι suonano uguale): eviterebbe risposte ambigue
        const distractPool = DIGRAPHS.map((_, k) => k).filter((k) => k !== i && DG_SOUND[k] !== DG_SOUND[i]);
        opts = shuffle([i, ...shuffle(distractPool).slice(0, 3)]);
      } else {
        main = "🔊"; label = "Ascolta: quale gruppo hai sentito?";
        opts = shuffle([i, ...shuffle(DIGRAPHS.map((_, k) => k).filter((k) => k !== i)).slice(0, 3)]);
      }
      view.innerHTML = `<div class="qtop"><button class="back" id="bk">‹ Esci</button><span>${right} / ${n} corrette</span></div>
        <div class="card q"><div class="prompt">${label}</div><div class="gr">${main}</div>${kind === "listen" ? `<button class="spk" id="spk">🔊</button>` : ""}</div>
        <div class="opts">${opts.map((k) => `<button class="opt" data-k="${k}">${kind === "sound" ? esc(DG_SOUND[k]) : esc(DIGRAPHS[k][0])}</button>`).join("")}</div>`;
      $("#bk").onclick = () => go("alpha");
      if (kind === "listen") { speak(DG_EX[i]); $("#spk").onclick = (e) => { e.stopPropagation(); speak(DG_EX[i]); }; }
      view.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        const k = +b.dataset.k, ok = k === i; n++;
        b.classList.add(ok ? "ok" : "bad");
        view.querySelectorAll(".opt").forEach((x) => (x.disabled = true));
        gradeDigraph(i, ok); if (ok) right++;
        speak(DG_EX[i]);
        setTimeout(show, 900);
      }));
    };
    show();
  }

  // ---------- Decodifica le parole ----------
  const DG_LIST = DIGRAPHS.map((d) => d[0]);
  function segmentWord(gr) {
    const chars = Array.from(gr), out = []; let i = 0;
    while (i < chars.length) {
      const two = (chars[i] + (chars[i + 1] || "")).toLowerCase();
      const idx = DG_LIST.indexOf(two);
      if (idx !== -1 && i + 1 < chars.length) { out.push({ t: chars[i] + chars[i + 1], dg: idx }); i += 2; }
      else { out.push({ t: chars[i], dg: -1 }); i += 1; }
    }
    return out;
  }
  const isPlainGreekWord = (gr) => /^[\u0370-\u03ff\u1f00-\u1fff]+$/i.test(gr);
  function startDecode() {
    const withDg = shuffle(WORDS.filter((w) => isPlainGreekWord(w.gr) && segmentWord(w.gr).some((p) => p.dg !== -1)));
    const plain = shuffle(WORDS.filter((w) => isPlainGreekWord(w.gr) && !segmentWord(w.gr).some((p) => p.dg !== -1))).slice(0, 4);
    const list = withDg.slice(0, 10).concat(plain);
    if (!list.length) return toast("Nessuna parola adatta trovata");
    let i = 0;
    const show = () => {
      if (i >= list.length) {
        view.innerHTML = `<div class="done"><div class="emoji">📖</div><h2>Hai letto ${list.length} parole</h2>
          <button class="big" id="b1">Ancora</button><button class="big alt" id="b2">Impara a leggere</button></div>`;
        $("#b1").onclick = startDecode; $("#b2").onclick = renderReadLetters;
        return;
      }
      const w = list[i], parts = segmentWord(w.gr);
      view.innerHTML = `<button class="back" id="bk">‹ Esci</button><p class="count">${i + 1} / ${list.length}</p>
        <div class="card" id="card" style="min-height:220px">
          <div class="gr lg" style="letter-spacing:1px">${parts.map((p) => `<span style="padding:1px 2px;border-radius:5px;${p.dg !== -1 ? "background:var(--blue2);color:var(--blue)" : ""}">${esc(p.t)}</span>`).join("")}</div>
          <button class="spk" id="spk">🔊</button>
          <p class="tap" id="tap">Tocca per vedere come si legge</p>
          <div id="back" hidden><div class="tr">${parts.map((p) => esc(p.dg !== -1 ? DG_SOUND[p.dg].split(" ")[0] : p.t)).join("-")}</div><div class="it">${esc(w.tr)} = ${esc(w.it)}</div>
          ${parts.some((p) => p.dg !== -1) ? `<p class="hint">${[...new Set(parts.filter((p) => p.dg !== -1).map((p) => p.dg))].map((d) => `${esc(DIGRAPHS[d][0])} si legge ${esc(DG_SOUND[d])}`).join(" · ")}</p>` : ""}</div>
        </div>
        <button class="big" id="nx">Avanti</button>`;
      $("#bk").onclick = () => go("alpha");
      $("#spk").onclick = (e) => { e.stopPropagation(); speak(w.gr); };
      $("#card").onclick = () => { $("#back").hidden = false; $("#tap").hidden = true; speak(w.gr); };
      $("#nx").onclick = () => { i++; show(); };
    };
    show();
  }

  // ---------- Pulsanti in Alfabeto e Allenati ----------
  const baseAlpha2 = renderAlpha;
  renderAlpha = function () {
    baseAlpha2();
    const h = view.querySelector("h1");
    h.insertAdjacentHTML("afterend", `<button class="big alt" id="goRead2" style="margin:0 0 14px">📖 Impara a leggere <span>gruppi di lettere e parole</span></button>`);
    $("#goRead2").onclick = renderReadLetters;
  };
  const baseTrain2 = renderTrain;
  renderTrain = function () {
    baseTrain2();
    view.querySelector(".hint").insertAdjacentHTML("beforebegin", `<button class="big alt" id="goRead3">Impara a leggere <span>gruppi di lettere, decodifica parole</span></button>`);
    $("#goRead3").onclick = renderReadLetters;
  };
})();