// ARETE — database del modulo fitness.
// Stessa tecnologia del resto dell'app (localStorage, tutto sul telefono), ma in una chiave separata
// ("arete-db-v1") e con tabelle normalizzate come in un database relazionale:
//
//   exercises         catalogo esercizi (predefiniti + personalizzati)
//   routines          schede di allenamento (modelli)
//   routineExercises  esercizi di una routine, con serie/ripetizioni/recupero PREVISTI
//   workouts          allenamenti realmente eseguiti (anche in corso o interrotti)
//   workoutExercises  esercizi di un allenamento (con nome copiato: lo storico non dipende dal catalogo)
//   sets              singole serie realmente eseguite (kg, ripetizioni, completata)
//
// Una routine è solo un modello: l'allenamento ne copia i nomi e i valori previsti ma da quel momento
// è indipendente. Modificare o cancellare una routine non tocca mai gli allenamenti passati.
(function (root) {
  const KEY = "arete-db-v1";
  const TABLES = ["exercises", "routines", "routineExercises", "workouts", "workoutExercises", "sets"];
  const MUSCLES = ["chest", "back", "shoulders", "biceps", "triceps", "quads", "hamstrings", "glutes", "calves", "abs"];
  const BODYWEIGHT = ["Corpo libero", "Sbarra", "Parallele", "Ruota"];
  const LIM = { name: 60, desc: 300, notes: 500, instr: 800, maxKg: 1000, maxReps: 999, maxSets: 30, maxRest: 900 };

  const empty = () => ({ v: 1, seq: 1, settings: { name: "", rest: 90 }, activeWorkoutId: null, exercises: [], routines: [], routineExercises: [], workouts: [], workoutExercises: [], sets: [] });
  let db, lastError = null, loadNotice = null;
  const listeners = [];

  function normalize(d) {
    const out = Object.assign(empty(), d && typeof d === "object" ? d : {});
    TABLES.forEach((t) => { if (!Array.isArray(out[t])) out[t] = []; });
    out.settings = Object.assign({ name: "", rest: 90 }, out.settings || {});
    const maxId = Math.max(0, ...TABLES.flatMap((t) => out[t].map((r) => +r.id || 0)));
    if (!(out.seq > maxId)) out.seq = maxId + 1;
    return out;
  }
  function load() {
    let raw = null;
    try { raw = root.localStorage.getItem(KEY); } catch (e) {}
    if (!raw) return empty();
    try { return normalize(JSON.parse(raw)); }
    catch (e) {
      loadNotice = "I dati di ARETE non erano leggibili: ne ho conservato una copia a parte e ho ripartito da zero.";
      try { root.localStorage.setItem(KEY + "-corrotto", raw); } catch (e2) {}
      return empty();
    }
  }
  function save() {
    try { root.localStorage.setItem(KEY, JSON.stringify(db)); lastError = null; return true; }
    catch (e) { lastError = "Impossibile salvare: spazio del telefono esaurito o archivio bloccato."; listeners.forEach((f) => f("error", lastError)); return false; }
  }
  const id = () => db.seq++;
  const now = () => Date.now();

  // ---------- Validazione ----------
  class VErr extends Error {}
  const fail = (m) => { throw new VErr(m); };
  const clean = (s, max, what, required) => {
    const t = String(s == null ? "" : s).replace(/\s+/g, " ").trim();
    if (required && !t) fail(`${what}: obbligatorio`);
    if (t.length > max) fail(`${what}: massimo ${max} caratteri`);
    return t;
  };
  const cleanText = (s, max, what) => { // testo libero con a capo
    const t = String(s == null ? "" : s).replace(/\r/g, "").trim();
    if (t.length > max) fail(`${what}: massimo ${max} caratteri`);
    return t;
  };
  function parseNum(v) { // accetta "82,5"; vuoto -> null
    if (v === null || v === undefined) return null;
    const t = String(v).trim().replace(",", ".");
    if (t === "") return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : NaN;
  }
  function weightOf(v) {
    const n = parseNum(v);
    if (n === null) return null;
    if (Number.isNaN(n) || n < 0 || n > LIM.maxKg) fail(`Peso non valido (0–${LIM.maxKg} kg)`);
    return Math.round(n * 100) / 100;
  }
  function repsOf(v) {
    const n = parseNum(v);
    if (n === null) return null;
    if (Number.isNaN(n) || n < 0 || n > LIM.maxReps || !Number.isInteger(n)) fail(`Ripetizioni non valide (numero intero 0–${LIM.maxReps})`);
    return n;
  }
  const restOf = (v, dflt) => {
    const n = parseNum(v);
    if (n === null) return dflt;
    if (Number.isNaN(n) || n < 0 || n > LIM.maxRest || !Number.isInteger(n)) fail(`Recupero non valido (secondi, 0–${LIM.maxRest})`);
    return n;
  };
  const repTargetOf = (v) => {
    const t = String(v == null ? "" : v).trim().replace(/\s/g, "");
    if (t === "") return "";
    if (!/^\d{1,3}(-\d{1,3})?$/.test(t)) fail("Ripetizioni previste: un numero (8) o un intervallo (8-12)");
    return t;
  };
  const setsCountOf = (v) => {
    const n = parseNum(v);
    if (n === null) return 3;
    if (Number.isNaN(n) || !Number.isInteger(n) || n < 1 || n > LIM.maxSets) fail(`Serie previste: da 1 a ${LIM.maxSets}`);
    return n;
  };

  // ---------- Date ----------
  const pad = (n) => String(n).padStart(2, "0");
  const dateKey = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const byId = (t, i) => db[t].find((r) => r.id === i);

  // ---------- Esercizi ----------
  function seedExercises(list) { // aggiunge gli esercizi predefiniti mancanti (riconosciuti dalla "key")
    const have = new Set(db.exercises.filter((e) => e.key).map((e) => e.key));
    let n = 0;
    (list || []).forEach((e) => {
      if (have.has(e.key)) return;
      db.exercises.push({ id: id(), key: e.key, name: e.name, primary: e.primary, secondary: e.secondary || [], equipment: e.equipment || "", instructions: e.instructions || "", custom: false, archived: false, created: 0 });
      n++;
    });
    if (n) save();
    return n;
  }
  const exUsed = (exId) => db.routineExercises.some((r) => r.exerciseId === exId) || db.workoutExercises.some((w) => w.exerciseId === exId);
  function exerciseInput(o, selfId) {
    const name = clean(o.name, LIM.name, "Nome", true);
    if (db.exercises.some((e) => !e.archived && e.id !== selfId && e.name.toLowerCase() === name.toLowerCase())) fail("Esiste già un esercizio con questo nome");
    if (!MUSCLES.includes(o.primary)) fail("Scegli il gruppo muscolare principale");
    const secondary = (o.secondary || []).filter((m) => MUSCLES.includes(m) && m !== o.primary);
    return { name, primary: o.primary, secondary: [...new Set(secondary)], equipment: clean(o.equipment, 40, "Attrezzo"), instructions: cleanText(o.instructions, LIM.instr, "Istruzioni") };
  }
  const exercises = {
    list: ({ q = "", muscle = "" } = {}) => {
      const s = q.trim().toLowerCase();
      return db.exercises.filter((e) => !e.archived && (!muscle || e.primary === muscle) && (!s || e.name.toLowerCase().includes(s)))
        .sort((a, b) => a.name.localeCompare(b.name, "it"));
    },
    get: (i) => byId("exercises", i) || null,
    add(o) { const e = Object.assign({ id: id(), key: null, custom: true, archived: false, created: now() }, exerciseInput(o)); db.exercises.push(e); save(); return e; },
    update(i, o) {
      const e = byId("exercises", i); if (!e) fail("Esercizio non trovato");
      if (!e.custom) fail("Gli esercizi predefiniti non si possono modificare: puoi crearne una copia personalizzata");
      Object.assign(e, exerciseInput(o, i)); save(); return e;
    },
    remove(i) { // personalizzati soltanto; se usato nello storico viene solo nascosto
      const e = byId("exercises", i); if (!e) return "none";
      if (!e.custom) fail("Gli esercizi predefiniti non si possono eliminare");
      if (exUsed(i)) { e.archived = true; db.routineExercises = db.routineExercises.filter((r) => r.exerciseId !== i); save(); return "archived"; }
      db.exercises = db.exercises.filter((x) => x.id !== i); save(); return "deleted";
    }
  };

  // ---------- Routine ----------
  function routineItems(rid) {
    return db.routineExercises.filter((r) => r.routineId === rid).sort((a, b) => a.position - b.position)
      .map((r) => Object.assign({}, r, { exercise: byId("exercises", r.exerciseId) || null }));
  }
  function routineInput(o) {
    const name = clean(o.name, LIM.name, "Nome", true);
    const items = (o.items || []).map((it, k) => {
      if (!byId("exercises", it.exerciseId)) fail(`Esercizio ${k + 1} non valido`);
      return { exerciseId: it.exerciseId, sets: setsCountOf(it.sets), reps: repTargetOf(it.reps), rest: restOf(it.rest, db.settings.rest), notes: cleanText(it.notes, LIM.notes, "Note") };
    });
    if (!items.length) fail("Aggiungi almeno un esercizio alla routine");
    const days = [...new Set((o.days || []).map(Number).filter((d) => d >= 0 && d <= 6))].sort();
    return { name, description: clean(o.description, LIM.desc, "Descrizione"), days, items };
  }
  function writeItems(rid, items) {
    db.routineExercises = db.routineExercises.filter((r) => r.routineId !== rid);
    items.forEach((it, k) => db.routineExercises.push(Object.assign({ id: id(), routineId: rid, position: k }, it)));
  }
  const routines = {
    list: () => db.routines.slice().sort((a, b) => a.name.localeCompare(b.name, "it")).map((r) => Object.assign({}, r, { items: routineItems(r.id) })),
    get: (i) => { const r = byId("routines", i); return r ? Object.assign({}, r, { items: routineItems(i) }) : null; },
    scheduledFor: (weekday) => routines.list().filter((r) => (r.days || []).includes(weekday)),
    create(o) {
      const v = routineInput(o), r = { id: id(), name: v.name, description: v.description, days: v.days, created: now(), updated: now() };
      db.routines.push(r); writeItems(r.id, v.items); save(); return r;
    },
    update(i, o) {
      const r = byId("routines", i); if (!r) fail("Routine non trovata");
      const v = routineInput(o); Object.assign(r, { name: v.name, description: v.description, days: v.days, updated: now() });
      writeItems(i, v.items); save(); return r;
    },
    duplicate(i) {
      const src = routines.get(i); if (!src) fail("Routine non trovata");
      let name = `${src.name} (copia)`.slice(0, LIM.name);
      const r = { id: id(), name, description: src.description, days: [], created: now(), updated: now() };
      db.routines.push(r);
      writeItems(r.id, src.items.map((it) => ({ exerciseId: it.exerciseId, sets: it.sets, reps: it.reps, rest: it.rest, notes: it.notes })));
      save(); return r;
    },
    remove(i) { // cancella solo il modello: gli allenamenti già eseguiti restano com'erano
      db.routines = db.routines.filter((r) => r.id !== i); db.routineExercises = db.routineExercises.filter((r) => r.routineId !== i); save();
    }
  };

  // ---------- Allenamenti ----------
  const activeId = () => db.activeWorkoutId;
  function wxList(wid) { return db.workoutExercises.filter((x) => x.workoutId === wid).sort((a, b) => a.position - b.position); }
  function setsOf(weId) { return db.sets.filter((s) => s.workoutExerciseId === weId).sort((a, b) => a.idx - b.idx); }
  function elapsedMs(w, t = now()) {
    const end = w.endedAt || w.pausedAt || t;
    return Math.max(0, end - w.startedAt - (w.pausedMs || 0));
  }
  function detail(wid) {
    const w = byId("workouts", wid); if (!w) return null;
    const exs = wxList(wid).map((x) => Object.assign({}, x, { sets: setsOf(x.id) }));
    const done = exs.flatMap((x) => x.sets.filter((s) => s.done));
    const volume = done.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0);
    return Object.assign({}, w, { exercises: exs, duration: elapsedMs(w), volume, doneSets: done.length });
  }
  function newSetRow(weId, idx) { const s = { id: id(), workoutExerciseId: weId, idx, weight: null, reps: null, done: false, doneAt: null }; db.sets.push(s); return s; }
  function addWx(wid, exerciseId, plan) {
    const ex = byId("exercises", exerciseId); if (!ex) fail("Esercizio non trovato");
    const pos = wxList(wid).length;
    const x = { id: id(), workoutId: wid, exerciseId, exerciseName: ex.name, primary: ex.primary, position: pos, notes: plan && plan.notes || "", plan: plan ? { sets: plan.sets, reps: plan.reps, rest: plan.rest } : { sets: 3, reps: "", rest: db.settings.rest } };
    db.workoutExercises.push(x);
    for (let k = 0; k < x.plan.sets; k++) newSetRow(x.id, k);
    return x;
  }
  const workouts = {
    active: () => (db.activeWorkoutId ? detail(db.activeWorkoutId) : null),
    start({ routineId = null, name = "" } = {}) {
      if (db.activeWorkoutId && byId("workouts", db.activeWorkoutId)) fail("C'è già un allenamento in corso");
      let r = null;
      if (routineId != null) { r = routines.get(routineId); if (!r) fail("Routine non trovata"); }
      const t = now();
      const w = { id: id(), name: clean(name, LIM.name, "Nome") || (r ? r.name : "Allenamento"), routineId: r ? r.id : null, routineName: r ? r.name : "", startedAt: t, endedAt: null, pausedAt: null, pausedMs: 0, status: "active", notes: "", rest: null, updated: t };
      db.workouts.push(w); db.activeWorkoutId = w.id;
      if (r) r.items.forEach((it) => addWx(w.id, it.exerciseId, { sets: it.sets, reps: it.reps, rest: it.rest, notes: it.notes }));
      save(); return detail(w.id);
    },
    get: detail,
    touch(w) { w.updated = now(); save(); },
    rename(wid, name) { const w = byId("workouts", wid); w.name = clean(name, LIM.name, "Nome", true); workouts.touch(w); },
    setNotes(wid, notes) { const w = byId("workouts", wid); w.notes = cleanText(notes, LIM.notes, "Note"); workouts.touch(w); },
    pause(wid) { const w = byId("workouts", wid); if (w.status !== "active") return; w.status = "paused"; w.pausedAt = now(); w.rest = null; workouts.touch(w); },
    resume(wid) { const w = byId("workouts", wid); if (w.status !== "paused") return; w.pausedMs = (w.pausedMs || 0) + (now() - w.pausedAt); w.pausedAt = null; w.status = "active"; workouts.touch(w); },
    addExercise(wid, exerciseId) { const x = addWx(wid, exerciseId); workouts.touch(byId("workouts", wid)); return x; },
    removeExercise(weId) {
      const x = byId("workoutExercises", weId); if (!x) return;
      db.sets = db.sets.filter((s) => s.workoutExerciseId !== weId);
      db.workoutExercises = db.workoutExercises.filter((y) => y.id !== weId);
      wxList(x.workoutId).forEach((y, k) => (y.position = k));
      workouts.touch(byId("workouts", x.workoutId));
    },
    moveExercise(weId, dir) {
      const x = byId("workoutExercises", weId), l = wxList(x.workoutId), i = l.indexOf(x), j = i + dir;
      if (j < 0 || j >= l.length) return;
      [l[i].position, l[j].position] = [l[j].position, l[i].position];
      workouts.touch(byId("workouts", x.workoutId));
    },
    setExerciseNotes(weId, notes) { const x = byId("workoutExercises", weId); x.notes = cleanText(notes, LIM.notes, "Note"); workouts.touch(byId("workouts", x.workoutId)); },
    addSet(weId) { const x = byId("workoutExercises", weId), n = setsOf(weId).length; if (n >= LIM.maxSets) fail(`Massimo ${LIM.maxSets} serie`); const s = newSetRow(weId, n); workouts.touch(byId("workouts", x.workoutId)); return s; },
    removeSet(setId) {
      const s = byId("sets", setId); if (!s) return;
      const x = byId("workoutExercises", s.workoutExerciseId);
      db.sets = db.sets.filter((y) => y.id !== setId);
      setsOf(x.id).forEach((y, k) => (y.idx = k));
      workouts.touch(byId("workouts", x.workoutId));
    },
    updateSet(setId, { weight, reps }) { // chi chiama deve intercettare VErr
      const s = byId("sets", setId); if (!s) fail("Serie non trovata");
      if (weight !== undefined) s.weight = weightOf(weight);
      if (reps !== undefined) s.reps = repsOf(reps);
      if (s.done && (s.reps === null || s.reps === 0)) s.done = false;
      workouts.touch(byId("workouts", byId("workoutExercises", s.workoutExerciseId).workoutId));
      return s;
    },
    // Segna/toglie una serie. Se mancano i valori usa quelli dell'ultima volta (o della serie precedente).
    toggleSet(setId, prefill) {
      const s = byId("sets", setId); if (!s) fail("Serie non trovata");
      const x = byId("workoutExercises", s.workoutExerciseId), w = byId("workouts", x.workoutId);
      if (s.done) { s.done = false; s.doneAt = null; w.rest = null; workouts.touch(w); return { done: false }; }
      if (s.weight === null && prefill && prefill.weight != null) s.weight = prefill.weight;
      if (s.reps === null && prefill && prefill.reps != null) s.reps = prefill.reps;
      if (!s.reps) fail("Inserisci le ripetizioni (o completa la serie dopo averle scritte)");
      if (s.weight === null) { // vuoto = valido solo a corpo libero; con un attrezzo il peso va scritto (anche 0)
        const ex = byId("exercises", x.exerciseId);
        if (ex && BODYWEIGHT.includes(ex.equipment)) s.weight = 0; else fail("Inserisci il peso (scrivi 0 se non usi sovraccarico)");
      }
      s.done = true; s.doneAt = now();
      const rest = x.plan && x.plan.rest != null ? x.plan.rest : db.settings.rest;
      w.rest = rest > 0 ? { endsAt: now() + rest * 1000, total: rest, workoutExerciseId: x.id } : null;
      workouts.touch(w); return { done: true, rest };
    },
    adjustRest(wid, delta) { const w = byId("workouts", wid); if (!w.rest) return; w.rest.endsAt = Math.max(now(), w.rest.endsAt + delta * 1000); w.rest.total = Math.max(w.rest.total, Math.ceil((w.rest.endsAt - now()) / 1000)); workouts.touch(w); },
    skipRest(wid) { const w = byId("workouts", wid); w.rest = null; workouts.touch(w); },
    setExerciseRest(weId, sec) { const x = byId("workoutExercises", weId); x.plan = Object.assign({}, x.plan, { rest: restOf(sec, db.settings.rest) }); save(); },
    // Termina: tiene solo le serie completate (quelle realmente eseguite) e gli esercizi che ne hanno almeno una.
    finish(wid) {
      const w = byId("workouts", wid); if (!w) fail("Allenamento non trovato");
      if (w.status === "finished") fail("Allenamento già concluso");
      const exs = wxList(wid);
      const doneSets = exs.flatMap((x) => setsOf(x.id).filter((s) => s.done));
      if (!doneSets.length) fail("Nessuna serie completata: completa almeno una serie oppure scarta l'allenamento");
      exs.forEach((x) => {
        const mine = setsOf(x.id);
        if (!mine.some((s) => s.done)) { db.sets = db.sets.filter((s) => s.workoutExerciseId !== x.id); db.workoutExercises = db.workoutExercises.filter((y) => y.id !== x.id); return; }
        db.sets = db.sets.filter((s) => s.workoutExerciseId !== x.id || s.done);
        setsOf(x.id).forEach((s, k) => (s.idx = k));
      });
      wxList(wid).forEach((x, k) => (x.position = k));
      const t = now();
      if (w.status === "paused") { w.pausedMs = (w.pausedMs || 0) + (t - w.pausedAt); w.pausedAt = null; }
      w.status = "finished"; w.endedAt = t; w.rest = null; w.updated = t;
      db.activeWorkoutId = null; save(); return detail(wid);
    },
    discard(wid) { // elimina del tutto (allenamento in corso o già salvato)
      const exs = wxList(wid).map((x) => x.id);
      db.sets = db.sets.filter((s) => !exs.includes(s.workoutExerciseId));
      db.workoutExercises = db.workoutExercises.filter((x) => x.workoutId !== wid);
      db.workouts = db.workouts.filter((w) => w.id !== wid);
      if (db.activeWorkoutId === wid) db.activeWorkoutId = null;
      save();
    },
    finished: () => db.workouts.filter((w) => w.status === "finished").sort((a, b) => b.startedAt - a.startedAt).map((w) => detail(w.id)),
    elapsed: (w) => elapsedMs(w)
  };

  // ---------- Storico e statistiche (calcolate solo dai dati salvati) ----------
  const est1RM = (w, r) => (r > 0 && w > 0 ? (r === 1 ? w : w * (1 + r / 30)) : 0); // formula di Epley
  function history(exerciseId, { excludeWorkoutId = null } = {}) { // sessioni concluse, dalla più recente
    const out = [];
    workouts.finished().forEach((w) => {
      if (w.id === excludeWorkoutId) return;
      w.exercises.filter((x) => x.exerciseId === exerciseId).forEach((x) => {
        const sets = x.sets.filter((s) => s.done);
        if (!sets.length) return;
        out.push({ workoutId: w.id, date: w.startedAt, name: w.name, sets: sets.map((s) => ({ weight: s.weight || 0, reps: s.reps || 0 })),
          topWeight: Math.max(...sets.map((s) => s.weight || 0)), volume: sets.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0),
          best1RM: Math.max(...sets.map((s) => est1RM(s.weight || 0, s.reps || 0))) });
      });
    });
    return out;
  }
  const previous = (exerciseId, excludeWorkoutId) => history(exerciseId, { excludeWorkoutId })[0] || null;
  function records() { // per ogni esercizio: peso massimo, 1RM stimato migliore, volume migliore in una sessione
    const map = new Map();
    workouts.finished().forEach((w) => w.exercises.forEach((x) => {
      const key = x.exerciseId;
      const rec = map.get(key) || { exerciseId: key, name: x.exerciseName, maxWeight: null, best1RM: null, bestVolume: null, sessions: 0 };
      let vol = 0, any = false;
      x.sets.filter((s) => s.done).forEach((s) => {
        any = true; const wt = s.weight || 0, rp = s.reps || 0; vol += wt * rp;
        if (!rec.maxWeight || wt > rec.maxWeight.weight || (wt === rec.maxWeight.weight && rp > rec.maxWeight.reps)) rec.maxWeight = { weight: wt, reps: rp, date: w.startedAt };
        const e = est1RM(wt, rp); if (e && (!rec.best1RM || e > rec.best1RM.value)) rec.best1RM = { value: e, weight: wt, reps: rp, date: w.startedAt };
      });
      if (any) { rec.sessions++; if (!rec.bestVolume || vol > rec.bestVolume.value) rec.bestVolume = { value: vol, date: w.startedAt }; map.set(key, rec); }
    }));
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "it"));
  }
  function totals() {
    const f = workouts.finished();
    return { count: f.length, ms: f.reduce((a, w) => a + w.duration, 0), volume: f.reduce((a, w) => a + w.volume, 0), sets: f.reduce((a, w) => a + w.doneSets, 0), first: f.length ? f[f.length - 1].startedAt : null };
  }
  function byDay() { const m = {}; workouts.finished().forEach((w) => (m[dateKey(w.startedAt)] = m[dateKey(w.startedAt)] || []).push(w)); return m; }
  const monday = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
  function weekly(nWeeks) { // ultime N settimane (lun–dom): allenamenti, minuti, volume
    const start = monday(now()), out = [];
    for (let k = nWeeks - 1; k >= 0; k--) { const d = new Date(start); d.setDate(d.getDate() - 7 * k); out.push({ start: d.getTime(), count: 0, ms: 0, volume: 0 }); }
    workouts.finished().forEach((w) => { const m = monday(w.startedAt), b = out.find((o) => o.start === m); if (b) { b.count++; b.ms += w.duration; b.volume += w.volume; } });
    return out;
  }
  function monthly(nMonths) {
    const d0 = new Date(); const out = [];
    for (let k = nMonths - 1; k >= 0; k--) { const d = new Date(d0.getFullYear(), d0.getMonth() - k, 1); out.push({ y: d.getFullYear(), m: d.getMonth(), count: 0, ms: 0, volume: 0 }); }
    workouts.finished().forEach((w) => { const d = new Date(w.startedAt), b = out.find((o) => o.y === d.getFullYear() && o.m === d.getMonth()); if (b) { b.count++; b.ms += w.duration; b.volume += w.volume; } });
    return out;
  }
  const trainedExercises = () => { const ids = new Set(); db.workoutExercises.forEach((x) => { const w = byId("workouts", x.workoutId); if (w && w.status === "finished") ids.add(x.exerciseId); }); return [...ids].map((i) => byId("exercises", i)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name, "it")); };

  // ---------- Impostazioni, backup ----------
  const settings = {
    get: () => Object.assign({}, db.settings),
    set(o) { db.settings = { name: clean(o.name, 30, "Nome"), rest: restOf(o.rest, 90) }; save(); }
  };
  const exportData = () => JSON.parse(JSON.stringify(db));
  function importData(d) {
    if (!d || typeof d !== "object" || !Array.isArray(d.workouts) || !Array.isArray(d.exercises)) fail("Questi non sono dati di ARETE");
    try { root.localStorage.setItem(KEY + "-prima-del-ripristino", JSON.stringify(db)); } catch (e) {}
    db = normalize(d); save();
  }
  const clearAll = () => { db = empty(); save(); };

  db = load();
  root.AreteDB = { KEY, MUSCLES, LIM, VErr, exercises, routines, workouts, settings, seedExercises, history, previous, records, totals, byDay, weekly, monthly, trainedExercises, est1RM, dateKey, monday, exportData, importData, clearAll, activeId, parseNum, error: () => lastError, notice: () => loadNotice, clearNotice: () => (loadNotice = null), onEvent: (f) => listeners.push(f), _reload: () => (db = load()) };
})(typeof window !== "undefined" ? window : globalThis);
