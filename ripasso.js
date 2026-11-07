// Ripasso rinnovato, tastiera greca, riordina la frase, parole ostiche e preferiti.
(function () {
  state.fav = state.fav || {}; state.note = state.note || {};
  const rf = restoreFrom; // dopo un ripristino i campi nuovi devono esistere
  restoreFrom = function (t) { rf(t); state.fav = state.fav || {}; state.note = state.note || {}; };
  const st = document.createElement("style");
  st.textContent = `.kb{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin-top:10px}.kb button{padding:11px 0;border:1px solid var(--line);border-radius:9px;background:var(--card);font:600 20px var(--serif)}.kb .w{grid-column:span 2}
.star{position:absolute;top:10px;left:12px;width:46px;height:46px;border:0;background:none;font-size:26px;color:var(--gold)}
.chipsel{display:flex;flex-wrap:wrap;gap:8px;min-height:56px;padding:12px;border:1.5px dashed var(--line);border-radius:12px;margin-top:12px}
.tile{padding:10px 14px;border:1.5px solid var(--line);border-radius:10px;background:var(--card);font:600 20px var(--serif)}
.tile.used{opacity:.25}`;
  document.head.appendChild(st);
  const star = (w) => (state.fav[w.id] ? "★" : "☆");
  const toggleFav = (w) => { if (state.fav[w.id]) delete state.fav[w.id]; else state.fav[w.id] = 1; save(); };
  const kbHtml = () => `<div class="kb">${[..."αβγδεζηθικλμνξοπρστυφχψω", ..."άέήίόύώ"].map((c) => `<button data-c="${c}">${c}</button>`).join("")}<button class="w" data-c=" ">spazio</button><button class="w" data-c="⌫">⌫</button></div>`;
  function bindKb(inp) {
    inp.setAttribute("inputmode", "none");
    view.querySelectorAll(".kb button").forEach((b) => (b.onclick = () => {
      const c = b.dataset.c; inp.value = c === "⌫" ? inp.value.slice(0, -1) : inp.value + c;
    }));
  }
  const done = (title, msg, btns) => { view.innerHTML = `<div class="done"><div class="emoji">✅</div><h2>${title}</h2><p>${msg}</p>${btns.map((b, i) => `<button class="big${i ? " alt" : ""}" id="d${i}">${b[0]}</button>`).join("")}</div>`; btns.forEach((b, i) => ($("#d" + i).onclick = b[1])); };

  // ---------- Ripasso ----------
  startReview = function () {
    const all = pool().filter(isDue);
    const nw = all.filter((w) => !state.cards[w.id]).length, old = all.length - nw;
    view.innerHTML = `<h1>Ripasso <small>esercizi diversi in base a quanto conosci ogni parola</small></h1>
      <div class="stats"><div><b>${old}</b><span>da ripassare</span></div><div><b>${nw}</b><span>nuove</span></div><div><b>${errCount()}</b><span>ostiche</span></div></div>
      <button class="big" data-n="15">Sessione breve <span>~5 minuti · 15 carte</span></button>
      <button class="big alt" data-n="30">Sessione media <span>~10 minuti · 30 carte</span></button>
      <button class="big alt" data-n="60">Tutte quelle di oggi <span>fino a 60 carte</span></button>
      <button class="big alt" id="rfav">Solo preferiti <span>${Object.keys(state.fav).length} parole</span></button>`;
    view.querySelectorAll("button[data-n]").forEach((b) => (b.onclick = () => runReview(all, +b.dataset.n)));
    $("#rfav").onclick = () => { const f = WORDS.filter((w) => state.fav[w.id]); f.length ? runReview(f, 30) : toast("Tocca ☆ su una carta per aggiungerla ai preferiti"); };
  };
  const kindOf = (w) => { const b = boxOf(w); return b < 1 ? (Math.random() < .5 ? "choice" : "listen") : b < 3 ? "it2gr" : "dict"; };
  function runReview(list, n) {
    const fresh_ = shuffle(list.filter((w) => !state.cards[w.id])).slice(0, 6);
    const prio = window.reviewPriority || (() => Math.random()); // forget.js, se caricato, mette qui una stima del rischio di dimenticare
    const dueSorted = list.filter((w) => state.cards[w.id]).map((w) => ({ w, p: prio(w) })).sort((a, b) => b.p - a.p).map((x) => x.w);
    let queue = dueSorted.concat(fresh_).slice(0, n).map((w) => ({ w, kind: kindOf(w), first: true }));
    const total = queue.length, wrong = new Map(); let i = 0, right = 0;
    if (!total) return done("Tutto in regola!", "Niente da ripassare per ora.", [["Torna alla home", () => go("home")]]);
    const show = () => {
      if (!queue.length) {
        const ws = [...wrong.values()];
        return done("Sessione finita", `Prima risposta giusta: ${right} su ${total}.` + (ws.length ? `<br>Da rivedere: ${ws.map((w) => esc(w.gr)).join(", ")}` : ""),
          (ws.length ? [["Riprova solo queste", () => runReview(ws, 30)]] : []).concat([["Torna alla home", () => go("home")]]));
      }
      const q = queue.shift(), w = q.w;
      const label = { choice: "Che cosa significa?", listen: "Ascolta e scegli il significato", it2gr: "Scrivi in greco", dict: "Dettato: scrivi in greco quello che senti" }[q.kind];
      const main = q.kind === "choice" ? esc(w.gr) : q.kind === "it2gr" ? esc(w.it) : "🔊";
      let body;
      if (q.kind === "choice" || q.kind === "listen") {
        q.opts = q.opts || shuffle([w].concat(shuffle(WORDS.filter((x) => x.id !== w.id && (x.cat === w.cat || WORDS.length < 12))).slice(0, 3)));
        body = `<div class="opts">${q.opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o.it)}</button>`).join("")}</div>`;
      } else body = `<div class="typebox"><input id="ans" autocomplete="off" spellcheck="false" placeholder="Scrivi qui"><button class="big" id="chk" style="justify-content:center">Controlla</button><button class="big alt" id="skip" style="justify-content:center">Salta</button></div>${kbHtml()}`;
      view.innerHTML = `<div class="progress"><div style="width:${((total - queue.length - 1) / total) * 100}%"></div></div><p class="count">${total - queue.length} / ${total}</p>
        <div class="card q" data-id="${esc(w.id)}"><button class="star" id="st">${star(w)}</button><div class="prompt">${label}</div><div class="gr">${main}</div><button class="spk" id="spk">🔊</button></div>${body}<p class="fb" id="fb"></p>`;
      $("#spk").onclick = () => speak(w.gr); $("#st").onclick = () => { toggleFav(w); $("#st").textContent = star(w); };
      if (q.kind === "listen" || q.kind === "dict") speak(w.gr);
      const fin = (ok) => {
        if (q.first) { grade(w, ok); if (ok) right++; else wrong.set(w.id, w); }
        if (!ok) queue.push({ w, kind: "choice", first: false });
        speak(w.gr);
        $("#fb").innerHTML = `${ok ? "✅ Giusto!" : "❌ Era"} <b>${esc(w.gr)}</b> <i>(${esc(w.tr)})</i> = ${esc(w.it)}<button class="big" id="nx">Avanti</button>`;
        $("#nx").onclick = show;
      };
      if (q.kind === "choice" || q.kind === "listen") view.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        const ok = q.opts[+b.dataset.k].id === w.id; b.classList.add(ok ? "ok" : "bad");
        view.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fin(ok);
      }));
      else {
        const inp = $("#ans"); bindKb(inp);
        $("#chk").onclick = () => { if (!inp.value.trim()) return; const ok = norm(inp.value) === norm(w.gr); inp.classList.add(ok ? "ok" : "bad"); $("#chk").hidden = true; $("#skip").hidden = true; fin(ok); };
        $("#skip").onclick = () => { $("#chk").hidden = true; $("#skip").hidden = true; fin(false); };
      }
    };
    show();
  }

  // ---------- Riordina la frase ----------
  function startOrder() {
    const sents = shuffle(sentencesIn(LEVELS.flatMap((l) => l.sections)).filter((s) => { const n = s.gr.trim().split(/\s+/).length; return n >= 3 && n <= 7; })).slice(0, 8);
    if (!sents.length) return toast("Nessuna frase disponibile");
    let i = 0, score = 0;
    const show = () => {
      if (i >= sents.length) return done(`${score} / ${sents.length}`, "Frasi riordinate al primo colpo.", [["Rifai", startOrder], ["Allenati", () => go("train")]]);
      const s = sents[i], target = s.gr.trim().split(/\s+/); let picked = [];
      const tiles = shuffle(target.map((t, k) => ({ t, k })));
      const draw = () => {
        view.innerHTML = `<div class="progress"><div style="width:${(i / sents.length) * 100}%"></div></div><p class="count">Frase ${i + 1} / ${sents.length}</p>
          <div class="card q"><div class="prompt">Riordina le parole</div><div class="gr sm">${esc(s.it)}</div></div>
          <div class="chipsel" id="sel">${picked.map((p) => `<button class="tile" data-p="${p.k}">${esc(p.t)}</button>`).join("")}</div>
          <div class="chipsel" style="border:0">${tiles.map((t) => `<button class="tile${picked.includes(t) ? " used" : ""}" data-k="${t.k}" ${picked.includes(t) ? "disabled" : ""}>${esc(t.t)}</button>`).join("")}</div>
          <button class="big" id="chk" style="justify-content:center">Controlla</button><p class="fb" id="fb"></p>`;
        view.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => { picked.push(tiles.find((t) => t.k == b.dataset.k)); draw(); }));
        view.querySelectorAll("[data-p]").forEach((b) => (b.onclick = () => { picked = picked.filter((p) => p.k != b.dataset.p); draw(); }));
        $("#chk").onclick = () => {
          const ok = picked.map((p) => norm(p.t)).join("") === target.map(norm).join("");
          if (ok && !s.miss) score++; if (!ok) s.miss = 1;
          speak(s.gr); $("#chk").hidden = true;
          $("#fb").innerHTML = `${ok ? "✅ Giusto!" : "❌ Ordine corretto:"} <b>${esc(s.gr)}</b><button class="big" id="nx">${ok ? "Avanti" : "Ho capito"}</button>`;
          $("#nx").onclick = () => { i++; show(); };
        };
      };
      draw();
    };
    show();
  }

  // ---------- Parole ostiche e preferiti ----------
  function renderHard(tabName) {
    tabName = tabName || "hard";
    const ws = tabName === "hard" ? errWords().sort((x, y) => state.err[y.id] - state.err[x.id]) : WORDS.filter((w) => state.fav[w.id]);
    view.innerHTML = `<button class="back" id="bk">‹ Allenati</button><h1>Le mie parole</h1>
      <div class="chips"><button class="chip ${tabName === "hard" ? "on" : ""}" data-t="hard">Ostiche (${errCount()})</button><button class="chip ${tabName === "fav" ? "on" : ""}" data-t="fav">★ Preferiti (${Object.keys(state.fav).length})</button></div>
      <div class="words" style="margin-top:14px">${ws.map((w) => `<div class="wr" data-id="${esc(w.id)}"><span class="g">${esc(w.gr)}</span><span class="p">${esc(w.tr)}</span><u>🔊</u><span class="i">${esc(w.it)}${state.note[w.id] ? `<span class="src">📝 ${esc(state.note[w.id])}</span>` : ""}<span class="src"><a href="#" data-n="${esc(w.id)}">✎ nota</a> · <a href="#" data-f="${esc(w.id)}">${star(w)} preferito</a></span></span></div>`).join("") || `<p class="hint">Nessuna parola qui, per ora.</p>`}</div>
      ${ws.length ? `<button class="big" id="rv">Ripassa queste <span>${ws.length} parole</span></button>` : ""}`;
    $("#bk").onclick = () => go("train");
    view.querySelectorAll("[data-t]").forEach((b) => (b.onclick = () => renderHard(b.dataset.t)));
    view.querySelectorAll(".wr").forEach((r) => (r.onclick = () => { const w = ws.find((x) => x.id === r.dataset.id); if (w) speak(w.gr); }));
    view.querySelectorAll("[data-n]").forEach((a) => (a.onclick = (e) => { e.preventDefault(); e.stopPropagation(); const t = prompt("Trucco o nota personale:", state.note[a.dataset.n] || ""); if (t !== null) { if (t.trim()) state.note[a.dataset.n] = t.trim(); else delete state.note[a.dataset.n]; save(); renderHard(tabName); } }));
    view.querySelectorAll("[data-f]").forEach((a) => (a.onclick = (e) => { e.preventDefault(); e.stopPropagation(); const w = WORDS.find((x) => x.id === a.dataset.f) || wordMap().get(a.dataset.f); if (w) { toggleFav(w); renderHard(tabName); } }));
    if ($("#rv")) $("#rv").onclick = () => runReview(ws, 30);
  }

  // ---------- Pulsanti in "Allenati" ----------
  const baseTrain = renderTrain;
  renderTrain = function () {
    baseTrain();
    const h = view.querySelector(".hint");
    h.insertAdjacentHTML("beforebegin", `<button class="big alt" id="goOrder">Riordina la frase <span>dalle lezioni</span></button><button class="big alt" id="goHard">Le mie parole <span>ostiche e preferiti</span></button>`);
    $("#goOrder").onclick = startOrder; $("#goHard").onclick = () => renderHard("hard");
  };

  // esposta per poter avviare un ripasso mirato su un elenco di parole da un altro modulo (es. infinito.js)
  window.reviewWords = (list) => { if (list && list.length) runReview(list, list.length); };
})();