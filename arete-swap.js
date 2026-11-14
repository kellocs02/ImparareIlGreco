// ARETE — consigliere dei cambi: "con cosa sostituisco questo esercizio?"
// Due parti: (1) motore di punteggio puro (testabile in Node, nessun accesso a DOM o database),
// (2) interfaccia: finestra con i motivi del cambio e la lista delle alternative, agganciata
// al menu dell'esercizio (allenamento) e all'editor delle routine. Tutto offline, nessun dato salvato.
(function (root) {
  // ---------- 1. Motore ----------
  // Parole che non dicono nulla sul movimento: attrezzi, preposizioni, lati.
  const STOP = new Set(["con", "alla", "alle", "al", "ai", "agli", "allo", "sul", "sulla", "sulle", "una", "uno", "gamba", "braccio", "presa", "larga", "stretta", "macchina", "cavi", "cavo", "manubri", "manubrio", "bilanciere", "kettlebell", "elastico", "elastici", "sbarra", "parallele", "multipower", "peso", "per", "del", "dei", "della", "piedi", "rialzati", "libero"]);
  const FREE = ["Corpo libero", "Elastici", "Manubri"];                  // facili da trovare ovunque
  const GUIDED = ["Macchina", "Cavi", "Corpo libero", "Elastici"];       // traiettoria guidata o senza carico pesante
  const REASONS = [["similar", "Simili"], ["busy", "Occupato"], ["noequip", "Non ho l'attrezzo"], ["variety", "Per variare"], ["pain", "Mi dà fastidio"]];

  const tokens = (name) => new Set(String(name || "").toLowerCase().replace(/\(.*?\)/g, " ").split(/[^a-zàèéìòù0-9]+/).filter((t) => t.length > 2 && !STOP.has(t)));
  const overlap = (a, b) => { let n = 0; a.forEach((t) => { if (b.has(t)) n++; }); return n; };
  const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); if (!A.size && !B.size) return 1; let i = 0; A.forEach((x) => { if (B.has(x)) i++; }); return i / (A.size + B.size - i); };
  const compound = (e) => (e.secondary || []).length >= 2;               // euristica: più muscoli coinvolti = multiarticolare
  const low = (s) => String(s || "").toLowerCase();

  function score(src, c, reason, ctx) {
    const sameEq = c.equipment === src.equipment, shared = overlap(tokens(src.name), tokens(c.name)), sec = jaccard(src.secondary || [], c.secondary || []);
    let s = sec * 3, via = c.primary !== src.primary ? -3 : 0;           // il muscolo principale deve coincidere; altrimenti è solo un ripiego
    s += via;
    s += (reason === "variety" ? 0.5 : reason === "pain" ? -1.5 : 2) * Math.min(shared, 2);
    if (compound(src) === compound(c)) s += 1.5;
    if (reason === "similar") s += sameEq ? 1 : 0;
    else if (reason === "busy") s += sameEq ? -5 : 2;
    else if (reason === "noequip") s += (sameEq ? -5 : 2) + (FREE.includes(c.equipment) ? 1.5 : 0);
    else if (reason === "variety") s += (sameEq ? -1 : 1.5) + (ctx.recent.has(c.id) ? -1 : 0.5);
    else if (reason === "pain") s += (GUIDED.includes(c.equipment) ? 1.5 : 0) + ((c.secondary || []).length < (src.secondary || []).length ? 1 : 0);
    if (c.fav) s += 1;
    if (reason !== "variety" && ctx.recent.has(c.id)) s += 0.5;
    const why = [];
    if (c.primary !== src.primary) why.push("lavora il muscolo solo in secondo piano");
    else if (shared > 0) why.push("stesso movimento in variante");
    else if (sec >= 0.5) why.push("muscoli secondari simili");
    else why.push("stesso muscolo principale");
    why.push(sameEq ? "stesso attrezzo (" + low(c.equipment) + ")" : (low(c.equipment) || "senza attrezzo") + " al posto di " + (low(src.equipment) || "nessun attrezzo"));
    if (c.fav) why.push("★ preferito");
    else if (ctx.recent.has(c.id)) why.push("già fatto di recente");
    return { exercise: c, score: Math.round(s * 100) / 100, why: why.join(" · ") };
  }

  // src e all: oggetti esercizio ({id, name, primary, secondary[], equipment, fav?}); ctx.recent: Set di id
  function suggest(src, all, { reason = "similar", recent = new Set() } = {}) {
    const cands = all.filter((e) => e.id !== src.id && !e.archived && e.primary === src.primary);
    if (cands.length < 3) all.forEach((e) => { if (e.id !== src.id && !e.archived && e.primary !== src.primary && (e.secondary || []).includes(src.primary)) cands.push(e); });
    return cands.map((c) => score(src, c, reason, { recent })).sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name, "it"));
  }
  root.AreteSwap = { suggest, tokens, REASONS };

  // ---------- 2. Interfaccia ----------
  if (typeof window === "undefined" || !window.Arete) return;
  const A = window.Arete, DB = A.DB, esc = A.esc;
  let ctx = null;

  function lastLoad(id) {
    const p = DB.previous(id, ctx.excludeWorkoutId || null);
    return p && p.sets.length ? `Ultima volta (${A.fmt.dayShort(p.date)}): ${p.sets.slice(0, 4).map((s) => A.num(s.weight) + "×" + s.reps).join(" · ")}` : "";
  }
  function listHtml() {
    const src = DB.exercises.get(ctx.exerciseId), recent = new Set(DB.exercises.recent(30).map((e) => e.id));
    const res = suggest(src, DB.exercises.list(), { reason: ctx.reason, recent }), shown = res.slice(0, ctx.more ? 12 : 5);
    let h = ctx.reason === "pain" ? `<p class="ar-note small">Sono alternative più semplici sulla carta, non un consiglio medico: se il fastidio resta, senti un medico o un fisioterapista.</p>` : "";
    h += shown.length ? shown.map((r) => { const e = r.exercise, ll = lastLoad(e.id);
      return `<div class="sw-row"><div class="sw-t"><b>${esc(e.name)}</b><small>${esc(r.why)}</small>${ll ? `<small class="sw-prev">${esc(ll)}</small>` : ""}</div><button class="ar-btn sm" data-act="swap-pick" data-id="${e.id}" aria-label="Scegli ${esc(e.name)}">Scegli</button></div>`; }).join("")
      : `<p class="ar-note">Nessuna alternativa trovata per questo muscolo.</p>`;
    if (!ctx.more && res.length > shown.length) h += `<button class="ar-link" data-act="swap-more">Mostra altre alternative</button>`;
    return h + `<button class="ar-btn ghost sm" data-act="swap-all" style="margin-top:10px">Cerca in tutto l'elenco…</button>`;
  }
  function open(o) {
    const src = DB.exercises.get(o.exerciseId); if (!src) return;
    ctx = { exerciseId: o.exerciseId, excludeWorkoutId: o.excludeWorkoutId || null, onPick: o.onPick, reason: "similar", more: false };
    A.modal(`<p class="ar-note"><b>${esc(src.name)}</b> · ${esc(A.fmt.muscle(src.primary))}${src.equipment ? " · " + esc(src.equipment) : ""}</p>
      <p class="ar-lbl">Perché lo cambi?</p>
      <div class="ar-chips scroll">${REASONS.map(([k, n]) => `<button class="ar-chip${k === ctx.reason ? " on" : ""}" data-act="swap-r" data-r="${k}">${n}</button>`).join("")}</div>
      <div id="swList">${listHtml()}</div>`, { title: "Cambia esercizio", wide: true });
  }
  const refresh = () => { const l = $("#swList"); if (l) l.innerHTML = listHtml(); };

  function swapInWorkout(wid, weId, newId) {
    const w = DB.workouts.active(); if (!w || w.id !== wid) return;
    const x = w.exercises.find((y) => y.id === weId); if (!x || x.exerciseId === newId) return;
    const doneN = x.sets.filter((s) => s.done).length;
    if (doneN && !confirm(`«${x.exerciseName}» ha ${doneN} ${doneN === 1 ? "serie completata" : "serie completate"}: cambiando esercizio andranno perse.\nContinuare?`)) return;
    const idx = w.exercises.indexOf(x), wanted = Math.max(1, x.sets.length), plan = x.plan || {};
    const nx = DB.workouts.addExercise(w.id, newId);
    if (plan.reps != null) nx.plan.reps = plan.reps;                                 // salvato dalla setExerciseRest qui sotto
    DB.workouts.removeExercise(weId);
    let cur = DB.workouts.active().exercises.findIndex((y) => y.id === nx.id);       // rimette il nuovo esercizio al posto del vecchio
    for (; cur > idx; cur--) DB.workouts.moveExercise(nx.id, -1);
    let ns = DB.workouts.active().exercises.find((y) => y.id === nx.id).sets;        // stesso numero di serie
    for (let k = ns.length; k < wanted; k++) DB.workouts.addSet(nx.id);
    for (let k = ns.length - 1; k >= wanted; k--) DB.workouts.removeSet(ns[k].id);
    DB.workouts.setExerciseRest(nx.id, plan.rest != null ? plan.rest : DB.settings.get().rest);
    A.render(); toast("Esercizio cambiato ✓");
  }

  A.swap = { open, swapInWorkout };
  A.reg({
    "ex-swap": (el) => { const w = DB.workouts.active(), weId = +el.dataset.we, x = w && w.exercises.find((y) => y.id === weId); if (!x) return;
      open({ exerciseId: x.exerciseId, excludeWorkoutId: w.id, onPick: (id) => swapInWorkout(w.id, weId, id) }); },
    "swap-r": (el) => { ctx.reason = el.dataset.r; ctx.more = false; document.querySelectorAll('[data-act="swap-r"]').forEach((b) => b.classList.toggle("on", b === el)); refresh(); },
    "swap-more": () => { ctx.more = true; refresh(); },
    "swap-pick": (el) => { const cb = ctx.onPick, id = +el.dataset.id; A.close(); if (cb) cb(id); },
    "swap-all": () => { const cb = ctx.onPick; A.close(); A.pickExercise((ids) => { if (ids.length && cb) cb(ids[0]); }, "Scegli l'esercizio sostitutivo"); }
  });
})(typeof window !== "undefined" ? window : globalThis);
