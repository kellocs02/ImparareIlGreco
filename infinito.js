// Modalità infinita: cicli di 5 parole nuove da studiare e 5 domande per metterle alla prova,
// ogni 20 parole un ripasso generale di 25 domande, poi le statistiche della sessione.
// Ogni risposta passa da grade(), la stessa funzione usata in tutta l'app: le parole sbagliate
// finiscono quindi nel ripasso a scatole e tra le parole ostiche, come qualunque altro errore.
(function () {
  const CYCLE = 5;      // parole per ogni fase di studio/test
  const GOAL_WORDS = 20; // dopo quante parole parte il ripasso generale
  const RECAP_N = 25;    // domande del ripasso generale

  function wrongOpts(w, field, n) {
    const seen = new Set([norm(w[field])]), out = [];
    for (const c of shuffle(WORDS)) {
      if (out.length >= n) break;
      const k = norm(c[field]);
      if (!k || seen.has(k) || c.id === w.id) continue;
      seen.add(k); out.push(c[field]);
    }
    return out;
  }

  function pickWords(n, exclude) {
    const pool = shuffle(WORDS.filter((w) => !exclude.has(w.id)));
    const take = pool.length >= n ? pool.slice(0, n) : pool.concat(shuffle(WORDS.filter((w) => !pool.includes(w))).slice(0, n - pool.length));
    return take.slice(0, n);
  }

  // ---------- Sessione ----------
  function startInfinite() {
    const seen = new Set();   // id delle parole già usate in questa sessione (si azzera se il mazzo finisce)
    const covered = [];       // le parole di questa sessione, nell'ordine in cui sono arrivate
    let asked = 0, wrong = 0;
    const wrongWords = new Map(); // id -> parola, quelle sbagliate almeno una volta

    const grab = (n) => {
      if (seen.size + n > WORDS.length) seen.clear(); // mazzo esaurito: si ricomincia a pescare da tutte le parole
      const ws = pickWords(n, seen);
      ws.forEach((w) => seen.add(w.id));
      return ws;
    };

    const record = (w, ok) => {
      asked++; if (!ok) { wrong++; wrongWords.set(w.id, w); }
      grade(w, ok);
    };

    const nextCycle = () => studyPhase(grab(CYCLE));

    function studyPhase(words) {
      let i = 0;
      const show = () => {
        if (i >= words.length) return testPhase(words);
        const w = words[i];
        view.innerHTML = `<div class="qtop"><button class="back" id="bk">‹ Esci</button><span>${covered.length + i + 1} / ${GOAL_WORDS} parole</span></div>
          <p class="hint" style="margin-top:0">Studia questa parola, poi vai avanti.</p>
          <div class="card">
            <div class="gr">${esc(w.gr)}</div><div class="tr">${esc(w.tr)}</div><div class="it">${esc(w.it)}</div>
            <button class="spk" id="spk">🔊</button>
          </div>
          <button class="big" id="nx">Avanti</button>`;
        $("#bk").onclick = exitInfinite;
        $("#spk").onclick = (e) => { e.stopPropagation(); speak(w.gr); };
        speak(w.gr);
        $("#nx").onclick = () => { i++; show(); };
      };
      show();
    }

    function testPhase(words) {
      let i = 0;
      const show = () => {
        if (i >= words.length) {
          covered.push(...words);
          return covered.length >= GOAL_WORDS ? recapPhase() : nextCycle();
        }
        const w = words[i], kind = Math.random() < 0.5 ? "listen" : "read";
        const opts = shuffle([w.it, ...wrongOpts(w, "it", 3)]);
        view.innerHTML = `<div class="qtop"><span>Test · ${covered.length + i + 1} / ${GOAL_WORDS} parole</span></div>
          <div class="card q"><div class="prompt">${kind === "listen" ? "Ascolta: che parola è?" : "Che cosa significa?"}</div>
            <div class="gr">${kind === "listen" ? "🔊" : esc(w.gr)}</div>${kind === "listen" ? `<button class="spk" id="spk">🔊</button>` : ""}</div>
          <div class="opts">${opts.map((o) => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div>
          <p class="fb" id="fb"></p>`;
        if (kind === "listen") { speak(w.gr); $("#spk").onclick = (e) => { e.stopPropagation(); speak(w.gr); }; }
        view.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
          const ok = b.dataset.o === w.it;
          view.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (x.dataset.o === w.it) x.classList.add("ok"); });
          if (!ok) b.classList.add("bad");
          record(w, ok); speak(w.gr);
          $("#fb").innerHTML = `${ok ? "✅ Giusto!" : "❌ Era"} <b>${esc(w.gr)}</b> <i>(${esc(w.tr)})</i> = ${esc(w.it)}<button class="big" id="nx">Avanti</button>`;
          $("#nx").onclick = () => { i++; show(); };
        }));
      };
      show();
    }

    function recapPhase() {
      const bag = []; while (bag.length < RECAP_N) bag.push(...shuffle(covered));
      const qs = shuffle(bag).slice(0, RECAP_N);
      let i = 0;
      const show = () => {
        if (i >= qs.length) return finish();
        const w = qs[i], kind = ["gr2it", "listen", "it2gr"][Math.floor(Math.random() * 3)];
        const field = kind === "it2gr" ? "gr" : "it";
        const opts = shuffle([w[field], ...wrongOpts(w, field, 3)]);
        const label = kind === "gr2it" ? "Che cosa significa?" : kind === "listen" ? "Ascolta: che parola è?" : "Come si dice in greco?";
        const main = kind === "gr2it" ? esc(w.gr) : kind === "listen" ? "🔊" : esc(w.it);
        view.innerHTML = `<div class="qtop"><span>Ripasso generale · ${i + 1} / ${qs.length}</span></div>
          <div class="progress"><div style="width:${(i / qs.length) * 100}%"></div></div>
          <div class="card q"><div class="prompt">${label}</div><div class="gr">${main}</div>${kind === "listen" ? `<button class="spk" id="spk">🔊</button>` : ""}</div>
          <div class="opts">${opts.map((o) => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div>
          <p class="fb" id="fb"></p>`;
        if (kind === "listen") { speak(w.gr); $("#spk").onclick = (e) => { e.stopPropagation(); speak(w.gr); }; }
        view.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
          const ok = b.dataset.o === w[field];
          view.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (x.dataset.o === w[field]) x.classList.add("ok"); });
          if (!ok) b.classList.add("bad");
          record(w, ok); speak(w.gr);
          $("#fb").innerHTML = `${ok ? "✅ Giusto!" : "❌ Era"} <b>${esc(w.gr)}</b> <i>(${esc(w.tr)})</i> = ${esc(w.it)}<button class="big" id="nx">Avanti</button>`;
          $("#nx").onclick = () => { i++; show(); };
        }));
      };
      show();
    }

    function finish() {
      const ws = [...wrongWords.values()];
      view.innerHTML = `<div class="done"><div class="emoji">${wrong === 0 ? "🏆" : "📘"}</div><h2>Sessione finita</h2>
        <p>${covered.length} parole nuove · ${asked} domande · ${wrong} ${wrong === 1 ? "sbagliata" : "sbagliate"}${asked ? ` (${Math.round((1 - wrong / asked) * 100)}% corrette)` : ""}</p></div>
        ${ws.length ? `<h2>Parole da rivedere</h2><div class="words">${ws.map((w) => `<div class="wr" data-id="${esc(w.id)}"><span class="g">${esc(w.gr)}</span><span class="p">${esc(w.tr)}</span><u>🔊</u><span class="i">${esc(w.it)}</span></div>`).join("")}</div>
        <p class="hint">Sono già state messe da parte: le ritroverai anche nel ripasso e tra le parole ostiche.</p>
        <button class="big" id="rv">Ripassa queste parole ora <span>${ws.length}</span></button>` : ""}
        <button class="big${ws.length ? " alt" : ""}" id="again">Un'altra sessione</button>
        <button class="big alt" id="home">Torna alla home</button>`;
      view.querySelectorAll(".wr[data-id]").forEach((r) => (r.onclick = () => { const w = ws.find((x) => x.id === r.dataset.id); if (w) speak(w.gr); }));
      if ($("#rv")) $("#rv").onclick = () => window.reviewWords(ws);
      $("#again").onclick = startInfinite;
      $("#home").onclick = () => go("home");
    }

    nextCycle();
  }

  function exitInfinite() { go("home"); }

  // ---------- Pulsante in Home ----------
  const baseHomeInf = renderHome;
  renderHome = function () {
    baseHomeInf();
    const tiles = view.querySelector(".tiles");
    if (tiles) {
      tiles.insertAdjacentHTML("beforeend", `<button class="tile2" id="goInf" style="grid-column:1 / -1"><i>∞</i><b>Modalità infinita</b><span>studia e mettiti alla prova, parole sempre nuove</span></button>`);
      $("#goInf").onclick = startInfinite;
    }
  };
})();
