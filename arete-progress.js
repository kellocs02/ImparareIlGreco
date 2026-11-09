// ARETE — progressi: totali, frequenza, durata, volume, progressione per esercizio, record personali.
// Ogni numero e ogni grafico viene calcolato dagli allenamenti salvati in arete-db.js; senza dati si mostra un messaggio.
(function () {
  const A = Arete, DB = A.DB, fmt = A.fmt, esc = A.esc;
  const MS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  let st = { period: "week", metric: "count", ex: "", exMetric: "top" };

  // Grafico a linee su asse temporale reale
  function line(points, { unit = "kg" } = {}) {
    if (!points.length) return `<p class="ar-note">Nessun dato.</p>`;
    const W = 300, H = 150, L = 38, R = 10, T = 12, B = 22;
    const ts = points.map((p) => p.t), vs = points.map((p) => p.v);
    let t0 = Math.min(...ts), t1 = Math.max(...ts), v0 = Math.min(...vs), v1 = Math.max(...vs);
    if (t1 === t0) { t0 -= 864e5; t1 += 864e5; }
    if (v1 === v0) { v0 = Math.max(0, v0 - 1); v1 = v1 + 1; }
    const pad = (v1 - v0) * 0.1; v0 = Math.max(0, v0 - pad); v1 += pad;
    const X = (t) => L + ((t - t0) / (t1 - t0)) * (W - L - R), Y = (v) => T + (1 - (v - v0) / (v1 - v0)) * (H - T - B);
    const d = points.map((p, i) => `${i ? "L" : "M"}${X(p.t).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(" ");
    const day = (t) => { const x = new Date(t); return `${x.getDate()} ${MS[x.getMonth()]}`; };
    const ticks = [v0, (v0 + v1) / 2, v1].map((v) => `<line class="ar-grid" x1="${L}" x2="${W - R}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text class="ar-lab r" x="${L - 4}" y="${(Y(v) + 3).toFixed(1)}">${A.num(Math.round(v * 10) / 10)}</text>`).join("");
    const dots = points.map((p) => `<circle class="ar-dot" cx="${X(p.t).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="3.2"><title>${day(p.t)}: ${A.num(Math.round(p.v * 10) / 10)} ${unit}</title></circle>`).join("");
    return `<svg class="ar-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Andamento nel tempo">${ticks}<path class="ar-line" d="${d}"/>${dots}<text class="ar-lab" x="${L}" y="${H - 5}" text-anchor="start">${day(points[0].t)}</text><text class="ar-lab" x="${W - R}" y="${H - 5}" text-anchor="end">${points.length > 1 ? day(points[points.length - 1].t) : ""}</text></svg>`;
  }
  const seg = (name, cur, opts) => `<div class="ar-seg sm">${opts.map(([k, n]) => `<button class="${cur === k ? "on" : ""}" data-act="pg-set" data-k="${name}" data-v="${k}">${n}</button>`).join("")}</div>`;

  function frequency() {
    const wk = st.period === "week", data = wk ? DB.weekly(12) : DB.monthly(12);
    const pick = { count: (b) => b.count, time: (b) => Math.round(b.ms / 60000), vol: (b) => Math.round(b.volume) }[st.metric];
    const unit = { count: "", time: " min", vol: " kg" }[st.metric];
    const labels = data.map((b) => (wk ? (() => { const d = new Date(b.start); return d.getDate() + "/" + (d.getMonth() + 1); })() : MS[b.m]));
    return `${seg("period", st.period, [["week", "Settimane"], ["month", "Mesi"]])}${seg("metric", st.metric, [["count", "Allenamenti"], ["time", "Durata"], ["vol", "Volume"]])}
      <div class="ar-card">${A.bars(data.map(pick), labels, { unit: "" })}<p class="ar-note">${{ count: "Allenamenti", time: "Minuti di allenamento", vol: "Volume (kg × ripetizioni)" }[st.metric]} per ${wk ? "settimana (ultime 12, lun–dom)" : "mese (ultimi 12)"}.</p></div>`;
  }
  function progression() {
    const ex = DB.trainedExercises();
    if (!ex.length) return `<p class="ar-note">Quando avrai concluso degli allenamenti potrai seguire qui l'andamento di ogni esercizio.</p>`;
    if (!st.ex || !ex.some((e) => e.id === +st.ex)) st.ex = ex[0].id;
    const hist = DB.history(+st.ex).slice().reverse(); // dal più vecchio
    const key = { top: "topWeight", rm: "best1RM", vol: "volume" }[st.exMetric];
    const pts = hist.map((s) => ({ t: s.date, v: s[key] }));
    const rec = DB.records().find((r) => r.exerciseId === +st.ex);
    return `<label class="ar-lbl">Esercizio<select class="ar-in" data-chg="pg-ex">${ex.map((e) => `<option value="${e.id}"${e.id === +st.ex ? " selected" : ""}>${esc(e.name)}</option>`).join("")}</select></label>
      ${seg("exMetric", st.exMetric, [["top", "Peso massimo"], ["rm", "1RM stimato"], ["vol", "Volume"]])}
      <div class="ar-card">${line(pts, { unit: "kg" })}<p class="ar-note">${hist.length} ${hist.length === 1 ? "sessione registrata" : "sessioni registrate"}${st.exMetric === "rm" ? " · 1RM stimato con la formula di Epley (peso × (1 + ripetizioni/30)): è una stima, non una misura." : "."}</p></div>
      ${rec ? `<div class="ar-sum"><div><b>${fmt.kg(rec.maxWeight.weight)}</b><span>massimo (× ${rec.maxWeight.reps})</span></div><div><b>${fmt.kg(rec.best1RM.value)}</b><span>1RM stimato</span></div><div><b>${fmt.vol(rec.bestVolume.value)}</b><span>miglior volume</span></div></div>` : ""}`;
  }
  function records() {
    const r = DB.records();
    if (!r.length) return `<p class="ar-note">I tuoi record personali compariranno dopo i primi allenamenti.</p>`;
    return `<div class="ar-card"><table class="ar-tbl rec"><thead><tr><th>Esercizio</th><th>Peso max</th><th>1RM stimato</th></tr></thead><tbody>${r.map((x) => `<tr data-act="pg-pick" data-id="${x.exerciseId}"><td>${esc(x.name)}</td><td>${fmt.kg(x.maxWeight.weight)} × ${x.maxWeight.reps}<small>${fmt.dayShort(x.maxWeight.date)}</small></td><td>${fmt.kg(x.best1RM.value)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  A.screen("progress", () => {
    const t = DB.totals();
    if (!t.count) { view.innerHTML = A.head("Progressi", "Statistiche e record") + A.empty("Ancora nessun dato", "Qui vedrai frequenza, volume, progressione dei carichi e record personali, calcolati dai tuoi allenamenti reali.", `<button class="ar-btn sm" data-act="goto" data-sec="workout">Inizia il primo allenamento</button>`); return; }
    const perWeek = t.first ? t.count / Math.max(1, (Date.now() - t.first) / (7 * 864e5)) : 0;
    view.innerHTML = A.head("Progressi", "Statistiche e record") +
      `<div class="ar-tiles four"><div class="ar-tile"><b>${t.count}</b><span>allenamenti</span></div><div class="ar-tile"><b>${fmt.dur(t.ms)}</b><span>durata totale</span></div><div class="ar-tile"><b>${fmt.vol(t.volume)}</b><span>volume totale</span></div><div class="ar-tile"><b>${A.num(Math.round(perWeek * 10) / 10)}</b><span>a settimana (media)</span></div></div>
      <h2 class="ar-h2">Frequenza e carico</h2>${frequency()}
      <h2 class="ar-h2">Progressione per esercizio</h2>${progression()}
      <h2 class="ar-h2">Record personali</h2>${records()}`;
  });
  A.reg({
    "pg-set": (el) => { st[el.dataset.k] = el.dataset.v; A.render(); },
    "pg-ex": (el) => { st.ex = el.value; A.render(); },
    "pg-pick": (el) => { st.ex = el.dataset.id; A.render(); document.querySelector('[data-chg="pg-ex"]').scrollIntoView({ block: "center" }); }
  });
})();
