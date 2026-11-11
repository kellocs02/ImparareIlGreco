// ARETE — allenamento: avvio, tabella delle serie, timer di recupero, pausa, termine, scelta esercizi.
(function () {
  const A = Arete, DB = A.DB, fmt = A.fmt, esc = A.esc;

  // ---------- Selettore esercizi (riusato da allenamento e routine) ----------
  let pick = { q: "", muscle: "", sel: new Set(), cb: null, title: "Aggiungi esercizi" };
  const pickRow = (e) => `<div class="ar-pickrow"><button class="ar-pick${pick.sel.has(e.id) ? " on" : ""}" data-act="pick-toggle" data-id="${e.id}"><span class="ck">${pick.sel.has(e.id) ? "✓" : ""}</span><span><b>${esc(e.name)}</b><small>${esc(fmt.muscle(e.primary))}${e.equipment ? " · " + esc(e.equipment) : ""}</small></span></button><button class="ar-star${e.fav ? " on" : ""}" data-act="fav-toggle" data-id="${e.id}" aria-label="${e.fav ? "Togli dai preferiti" : "Aggiungi ai preferiti"}: ${esc(e.name)}" aria-pressed="${!!e.fav}">${e.fav ? "★" : "☆"}</button></div>`;
  function pickList() {
    const fav = pick.muscle === "_fav", muscle = fav ? "" : pick.muscle, q = pick.q.trim();
    const l = DB.exercises.list({ q: pick.q, muscle, fav });
    const missing = `<p class="ar-note">${l.length ? "Non trovi quello che cerchi?" : "Nessun esercizio trovato."} <button class="ar-link" data-act="pick-new">Crea «${q ? esc(q) : "un nuovo esercizio"}»</button></p>`;
    if (!l.length) return (fav && !q ? `<p class="ar-note">Non hai ancora preferiti: tocca la stella accanto a un esercizio per aggiungerlo.</p>` : "") + missing;
    let h = "";
    if (!q && !muscle && !fav) { // vista iniziale: prima gli esercizi che usi di più
      const rec = DB.exercises.recent(5), fv = DB.exercises.list({ fav: true }).slice(0, 8);
      if (rec.length) h += `<h3 class="ar-h3">Recenti</h3>${rec.map(pickRow).join("")}`;
      if (fv.length) h += `<h3 class="ar-h3">Preferiti</h3>${fv.map(pickRow).join("")}`;
      if (h) h += `<h3 class="ar-h3">Tutti gli esercizi</h3>`;
    }
    const shown = l.slice(0, 80);
    return h + shown.map(pickRow).join("") + (l.length > shown.length ? `<p class="ar-note">Altri ${l.length - shown.length} esercizi: usa la ricerca o i gruppi muscolari.</p>` : "") + missing;
  }
  const pickCount = () => (pick.sel.size ? `Aggiungi (${pick.sel.size})` : "Seleziona gli esercizi");
  function pickExercise(cb, title) {
    pick = { q: "", muscle: "", sel: new Set(), cb: cb || ((ids) => { const a = DB.workouts.active(); if (a) ids.forEach((i) => DB.workouts.addExercise(a.id, i)); A.render(); }), title: title || "Aggiungi esercizi" };
    A.modal(`<input class="ar-in" id="pickQ" data-inp="pick-q" placeholder="Cerca un esercizio…" autocomplete="off" aria-label="Cerca">
      <button class="ar-btn ghost sm" data-act="pick-new" style="margin:8px 0 2px">+ Nuovo esercizio (non nell'elenco)</button>
      <div class="ar-chips scroll"><button class="ar-chip on" data-act="pick-m" data-m="">Tutti</button><button class="ar-chip" data-act="pick-m" data-m="_fav">★ Preferiti</button>${DB.MUSCLES.map((m) => `<button class="ar-chip" data-act="pick-m" data-m="${m}">${fmt.muscle(m)}</button>`).join("")}</div>
      <div id="pickList" class="ar-picklist">${pickList()}</div>
      <div class="ar-sticky"><button class="ar-btn" id="pickGo" data-act="pick-go" disabled>${pickCount()}</button></div>`, { title: pick.title, wide: true });
  }
  A.pickExercise = pickExercise;
  const refreshPick = () => { const l = $("#pickList"); if (l) l.innerHTML = pickList(); const b = $("#pickGo"); if (b) { b.textContent = pickCount(); b.disabled = !pick.sel.size; } };

  // ---------- Salvataggio automatico mentre si scrive ----------
  // Ogni modifica viene salvata dopo una breve pausa e, se l'app si chiude o va in background, subito.
  // Gli errori di un valore ancora incompleto (es. "-") vengono ignorati qui: li segnala il campo quando si esce.
  const pending = new Map();
  function later(el, fn) {
    clearTimeout(el._t); pending.set(el, fn);
    el._t = setTimeout(() => { pending.delete(el); try { fn(); } catch (e) {} }, 400);
  }
  function flush() { pending.forEach((fn, el) => { clearTimeout(el._t); try { fn(); } catch (e) {} }); pending.clear(); }
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });
  A.flush = flush;

  // ---------- Schermata ----------
  function prevText(sets) { return sets.map((s) => `${A.num(s.weight)}×${s.reps}`).join(" · "); }
  function exCard(x, w, idx, total) {
    const prev = DB.previous(x.exerciseId, w.id), ps = prev ? prev.sets : [];
    const plan = x.plan || {}, planTxt = [plan.sets ? `${plan.sets} serie` : "", plan.reps ? plan.reps + " rip." : "", plan.rest != null ? `rec. ${plan.rest} s` : ""].filter(Boolean).join(" · ");
    let wi = 0; // numero della serie di lavoro: le serie di riscaldamento (R) non sono numerate né confrontate con l'ultima volta
    const rows = x.sets.map((s, k) => {
      const warm = s.type === "warmup", num = warm ? "R" : String(++wi);
      const pv = warm ? null : ps[wi - 1] || null, fb = warm ? null : pv || ps[ps.length - 1] || null; // fb = ciò che ✓ userà se il campo è vuoto (e che il segnaposto mostra)
      return `<div class="ar-set${s.done ? " done" : ""}${warm ? " warm" : ""}" data-set="${s.id}">
        <button class="n ar-sn${warm ? " on" : ""}" data-act="set-type" data-id="${s.id}" aria-label="Serie ${k + 1}: ${warm ? "riscaldamento (tocca per renderla di lavoro)" : "di lavoro (tocca per segnarla come riscaldamento)"}" aria-pressed="${warm}">${num}</button>
        <span class="pv">${pv ? `${A.num(pv.weight)}×${pv.reps}` : "—"}</span>
        <input class="ar-in n" inputmode="decimal" autocomplete="off" aria-label="Kg serie ${num}" data-chg="set-w" data-inp="set-w-i" data-id="${s.id}" data-done="${s.done ? 1 : 0}" placeholder="${fb ? A.num(fb.weight) : "kg"}" value="${s.weight === null ? "" : A.num(s.weight)}">
        <input class="ar-in n" inputmode="numeric" autocomplete="off" aria-label="Ripetizioni serie ${num}" data-chg="set-r" data-inp="set-r-i" data-id="${s.id}" data-done="${s.done ? 1 : 0}" placeholder="${fb ? fb.reps : plan.reps || "rip"}" value="${s.reps === null ? "" : s.reps}">
        <button class="ar-ck${s.done ? " on" : ""}" data-act="set-done" data-id="${s.id}" data-we="${x.id}" aria-label="${s.done ? "Segna come non fatta" : "Completa serie"} ${num}" aria-pressed="${s.done}">✓</button>
        <button class="ar-rm" data-act="set-rm" data-id="${s.id}" aria-label="Elimina serie ${num}">✕</button></div>`;
    }).join("");
    return `<section class="ar-ex">
      <div class="ar-ex-head"><div><b>${esc(x.exerciseName)}</b><small>${esc(fmt.muscle(x.primary))}${planTxt ? " · " + planTxt : ""}</small></div><button class="ar-dots" data-act="ex-menu" data-we="${x.id}" aria-label="Opzioni esercizio">⋯</button></div>
      <p class="ar-prev">${prev ? `<b>Ultima volta</b> (${fmt.dayShort(prev.date)}): ${prevText(prev.sets)}` : "Prima volta con questo esercizio"}</p>
      <div class="ar-sethead"><span>Serie</span><span>Prec.</span><span>Kg</span><span>Rip.</span><span>✓</span><span></span></div>
      ${rows}
      <button class="ar-btn ghost sm" data-act="set-add" data-we="${x.id}">+ Aggiungi serie</button>
      <textarea class="ar-in note" rows="1" maxlength="500" placeholder="Note su questo esercizio…" data-chg="ex-note" data-inp="ex-note-i" data-we="${x.id}">${esc(x.notes || "")}</textarea></section>`;
  }
  function activeScreen(w) {
    const paused = w.status === "paused";
    let h = A.head("Allenamento");
    h += `<div class="ar-card wk-top"><input class="ar-title-in" data-chg="wk-rename" maxlength="60" value="${esc(w.name)}" aria-label="Nome dell'allenamento">
      <div class="ar-clock"><span data-elapsed>${fmt.clock(DB.workouts.elapsed(w))}</span>${paused ? '<em class="pill">In pausa</em>' : ""}</div>
      <p class="ar-note">Iniziato ${fmt.dayShort(w.startedAt)} alle ${fmt.time(w.startedAt)}${w.routineName ? " · da «" + esc(w.routineName) + "»" : ""}</p>
      <p class="ar-note small">Tocca il numero di una serie per segnarla come riscaldamento (R): non conta in volume, record e storico.</p>
      <div class="ar-btnrow"><button class="ar-btn ghost" data-act="wk-pause">${paused ? "▶ Riprendi" : "❚❚ Pausa"}</button><button class="ar-btn" data-act="wk-finish">Termina</button></div></div>`;
    if (w.rest) h += `<div class="ar-rest" role="timer"><div><small>Recupero</small><b data-rest></b></div><i class="bar"><b data-restbar></b></i><div class="r-btns"><button data-act="rest-adj" data-d="-15">−15</button><button data-act="rest-adj" data-d="15">+15</button><button data-act="rest-skip">Salta</button></div></div>`;
    h += w.exercises.length ? w.exercises.map((x, i) => exCard(x, w, i, w.exercises.length)).join("") : A.empty("Nessun esercizio", "Aggiungi gli esercizi che vuoi fare oggi.");
    h += `<button class="ar-btn big" data-act="ex-add">+ Aggiungi esercizio</button>
      <label class="ar-lbl">Note sull'allenamento<textarea class="ar-in" rows="3" maxlength="500" data-chg="wk-notes" data-inp="wk-notes-i" placeholder="Come ti sei sentito, sensazioni, dolori…">${esc(w.notes || "")}</textarea></label>
      <button class="ar-link danger" data-act="wk-discard">Scarta questo allenamento</button>`;
    return h;
  }
  function startScreen() {
    const rts = DB.routines.list(), today = new Date().getDay();
    let h = A.head("Allenamento", "Inizia una sessione");
    h += `<div class="ar-actions"><button class="ar-btn big" data-act="start-empty">Allenamento vuoto</button><button class="ar-btn ghost big" data-act="start-pick">Scegli gli esercizi…</button></div>`;
    h += `<h2 class="ar-h2">Da una routine</h2>`;
    h += rts.length ? rts.map((r) => `<div class="ar-card row"><div><b>${esc(r.name)}</b><small>${A.plural(r.items.length, "esercizio", "esercizi")}${(r.days || []).includes(today) ? " · in programma oggi" : ""}</small></div><button class="ar-btn sm" data-act="start-routine" data-id="${r.id}">Inizia</button></div>`).join("")
      : A.empty("Nessuna routine", "Crea una routine per ripartire ogni volta dagli stessi esercizi.", `<button class="ar-btn sm" data-act="goto" data-sec="routines">Crea una routine</button>`);
    return h;
  }
  A.screen("workout", () => { const w = DB.workouts.active(); view.innerHTML = w ? activeScreen(w) : startScreen(); });

  // ---------- Fine allenamento ----------
  const recMap = () => new Map(DB.records().map((r) => [r.exerciseId, r]));
  function finishWorkout(w) {
    const open = w.exercises.reduce((n, x) => n + x.sets.filter((s) => !s.done).length, 0);
    if (!w.doneSets) { toast("Completa almeno una serie di lavoro (il riscaldamento non basta), oppure scarta l'allenamento"); return; }
    if (!confirm(`Terminare l'allenamento?${open ? `\n${A.plural(open, "serie non completata non verrà salvata", "serie non completate non verranno salvate")}.` : ""}`)) return;
    const before = recMap(), f = DB.workouts.finish(w.id), after = recMap(), prs = [];
    f.exercises.forEach((x) => {
      const a = after.get(x.exerciseId), b = before.get(x.exerciseId); if (!a || !b) return; // al primo allenamento non è un "record"
      if (a.maxWeight && a.maxWeight.date === f.startedAt && a.maxWeight.weight > b.maxWeight.weight) prs.push(`${x.exerciseName}: ${fmt.kg(a.maxWeight.weight)} × ${a.maxWeight.reps}`);
      else if (a.best1RM && b.best1RM && a.best1RM.date === f.startedAt && a.best1RM.value > b.best1RM.value + 0.01) prs.push(`${x.exerciseName}: 1RM stimato ${fmt.kg(a.best1RM.value)}`);
    });
    A.show("workout"); // prima la schermata (che chiude le finestre), poi il riepilogo
    A.modal(`<div class="ar-sum"><div><b>${fmt.dur(f.duration)}</b><span>durata</span></div><div><b>${f.doneSets}</b><span>serie</span></div><div><b>${fmt.vol(f.volume)}</b><span>volume</span></div></div>
      ${prs.length ? `<h3 class="ar-h3">🏆 Nuovi record personali</h3><ul class="ar-list">${prs.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      <button class="ar-btn" data-act="sum-diary" data-id="${f.id}">Vedi nel diario</button><button class="ar-btn ghost" data-act="close-home">Chiudi</button>`, { title: "Allenamento salvato ✓" });
  }

  A.reg({
    "pick-q": (el) => { pick.q = el.value; refreshPick(); },
    "pick-m": (el) => { pick.muscle = el.dataset.m; document.querySelectorAll('[data-act="pick-m"]').forEach((b) => b.classList.toggle("on", b === el)); refreshPick(); },
    "pick-toggle": (el) => { const id = +el.dataset.id; pick.sel.has(id) ? pick.sel.delete(id) : pick.sel.add(id); refreshPick(); },
    "pick-go": () => { const ids = [...pick.sel], cb = pick.cb; A.close(); if (ids.length && cb) cb(ids); },
    "pick-new": () => { const q = pick.q; A.close(); if (A.exerciseForm) A.exerciseForm(null, { name: q, then: (id) => { pick.sel.add(id); const ids = [...pick.sel]; pick.cb && pick.cb(ids); } }); },
    "fav-toggle": (el) => { const on = DB.exercises.toggleFav(+el.dataset.id); const l = $("#pickList"), y = l ? l.closest(".ar-sheet-body") : null, top = y ? y.scrollTop : 0; if (l) { refreshPick(); if (y) y.scrollTop = top; } toast(on ? "Aggiunto ai preferiti ★" : "Tolto dai preferiti"); },
    "start-pick": () => A.startEmpty(true),
    "ex-add": () => pickExercise(),
    "set-w-i": (el) => later(el, () => DB.workouts.updateSet(+el.dataset.id, { weight: el.value })),
    "set-r-i": (el) => later(el, () => DB.workouts.updateSet(+el.dataset.id, { reps: el.value })),
    "wk-notes-i": (el) => later(el, () => { const w = DB.workouts.active(); if (w) DB.workouts.setNotes(w.id, el.value); }),
    "ex-note-i": (el) => later(el, () => DB.workouts.setExerciseNotes(+el.dataset.we, el.value)),
    "wk-rename": (el) => { const w = DB.workouts.active(); try { DB.workouts.rename(w.id, el.value); } catch (e) { el.value = w.name; throw e; } },
    "wk-notes": (el) => DB.workouts.setNotes(DB.workouts.active().id, el.value),
    "ex-note": (el) => DB.workouts.setExerciseNotes(+el.dataset.we, el.value),
    "wk-pause": () => { const w = DB.workouts.active(); w.status === "paused" ? DB.workouts.resume(w.id) : DB.workouts.pause(w.id); A.render(); },
    "wk-finish": () => finishWorkout(DB.workouts.active()),
    "wk-discard": () => { const w = DB.workouts.active(); if (confirm("Scartare l'allenamento? Tutto quello che hai inserito andrà perso.")) { DB.workouts.discard(w.id); A.show("workout"); toast("Allenamento scartato"); } },
    "set-type": (el) => { const w = DB.workouts.active(), s = w.exercises.flatMap((y) => y.sets).find((y) => y.id === +el.dataset.id); DB.workouts.setType(s.id, s.type === "warmup" ? "normal" : "warmup"); A.render(); },
    "set-add": (el) => { DB.workouts.addSet(+el.dataset.we); A.render(); },
    "set-rm": (el) => { DB.workouts.removeSet(+el.dataset.id); A.render(); },
    "set-w": (el) => { const s = DB.workouts.updateSet(+el.dataset.id, { weight: el.value }); if (el.dataset.done === "1" && !s.done) A.render(); },
    "set-r": (el) => { const s = DB.workouts.updateSet(+el.dataset.id, { reps: el.value }); if (el.dataset.done === "1" && !s.done) A.render(); },
    "set-done": (el) => {
      const w = DB.workouts.active(), id = +el.dataset.id, row = el.closest(".ar-set"), ins = row.querySelectorAll("input");
      DB.workouts.updateSet(id, { weight: ins[0].value, reps: ins[1].value }); // legge quello che c'è scritto, anche se il campo non ha ancora "confermato"
      const x = w.exercises.find((y) => y.id === +el.dataset.we), me = x.sets.find((s) => s.id === id), k = x.sets.filter((s) => s.type !== "warmup").findIndex((s) => s.id === id);
      const prev = DB.previous(x.exerciseId, w.id), ps = prev ? prev.sets : [], pv = me && me.type === "warmup" ? null : ps[k] || ps[ps.length - 1] || null;
      const prefill = { weight: pv ? pv.weight : null, reps: pv ? pv.reps : null }; // solo i valori dell'ultima sessione, gli stessi mostrati nei segnaposto
      if (w.status === "paused") DB.workouts.resume(w.id); // completare una serie riprende il cronometro
      DB.workouts.toggleSet(id, prefill); A.render();
    },
    "rest-adj": (el) => { const w = DB.workouts.active(); DB.workouts.adjustRest(w.id, +el.dataset.d); A.render(); },
    "rest-skip": () => { DB.workouts.skipRest(DB.workouts.active().id); A.render(); },
    "ex-menu": (el) => {
      const w = DB.workouts.active(), x = w.exercises.find((y) => y.id === +el.dataset.we), i = w.exercises.indexOf(x);
      A.modal(`<p class="ar-note">${esc(x.exerciseName)}</p>
        <div class="ar-btnrow"><button class="ar-btn ghost" data-act="ex-move" data-we="${x.id}" data-d="-1" ${i === 0 ? "disabled" : ""}>↑ Sposta su</button><button class="ar-btn ghost" data-act="ex-move" data-we="${x.id}" data-d="1" ${i === w.exercises.length - 1 ? "disabled" : ""}>↓ Sposta giù</button></div>
        <label class="ar-lbl">Recupero dopo ogni serie (secondi)<input class="ar-in" id="exRest" inputmode="numeric" value="${x.plan && x.plan.rest != null ? x.plan.rest : DB.settings.get().rest}"></label>
        <button class="ar-btn" data-act="ex-rest" data-we="${x.id}">Salva recupero</button>
        <button class="ar-btn ghost danger" data-act="ex-del" data-we="${x.id}">Rimuovi dall'allenamento</button>`, { title: "Esercizio" });
    },
    "ex-move": (el) => { DB.workouts.moveExercise(+el.dataset.we, +el.dataset.d); A.close(); A.render(); },
    "ex-rest": (el) => { DB.workouts.setExerciseRest(+el.dataset.we, $("#exRest").value); A.close(); toast("Recupero aggiornato ✓"); },
    "ex-del": (el) => { if (confirm("Rimuovere questo esercizio e le sue serie dall'allenamento?")) { DB.workouts.removeExercise(+el.dataset.we); A.close(); A.render(); } },
    "sum-diary": (el) => { A.close(); A.show("diary"); if (A.openWorkout) A.openWorkout(+el.dataset.id); },
    "close-home": () => { A.close(); A.show("home"); }
  });
})();
