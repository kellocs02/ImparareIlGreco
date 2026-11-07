// Letture brevi graduate (una per livello) e scrittura a mano delle lettere.
(function () {
  const R = READINGS.map((r) => ({ ...r, g: Object.fromEntries(r.g.split(";").map((x) => { const p = x.split("|"); return [p[0].toLowerCase(), [p[1], p[2]]]; })) }));

  function lookup(g, core) {
    const k = core.toLowerCase();
    return g[k] ? { gr: k, v: g[k] } : (Object.keys(g).filter((x) => x.includes(" ")).map((x) => ({ gr: x, v: g[x] })).find((o) => o.gr.split(" ").includes(k)) || null);
  }
  function renderReadings() {
    view.innerHTML = `<button class="back" id="bk">‹ Allenati</button><h1>Letture brevi <small>una per livello: tocca le parole</small></h1>` +
      R.map((r, i) => `<button class="lvl" data-i="${i}"><b>Lettura ${i + 1}</b><span>${esc(r.t)}</span><em>Livello ${i + 1}</em></button>`).join("");
    $("#bk").onclick = () => go("train");
    view.querySelectorAll(".lvl").forEach((b) => (b.onclick = () => openReading(+b.dataset.i)));
  }
  function openReading(i) {
    const r = R[i];
    view.innerHTML = `<button class="back" id="bk">‹ Letture</button><h1>${esc(r.t)}<small>Lettura ${i + 1}</small></h1>
      <button class="big alt" id="all" style="margin-top:0">🔊 Ascolta tutto <span>voce greca</span></button>
      ${r.s.map((s, k) => `<div class="dl" style="cursor:default"><span class="g">${s[0].split(/\s+/).map((w) => `<span class="tw" data-c="${esc(coreOf(w))}" style="cursor:pointer;border-bottom:1px dotted var(--muted)">${esc(w)}</span>`).join(" ")}</span>
        <button class="chip" data-s="${k}" style="margin-top:8px">🔊</button> <button class="chip" data-t="${k}" style="margin-top:8px">Traduci</button><span class="i" id="t${k}" hidden>${esc(s[1])}</span></div>`).join("")}
      <div class="detail" id="det" hidden></div>`;
    $("#bk").onclick = renderReadings;
    $("#all").onclick = () => speakMany(r.s.map((s) => s[0]));
    view.querySelectorAll("[data-s]").forEach((b) => (b.onclick = () => speak(r.s[+b.dataset.s][0])));
    view.querySelectorAll("[data-t]").forEach((b) => (b.onclick = () => { const e = $("#t" + b.dataset.t); e.hidden = !e.hidden; }));
    view.querySelectorAll(".tw").forEach((w) => (w.onclick = () => {
      const o = lookup(r.g, w.dataset.c), d = $("#det"); d.hidden = false;
      d.innerHTML = o ? `<span class="big-letter" style="font-size:26px">${esc(o.gr)}</span><span><i>${esc(o.v[0])}</i><br>${esc(o.v[1])}</span>` : `<span>Parola non in glossario: usa «Traduci» sulla frase.</span>`;
      if (o) speak(o.gr);
    }));
  }

  // ---------- Scrittura a mano ----------
  const S = 300;
  function renderWrite(idx, upper, showModel) {
    idx = ((idx % ALPHABET.length) + ALPHABET.length) % ALPHABET.length;
    if (upper === undefined) upper = true; if (showModel === undefined) showModel = true;
    const L = ALPHABET[idx], ch = upper ? L[0] : L[1].split(" ")[0];
    view.innerHTML = `<button class="back" id="bk">‹ Alfabeto</button><h1>Scrivi la lettera <small>${esc(L[0])}${esc(L[1].split(" ")[0])} · ${esc(L[2])}</small></h1>
      <canvas id="cv" width="${S}" height="${S}" style="width:100%;max-width:340px;display:block;margin:0 auto;border:1.5px solid var(--line);border-radius:16px;background:var(--card);touch-action:none"></canvas>
      <p class="hint" id="res" style="text-align:center">Traccia la lettera con il dito, seguendo il modello.</p>
      <div class="row"><button class="no" id="clr">Cancella</button><button class="yes" id="chk">Controlla</button></div>
      <div class="chips" style="margin-top:14px;justify-content:center"><button class="chip" id="cs">${upper ? "Passa a minuscola" : "Passa a maiuscola"}</button><button class="chip" id="md">${showModel ? "Nascondi modello" : "Mostra modello"}</button></div>
      <div class="pager"><button id="pv">‹ Precedente</button><button id="nx">Successiva ›</button></div>`;
    const cv = $("#cv"), ctx = cv.getContext("2d");
    const font = `600 ${upper ? 230 : 250}px Palatino, "Noto Serif", Georgia, serif`;
    const drawModel = (c, w, color) => { c.font = font; c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round"; if (w) { c.lineWidth = w; c.strokeStyle = color; c.strokeText(ch, S / 2, S / 2 + 12); } else { c.fillStyle = color; c.fillText(ch, S / 2, S / 2 + 12); } };
    const base = () => { ctx.clearRect(0, 0, S, S); ctx.strokeStyle = "rgba(128,128,128,.25)"; ctx.lineWidth = 1; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(0, S / 2); ctx.lineTo(S, S / 2); ctx.moveTo(S / 2, 0); ctx.lineTo(S / 2, S); ctx.stroke(); ctx.setLineDash([]); if (showModel) drawModel(ctx, 0, "rgba(120,140,170,.28)"); };
    const ink = document.createElement("canvas"); ink.width = ink.height = S; const ic = ink.getContext("2d");
    const pen = (c, w) => { c.lineWidth = w; c.lineCap = c.lineJoin = "round"; c.strokeStyle = "#1d4ec2"; };
    let strokes = [], cur = null;
    const redraw = () => { base(); strokes.forEach((s) => { pen(ctx, 7); ctx.beginPath(); s.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); if (s.length === 1) ctx.lineTo(s[0][0] + .1, s[0][1]); ctx.stroke(); }); };
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * S / r.width, (e.clientY - r.top) * S / r.height]; };
    cv.onpointerdown = (e) => { cv.setPointerCapture(e.pointerId); cur = [pos(e)]; strokes.push(cur); redraw(); };
    cv.onpointermove = (e) => { if (!cur) return; cur.push(pos(e)); redraw(); };
    cv.onpointerup = cv.onpointercancel = () => { cur = null; };
    redraw(); speak(L[2]);
    $("#clr").onclick = () => { strokes = []; $("#res").textContent = "Traccia la lettera con il dito, seguendo il modello."; redraw(); };
    $("#chk").onclick = () => {
      if (!strokes.length) return toast("Prima scrivi la lettera");
      const px = (c) => c.getImageData(0, 0, S, S).data;
      const mod = document.createElement("canvas"); mod.width = mod.height = S; const mc = mod.getContext("2d");
      drawModel(mc, 0, "#000"); const m0 = px(mc);                       // modello sottile
      mc.clearRect(0, 0, S, S); drawModel(mc, 0, "#000"); drawModel(mc, 34, "#000"); const mWide = px(mc); // modello allargato
      ic.clearRect(0, 0, S, S); strokes.forEach((s) => { pen(ic, 7); ic.beginPath(); s.forEach((p, k) => (k ? ic.lineTo(p[0], p[1]) : ic.moveTo(p[0], p[1]))); if (s.length === 1) ic.lineTo(s[0][0] + .1, s[0][1]); ic.stroke(); });
      const u0 = px(ic); ic.lineWidth = 34; ic.globalCompositeOperation = "source-over"; ic.clearRect(0, 0, S, S);
      strokes.forEach((s) => { pen(ic, 34); ic.beginPath(); s.forEach((p, k) => (k ? ic.lineTo(p[0], p[1]) : ic.moveTo(p[0], p[1]))); if (s.length === 1) ic.lineTo(s[0][0] + .1, s[0][1]); ic.stroke(); });
      const uWide = px(ic);
      let mTot = 0, mHit = 0, uTot = 0, uIn = 0;
      for (let k = 3; k < S * S * 4; k += 4) { if (m0[k] > 100) { mTot++; if (uWide[k] > 100) mHit++; } if (u0[k] > 100) { uTot++; if (mWide[k] > 100) uIn++; } }
      const cover = mTot ? mHit / mTot : 0, prec = uTot ? uIn / uTot : 0;
      $("#res").innerHTML = cover > .75 && prec > .75 ? "🎉 <b>Ottimo!</b> Lettera ben tracciata." : cover > .5 && prec > .5 ? "👍 <b>Quasi.</b> Segui meglio il modello." : "💪 <b>Riprova.</b> Guarda la forma e ripassa il tratto.";
      $("#res").innerHTML += `<br><small>copertura ${Math.round(cover * 100)}% · precisione ${Math.round(prec * 100)}%</small>`;
    };
    $("#cs").onclick = () => renderWrite(idx, !upper, showModel);
    $("#md").onclick = () => renderWrite(idx, upper, !showModel);
    $("#pv").onclick = () => renderWrite(idx - 1, upper, showModel);
    $("#nx").onclick = () => renderWrite(idx + 1, upper, showModel);
    $("#bk").onclick = () => go("alpha");
  }

  // ---------- Pulsanti ----------
  const baseAlpha = renderAlpha;
  renderAlpha = function () {
    baseAlpha();
    const h = view.querySelector("h1");
    h.insertAdjacentHTML("afterend", `<button class="big" id="goWrite" style="margin:0 0 14px">✍ Scrivi le lettere <span>traccia con il dito</span></button>`);
    $("#goWrite").onclick = () => renderWrite(0);
  };
  const baseTrain = renderTrain;
  renderTrain = function () {
    baseTrain();
    view.querySelector(".hint").insertAdjacentHTML("beforebegin", `<button class="big alt" id="goRead">Letture brevi <span>${R.length} testi graduati</span></button>`);
    $("#goRead").onclick = renderReadings;
  };
})();