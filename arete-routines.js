// ARETE — routine: elenco, creazione, modifica, duplicazione, eliminazione, avvio.
// Una routine è un modello: l'allenamento ne copia i valori e poi vive per conto suo (vedi arete-db.js).
(function () {
  const A = Arete, DB = A.DB, fmt = A.fmt, esc = A.esc;
  const DAYS = [[1, "Lun"], [2, "Mar"], [3, "Mer"], [4, "Gio"], [5, "Ven"], [6, "Sab"], [0, "Dom"]]; // ordine italiano, valori = Date.getDay()
  let ed = null; // routine in modifica: { id, name, description, days, items:[{exerciseId, name, sets, reps, rest, notes}] }

  function list() {
    const rts = DB.routines.list(), act = DB.workouts.active();
    let h = A.head("Routine", "Schede riutilizzabili");
    h += `<button class="ar-btn big" data-act="rt-new">+ Nuova routine</button>`;
    h += rts.length ? rts.map((r) => `<article class="ar-card rt">
        <div class="rt-top"><div><b>${esc(r.name)}</b>${r.description ? `<small>${esc(r.description)}</small>` : ""}</div></div>
        ${(r.days || []).length ? `<p class="rt-days">${DAYS.filter(([d]) => r.days.includes(d)).map(([, n]) => n).join(" · ")}</p>` : ""}
        <ol class="rt-ex">${r.items.map((it) => `<li>${esc(it.exercise ? it.exercise.name : "(esercizio rimosso)")} <span>${it.sets} × ${esc(it.reps || "—")}${it.rest ? " · " + it.rest + " s" : ""}</span></li>`).join("")}</ol>
        <div class="ar-btnrow">${act ? "" : `<button class="ar-btn sm" data-act="start-routine" data-id="${r.id}">▶ Inizia</button>`}<button class="ar-btn ghost sm" data-act="rt-edit" data-id="${r.id}">Modifica</button><button class="ar-btn ghost sm" data-act="rt-dup" data-id="${r.id}">Duplica</button><button class="ar-btn ghost sm danger" data-act="rt-del" data-id="${r.id}">Elimina</button></div></article>`).join("")
      : A.empty("Nessuna routine", "Una routine è una scheda di esercizi con serie e ripetizioni previste. Creane una e avviala con un tocco.");
    return h;
  }

  const blank = () => ({ id: null, name: "", description: "", days: [], items: [] });
  const fromRoutine = (r) => ({ id: r.id, name: r.name, description: r.description || "", days: (r.days || []).slice(), items: r.items.map((it) => ({ exerciseId: it.exerciseId, name: it.exercise ? it.exercise.name : "(esercizio rimosso)", sets: it.sets, reps: it.reps, rest: it.rest, notes: it.notes || "" })) });

  function sync() { // porta nello stato ciò che è scritto nei campi
    if (!ed || !$("#rtName")) return;
    ed.name = $("#rtName").value; ed.description = $("#rtDesc").value;
    ed.items.forEach((it, i) => { it.sets = $("#rtS" + i).value; it.reps = $("#rtR" + i).value; it.rest = $("#rtT" + i).value; it.notes = $("#rtN" + i).value; });
  }
  function editor() {
    let h = A.head(ed.id ? "Modifica routine" : "Nuova routine");
    h += `<label class="ar-lbl">Nome<input class="ar-in" id="rtName" maxlength="60" value="${esc(ed.name)}" placeholder="Es. Push A" autocomplete="off"></label>
      <label class="ar-lbl">Descrizione<input class="ar-in" id="rtDesc" maxlength="300" value="${esc(ed.description)}" placeholder="Facoltativa" autocomplete="off"></label>
      <p class="ar-lbl">Giorni in cui la fai (compare nella home)</p><div class="ar-chips">${DAYS.map(([d, n]) => `<button class="ar-chip${ed.days.includes(d) ? " on" : ""}" data-act="rt-day" data-d="${d}" aria-pressed="${ed.days.includes(d)}">${n}</button>`).join("")}</div>
      <h2 class="ar-h2">Esercizi</h2>`;
    h += ed.items.length ? ed.items.map((it, i) => `<div class="ar-card rt-item"><div class="rt-item-top"><b>${i + 1}. ${esc(it.name)}</b><span><button class="ar-dots" data-act="rt-up" data-i="${i}" ${i === 0 ? "disabled" : ""} aria-label="Sposta su">↑</button><button class="ar-dots" data-act="rt-down" data-i="${i}" ${i === ed.items.length - 1 ? "disabled" : ""} aria-label="Sposta giù">↓</button><button class="ar-dots" data-act="rt-swap" data-i="${i}" aria-label="Cambia esercizio">⇄</button><button class="ar-dots danger" data-act="rt-rm" data-i="${i}" aria-label="Rimuovi">✕</button></span></div>
        <div class="rt-grid"><label>Serie<input class="ar-in n" id="rtS${i}" inputmode="numeric" value="${esc(it.sets)}"></label><label>Rip. previste<input class="ar-in n" id="rtR${i}" value="${esc(it.reps)}" placeholder="8-12"></label><label>Recupero (s)<input class="ar-in n" id="rtT${i}" inputmode="numeric" value="${esc(it.rest)}"></label></div>
        <input class="ar-in" id="rtN${i}" maxlength="500" value="${esc(it.notes)}" placeholder="Note (facoltative)"></div>`).join("")
      : `<p class="ar-note">Nessun esercizio: aggiungine almeno uno.</p>`;
    h += `<button class="ar-btn ghost big" data-act="rt-add">+ Aggiungi esercizio</button><div class="ar-btnrow"><button class="ar-btn" data-act="rt-save">Salva routine</button><button class="ar-btn ghost" data-act="rt-cancel">Annulla</button></div>`;
    return h;
  }
  const open = (r) => { ed = r; A.show("routines"); };
  A.screen("routines", () => { view.innerHTML = ed ? editor() : list(); });

  A.reg({
    "rt-new": () => open(blank()),
    "rt-edit": (el) => open(fromRoutine(DB.routines.get(+el.dataset.id))),
    "rt-dup": (el) => { DB.routines.duplicate(+el.dataset.id); toast("Routine duplicata ✓"); A.show("routines"); },
    "rt-del": (el) => { const r = DB.routines.get(+el.dataset.id); if (confirm(`Eliminare la routine «${r.name}»?\nGli allenamenti già svolti non vengono toccati.`)) { DB.routines.remove(r.id); toast("Routine eliminata"); A.show("routines"); } },
    "rt-day": (el) => { sync(); const d = +el.dataset.d; ed.days = ed.days.includes(d) ? ed.days.filter((x) => x !== d) : ed.days.concat(d); A.render(); },
    "rt-add": () => { sync(); A.pickExercise((ids) => { ids.forEach((id) => { const e = DB.exercises.get(id); ed.items.push({ exerciseId: id, name: e.name, sets: 3, reps: "8-12", rest: DB.settings.get().rest, notes: "" }); }); A.render(); }, "Aggiungi alla routine"); },
    "rt-up": (el) => { sync(); const i = +el.dataset.i; [ed.items[i - 1], ed.items[i]] = [ed.items[i], ed.items[i - 1]]; A.render(); },
    "rt-down": (el) => { sync(); const i = +el.dataset.i; [ed.items[i + 1], ed.items[i]] = [ed.items[i], ed.items[i + 1]]; A.render(); },
    "rt-swap": (el) => { sync(); const i = +el.dataset.i, it = ed.items[i]; A.swap.open({ exerciseId: it.exerciseId, onPick: (id) => { const e = DB.exercises.get(id); it.exerciseId = id; it.name = e.name; A.render(); } }); },
    "rt-rm": (el) => { sync(); ed.items.splice(+el.dataset.i, 1); A.render(); },
    "rt-cancel": () => { if (!ed.items.length && !ed.name || confirm("Annullare le modifiche?")) { ed = null; A.show("routines"); } },
    "rt-save": () => {
      sync();
      const data = { name: ed.name, description: ed.description, days: ed.days, items: ed.items.map((it) => ({ exerciseId: it.exerciseId, sets: it.sets, reps: it.reps, rest: it.rest, notes: it.notes })) };
      ed.id ? DB.routines.update(ed.id, data) : DB.routines.create(data); // in caso di errore resta nell'editor con i dati inseriti
      ed = null; toast("Routine salvata ✓"); A.show("routines");
    }
  });
  A.editRoutine = (id) => { ed = id ? fromRoutine(DB.routines.get(id)) : blank(); A.show("routines"); };
})();
