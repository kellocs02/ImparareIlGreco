// ARETE — diario: calendario mensile, storico, dettaglio delle sessioni, cronologia per esercizio.
(function () {
  const A = Arete, DB = A.DB, fmt = A.fmt, esc = A.esc;
  const MO = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  const now = new Date();
  let st = { tab: "cal", y: now.getFullYear(), m: now.getMonth(), day: DB.dateKey(Date.now()), shown: 20, ex: "" };

  const row = (w) => `<button class="ar-card row link" data-act="wk-open" data-id="${w.id}"><div><b>${esc(w.name)}</b><small>${fmt.dayShort(w.startedAt)}, ${fmt.time(w.startedAt)} · ${fmt.dur(w.duration)} · ${A.plural(w.exercises.length, "esercizio", "esercizi")} · ${fmt.vol(w.volume)}</small></div><span>›</span></button>`;

  function calendar() {
    const days = DB.byDay(), first = new Date(st.y, st.m, 1), lead = (first.getDay() + 6) % 7, n = new Date(st.y, st.m + 1, 0).getDate(), todayKey = DB.dateKey(Date.now());
    let cells = "";
    for (let i = 0; i < lead; i++) cells += `<span class="cal-e"></span>`;
    let inMonth = 0;
    for (let d = 1; d <= n; d++) {
      const key = `${st.y}-${String(st.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, ws = days[key] || [];
      inMonth += ws.length;
      cells += `<button class="cal-d${ws.length ? " has" : ""}${key === todayKey ? " today" : ""}${key === st.day ? " sel" : ""}" data-act="cal-day" data-key="${key}" aria-label="${d} ${MO[st.m]}${ws.length ? ", " + A.plural(ws.length, "allenamento", "allenamenti") : ""}"><span>${d}</span>${ws.length ? `<i>${ws.length > 1 ? ws.length : ""}</i>` : ""}</button>`;
    }
    const sel = days[st.day] || [];
    let h = `<div class="cal-head"><button class="ar-dots" data-act="cal-prev" aria-label="Mese precedente">‹</button><b>${MO[st.m]} ${st.y}</b><button class="ar-dots" data-act="cal-next" aria-label="Mese successivo">›</button></div>
      <div class="cal-wd">${["L", "M", "M", "G", "V", "S", "D"].map((x) => `<span>${x}</span>`).join("")}</div><div class="cal-grid">${cells}</div>
      <p class="ar-note">${inMonth ? A.plural(inMonth, "allenamento", "allenamenti") + " in questo mese." : "Nessun allenamento in questo mese."}</p>`;
    const [y, mm, dd] = st.day.split("-").map(Number);
    h += `<h2 class="ar-h2">${fmt.dayLong(new Date(y, mm - 1, dd).getTime())}</h2>`;
    h += sel.length ? sel.map(row).join("") : `<p class="ar-note">Nessun allenamento in questa data.</p>`;
    return h;
  }
  function history() {
    const all = DB.workouts.finished();
    if (!all.length) return A.empty("Nessun allenamento", "Quando concluderai un allenamento lo troverai qui, con tutte le serie.");
    return all.slice(0, st.shown).map(row).join("") + (all.length > st.shown ? `<button class="ar-btn ghost" data-act="dy-more">Mostra altri (${all.length - st.shown})</button>` : "");
  }
  function exHistoryHtml(exId) {
    const h = DB.history(exId);
    if (!h.length) return `<p class="ar-note">Nessuna sessione registrata per questo esercizio.</p>`;
    return h.map((s) => `<div class="ar-card hist"><div class="hist-top"><b>${fmt.dayShort(s.date)}</b><span>${fmt.vol(s.volume)}</span></div><p>${s.sets.map((x, i) => `<span class="sp">${i + 1}. ${A.num(x.weight)}×${x.reps}</span>`).join("")}</p><small>Peso massimo ${fmt.kg(s.topWeight)} · 1RM stimato ${fmt.kg(s.best1RM)}</small></div>`).join("");
  }
  A.exHistory = exHistoryHtml;
  function byExercise() {
    const ex = DB.trainedExercises();
    if (!ex.length) return A.empty("Nessuno storico", "Dopo il primo allenamento potrai vedere come va ogni esercizio.");
    if (!st.ex || !ex.some((e) => e.id === +st.ex)) st.ex = ex[0].id;
    return `<label class="ar-lbl">Esercizio<select class="ar-in" data-chg="dy-ex">${ex.map((e) => `<option value="${e.id}"${e.id === +st.ex ? " selected" : ""}>${esc(e.name)}</option>`).join("")}</select></label>${exHistoryHtml(+st.ex)}`;
  }
  A.screen("diary", () => {
    view.innerHTML = A.head("Diario", "Il tuo registro di allenamento") +
      `<div class="ar-seg" role="tablist">${[["cal", "Calendario"], ["list", "Storico"], ["ex", "Per esercizio"]].map(([k, n]) => `<button role="tab" aria-selected="${st.tab === k}" class="${st.tab === k ? "on" : ""}" data-act="dy-tab" data-t="${k}">${n}</button>`).join("")}</div>` +
      (st.tab === "cal" ? calendar() : st.tab === "list" ? history() : byExercise());
  });

  function openWorkout(id) {
    const w = DB.workouts.get(id); if (!w) return toast("Allenamento non trovato");
    A.modal(`<p class="ar-note">${fmt.dayLong(w.startedAt)} · ${fmt.time(w.startedAt)}${w.endedAt ? "–" + fmt.time(w.endedAt) : ""}${w.routineName ? " · routine «" + esc(w.routineName) + "»" : ""}</p>
      <div class="ar-sum"><div><b>${fmt.dur(w.duration)}</b><span>durata</span></div><div><b>${w.doneSets}</b><span>serie</span></div><div><b>${fmt.vol(w.volume)}</b><span>volume</span></div></div>
      ${w.notes ? `<p class="ar-quote-note">${esc(w.notes).replace(/\n/g, "<br>")}</p>` : ""}
      ${w.exercises.map((x) => `<section class="ar-card det"><b>${esc(x.exerciseName)}</b><table class="ar-tbl"><thead><tr><th>Serie</th><th>Peso</th><th>Rip.</th></tr></thead><tbody>${x.sets.map((s, i) => `<tr><td>${i + 1}</td><td>${fmt.kg(s.weight || 0)}</td><td>${s.reps}</td></tr>`).join("")}</tbody></table>${x.notes ? `<p class="ar-note">📝 ${esc(x.notes)}</p>` : ""}</section>`).join("")}
      <button class="ar-btn ghost danger" data-act="wk-delete" data-id="${w.id}">Elimina questo allenamento</button>`, { title: w.name, wide: true });
  }
  A.openWorkout = openWorkout;

  A.reg({
    "dy-tab": (el) => { st.tab = el.dataset.t; A.render(); },
    "dy-more": () => { st.shown += 20; A.render(); },
    "dy-ex": (el) => { st.ex = el.value; A.render(); },
    "cal-prev": () => { st.m--; if (st.m < 0) { st.m = 11; st.y--; } A.render(); },
    "cal-next": () => { st.m++; if (st.m > 11) { st.m = 0; st.y++; } A.render(); },
    "cal-day": (el) => { st.day = el.dataset.key; A.render(); },
    "wk-delete": (el) => { const w = DB.workouts.get(+el.dataset.id); if (confirm(`Eliminare definitivamente «${w.name}» del ${fmt.dayShort(w.startedAt)}?\nQuesta azione non si può annullare.`)) { DB.workouts.discard(w.id); A.close(); A.render(); toast("Allenamento eliminato"); } }
  });
})();
