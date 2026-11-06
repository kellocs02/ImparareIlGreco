// Previsione del rischio di dimenticare una parola.
// Registra una cronologia compatta delle risposte e allena, quando ci sono abbastanza dati,
// una piccola rete neurale (scritta a mano, nessuna libreria) che stima quanto è probabile
// che una parola sia ancora nota. Il sistema a scatole (Leitner) resta invariato: la rete
// serve solo a scegliere in che ordine proporre le parole da ripassare, e a segnalare
// quelle più a rischio nelle statistiche.
(function () {
  state.rev = state.rev || {};   // cronologia per parola: ultime risposte con le condizioni di quel momento
  state.laps = state.laps || {}; // numero totale di volte sbagliate (cumulativo, non scende mai)
  state.net = state.net || null; // pesi della rete, una volta allenata
  state.netDay = state.netDay == null ? -1 : state.netDay;
  const MIN_REVIEWS = 40;  // sotto questa soglia non c'è abbastanza storia: nessuna previsione
  const HIST = 20;         // quante risposte recenti si conservano per parola
  const HIDDEN = 6;        // neuroni nello strato nascosto

  // ---------- Registrazione della cronologia ----------
  const baseGrade = grade;
  grade = function (w, known) {
    const c0 = state.cards[w.id];
    const boxBefore = c0 ? c0.box : -1;
    const since = c0 && c0.last != null ? today() - c0.last : -1; // -1 = prima volta che la vedo
    const lapsBefore = state.laps[w.id] || 0;
    baseGrade(w, known);
    const c1 = state.cards[w.id];
    if (c1) c1.last = today();
    if (!known) state.laps[w.id] = lapsBefore + 1;
    const arr = state.rev[w.id] || (state.rev[w.id] = []);
    arr.push({ ok: known ? 1 : 0, since, box: boxBefore, laps: lapsBefore, len: w.gr.length });
    if (arr.length > HIST) arr.shift();
    save();
  };

  function totalReviews() { return Object.values(state.rev).reduce((n, a) => n + a.length, 0); }

  // ---------- Somiglianza fra parole (distanza di Levenshtein, per la "confondibilità") ----------
  function lev(a, b) {
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
      d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]);
    return d[m][n];
  }
  function confusability(w) {
    const known = WORDS.filter((x) => x.id !== w.id && state.cards[x.id] && state.cards[x.id].box >= 1);
    let n = 0;
    for (const x of known) if (lev(w.gr.toLowerCase(), x.gr.toLowerCase()) <= 2) n++;
    return n;
  }

  // ---------- Caratteristiche in ingresso alla rete (tutte normalizzate fra 0 e 1) ----------
  function featVec({ since, box, laps, len, confuse }) {
    return [
      since < 0 ? 1 : Math.min(since / 30, 1),       // mai vista = massima "incertezza"
      Math.max(box, 0) / (INTERVALS.length - 1),
      Math.min(laps / 5, 1),
      Math.min(len / 12, 1),
      Math.min(confuse / 5, 1),
    ];
  }

  // ---------- Rete: 5 ingressi -> 6 nascosti (tanh) -> 1 uscita (sigmoide) ----------
  const rnd = () => (Math.random() * 2 - 1) * 0.5;
  function newNet(nIn, nHid) {
    return { w1: Array.from({ length: nHid }, () => Array.from({ length: nIn }, rnd)), b1: Array(nHid).fill(0), w2: Array.from({ length: nHid }, rnd), b2: 0 };
  }
  const sig = (x) => 1 / (1 + Math.exp(-x));
  function forward(net, x) {
    const h = net.w1.map((row, i) => Math.tanh(row.reduce((s, wv, k) => s + wv * x[k], net.b1[i])));
    const y = sig(h.reduce((s, hv, k) => s + hv * net.w2[k], net.b2));
    return { h, y };
  }
  function trainStep(net, x, target, lr) {
    const { h, y } = forward(net, x);
    const dy = y - target; // derivata di (perdita log) * sigmoide
    for (let k = 0; k < net.w2.length; k++) net.w2[k] -= lr * dy * h[k];
    net.b2 -= lr * dy;
    for (let i = 0; i < net.w1.length; i++) {
      const dh = dy * net.w2[i] * (1 - h[i] * h[i]);
      for (let k = 0; k < net.w1[i].length; k++) net.w1[i][k] -= lr * dh * x[k];
      net.b1[i] -= lr * dh;
    }
  }

  function buildDataset() {
    const data = [];
    for (const w of WORDS) {
      const arr = state.rev[w.id];
      if (!arr) continue;
      const confuse = confusability(w); // approssimazione: calcolata con le parole note adesso, non al momento di ogni risposta passata
      for (const r of arr) data.push({ x: featVec({ ...r, confuse }), y: r.ok });
    }
    return data;
  }

  function maybeTrain() {
    if (state.netDay === today()) return; // già allenata oggi
    state.netDay = today();
    if (totalReviews() < MIN_REVIEWS) { save(); return; } // non ancora abbastanza storia: nessuna previsione
    const data = buildDataset();
    const net = newNet(5, HIDDEN);
    const epochs = 80, lr = 0.15;
    for (let e = 0; e < epochs; e++) {
      const order = shuffle(data);
      for (const d of order) trainStep(net, d.x, d.y, lr);
    }
    state.net = net;
    save();
  }

  // probabilità stimata che la parola sia ancora nota in questo momento; null se non c'è ancora una rete allenata
  function recallProb(w) {
    if (!state.net) return null;
    const c = state.cards[w.id];
    const since = c && c.last != null ? today() - c.last : -1;
    const x = featVec({ since, box: c ? c.box : -1, laps: state.laps[w.id] || 0, len: w.gr.length, confuse: confusability(w) });
    return forward(state.net, x).y;
  }
  const risk = (w) => { const p = recallProb(w); return p == null ? null : 1 - p; };
  const riskClass = (r) => (r < 0.33 ? "risklow" : r < 0.66 ? "riskmid" : "riskhigh");
  const riskWord = (r) => (r < 0.33 ? "basso" : r < 0.66 ? "medio" : "alto");

  // usata da ripasso.js per ordinare le carte da rivedere: più alto = da proporre prima
  window.reviewPriority = (w) => { const r = risk(w); return r == null ? Math.random() : r; };

  try { maybeTrain(); } catch (e) {} // non deve mai bloccare l'avvio dell'app

  const st2 = document.createElement("style");
  st2.textContent = `.riskbadge{font-size:11px;font-weight:600;padding:4px 9px;border-radius:999px;display:inline-block}
.riskbadge.pos{position:absolute;top:58px;right:12px;cursor:pointer;border:0}
.risklow{background:var(--okbg);color:var(--ok)}.riskmid{background:var(--line);color:var(--gold)}.riskhigh{background:var(--badbg);color:var(--bad)}
.featrow{display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px}`;
  document.head.appendChild(st2);

  // ---------- Indicatore di rischio sulla carta del ripasso ----------
  let badgeBusy = false;
  new MutationObserver(() => {
    if (badgeBusy || !state.net) return;
    const card = view.querySelector(".card.q[data-id]");
    if (!card || card.querySelector(".riskbadge")) return;
    badgeBusy = true;
    const w = WORDS.find((x) => x.id === card.dataset.id);
    const r = w && risk(w);
    if (r != null) {
      const b = document.createElement("button");
      b.className = `riskbadge pos ${riskClass(r)}`;
      b.textContent = `rischio ${riskWord(r)}`;
      b.onclick = (e) => { e.stopPropagation(); renderNetInfo(w.id); };
      card.appendChild(b);
    }
    badgeBusy = false;
  }).observe(view, { childList: true, subtree: true });

  // ---------- Schermata "Come funziona la previsione" ----------
  function featuresOf(w) {
    const c = state.cards[w.id];
    return { since: c && c.last != null ? today() - c.last : -1, box: c ? c.box : -1, laps: state.laps[w.id] || 0, len: w.gr.length, confuse: confusability(w) };
  }
  function renderNetInfo(presetId) {
    const list = WORDS.filter((w) => state.cards[w.id]).concat(WORDS.filter((w) => !state.cards[w.id]));
    const start = (presetId && WORDS.find((x) => x.id === presetId)) || list[0];
    const draw = (id) => {
      const w = WORDS.find((x) => x.id === id) || start;
      const f = featuresOf(w), fv = featVec(f), p = recallProb(w), tr = totalReviews();
      const rows = [
        ["Giorni dall'ultima volta", f.since < 0 ? "mai vista" : f.since + " giorni", fv[0]],
        ["Quanto è solida (scatola)", f.box < 0 ? "mai vista" : (f.box + 1) + " / " + INTERVALS.length, fv[1]],
        ["Volte sbagliata in passato", String(f.laps), fv[2]],
        ["Lunghezza della parola", f.len + " lettere", fv[3]],
        ["Parole simili già note", String(f.confuse), fv[4]],
      ];
      view.innerHTML = `<button class="back" id="bk">‹ Progressi</button><h1>Come la rete stima il rischio<small>le informazioni che usa per ogni parola</small></h1>
        <p class="hint" style="margin-top:0">Per ogni parola la rete guarda queste 5 informazioni e stima quanto è probabile che tu la ricordi ancora. Scegli una parola per vedere i suoi valori di adesso.</p>
        <select id="wsel" style="width:100%;padding:12px;border:1.5px solid var(--line);border-radius:12px;background:var(--card);color:var(--fg);font:inherit;font-size:16px">
          ${list.map((x) => `<option value="${esc(x.id)}" ${x.id === w.id ? "selected" : ""}>${esc(x.gr)} — ${esc(x.it)}${state.cards[x.id] ? "" : " (mai vista)"}</option>`).join("")}
        </select>
        <div class="card q" style="margin-top:14px;min-height:auto;padding:26px 20px">
          <div class="gr" style="font-size:30px">${esc(w.gr)}</div><div class="tr">${esc(w.tr)}</div><div class="it">${esc(w.it)}</div>
          <div style="margin-top:12px">${p == null ? `<span class="riskbadge riskmid">rete non ancora allenata · ${tr}/${MIN_REVIEWS} risposte registrate</span>` : `<span class="riskbadge ${riskClass(1 - p)}" style="font-size:14px">rischio di averla dimenticata: ${Math.round((1 - p) * 100)}%</span>`}</div>
        </div>
        <div style="margin-top:18px;display:grid;gap:12px">${rows.map(([l, v, n]) => `<div><div class="featrow"><span>${esc(l)}</span><span class="hint" style="margin:0">${esc(v)}</span></div><div class="progress"><div style="width:${Math.round(n * 100)}%"></div></div></div>`).join("")}</div>`;
      $("#bk").onclick = () => go("stats");
      $("#wsel").onchange = (e) => draw(e.target.value);
    };
    draw(start.id);
  }

  // ---------- Pulsanti in "Progressi" ----------
  const baseStats = renderStats;
  renderStats = function () {
    baseStats();
    view.insertAdjacentHTML("beforeend", `<button class="big alt" id="goNetInfo">Come funziona la previsione <span>guarda le 5 informazioni usate</span></button>`);
    $("#goNetInfo").onclick = () => renderNetInfo();
    if (!state.net) return; // ancora in fase di raccolta dati: non mostriamo un elenco incerto
    const cand = WORDS.filter((w) => state.cards[w.id]);
    if (cand.length < 5) return;
    const top = cand.map((w) => ({ w, r: risk(w) })).sort((a, b) => b.r - a.r).slice(0, 5);
    view.insertAdjacentHTML("beforeend", `<h2>Più a rischio di dimenticare <span style="font-weight:400">· stima della rete</span></h2>
      <div class="words">${top.map((o) => `<div class="wr" data-id="${esc(o.w.id)}"><span class="g">${esc(o.w.gr)}</span><span class="p">${esc(o.w.tr)}</span><u>🔊</u><span class="i">${esc(o.w.it)}</span></div>`).join("")}</div>`);
    view.querySelectorAll(".wr[data-id]").forEach((r) => (r.onclick = () => { const w = WORDS.find((x) => x.id === r.dataset.id); if (w) speak(w.gr); }));
  };
})();