// Home a schede: azioni principali in griglia, livelli come chip.
(function () {
  const st = document.createElement("style");
  st.textContent = `.tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}
.tile2{display:flex;flex-direction:column;gap:4px;text-align:left;padding:16px 14px;border:1px solid var(--line);border-radius:16px;background:var(--card);min-height:112px}
.tile2 i{font:normal 26px/1 var(--serif);color:var(--blue)}.tile2 b{font-weight:600;font-size:18px;margin-top:auto}.tile2 span{font-size:13px;color:var(--muted)}
.tile2.main{border-color:var(--gold);border-width:1.5px}.tile2.off{opacity:.55}
.lvchips{display:flex;gap:8px;overflow-x:auto;margin:0 -18px;padding:2px 18px 6px}.lvchips .chip{white-space:nowrap;flex:none;background:var(--card)}
.lvchips .chip.cur{border-color:var(--blue);color:var(--blue);font-weight:600}.lvchips .chip.lk{opacity:.5}
.minor{display:block;margin:22px auto 0;border:0;background:none;color:var(--muted);font-size:13px;text-decoration:underline}`;
  document.head.appendChild(st);
  renderHome = function () {
    inHome();
    const total = UNITS.reduce((n, us) => n + us.length, 0), done = Object.keys(state.pu).filter((id) => UNITS.some((us) => us.some((u) => u.id === id))).length;
    const nx = nextStep(), due = pool().filter(isDue).length;
    const nxLabel = !nx ? "Percorso completato" : nx.final ? `Test finale · Livello ${LEVELS[nx.a].n}` : UNITS[nx.a][nx.i].t;
    const cur = nx ? nx.a : LEVELS.length - 1;
    let h = `<h1>Ελληνικά <small>🔥 ${currentStreak()} giorni · ${done}/${total} unità · ${learnedCount()}/${WORDS.length} parole</small></h1>${goalCard()}
      <div class="tiles">
        <button class="tile2 main${nx ? "" : " off"}" id="goNext"><i>▶</i><b>Continua</b><span>${esc(nxLabel)}</span></button>
        <button class="tile2" id="goReview"><i>↻</i><b>Ripasso</b><span>${due} da fare</span></button>
        <button class="tile2" id="goTrain"><i>✎</i><b>Allenati</b><span>quiz e giochi</span></button>
        <button class="tile2" id="goRead"><i>≡</i><b>Letture</b><span>5 testi graduati</span></button>
        <button class="tile2 tank-tile" id="goTank"><i aria-hidden="true">⚡</i><b>Greek Tank Battle</b><span>Duelli di vocabolario nell’arena dell’Olimpo</span></button>
      </div>${backupNudge()}<h2>Livelli</h2><div class="lvchips">`;
    LEVELS.forEach((l, a) => {
      const n = UNITS[a].filter((u) => passedU(u.id)).length, open = levelOpen(a);
      h += `<button class="chip${a === cur ? " cur" : ""}${open ? "" : " lk"}" data-a="${a}">${open ? "" : "🔒 "}Livello ${l.n} · ${state.pl[a] ? "✓" : n + "/" + UNITS[a].length}</button>`;
    });
    h += `</div><button class="minor" id="free">Modalità prova: ${state.free ? "attiva (tutto sbloccato)" : "spenta"}</button>`;
    view.innerHTML = h;
    view.querySelectorAll(".lvchips .chip").forEach((b) => (b.onclick = () => {
      const a = +b.dataset.a;
      if (!levelOpen(a)) return toast(`Supera il test finale del livello ${LEVELS[a - 1].n} per sbloccarlo`);
      openLevel(a);
    }));
    $("#goNext").onclick = () => (nx ? (nx.final ? startFinal(nx.a) : openUnit(nx.a, nx.i)) : toast("Hai completato tutto il percorso"));
    $("#goReview").onclick = () => go("review");
    $("#goTrain").onclick = () => go("train");
    $("#goRead").onclick = () => { go("train"); const b = $("#goRead"); if (b) b.click(); };
    $("#goTank").onclick = () => go("tank");
    $("#free").onclick = () => { state.free = !state.free; save(); renderHome(); };
    bindHome();
  };
})();
