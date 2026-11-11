// ARETE — libreria esercizi: catalogo, ricerca, dettaglio con storico personale, esercizi personalizzati.
// Le immagini dimostrative sono facoltative: se trovi esercizi/<chiave>.jpg viene mostrata (vedi esercizi/LEGGIMI.md).
(function () {
  const A = Arete, DB = A.DB, fmt = A.fmt, esc = A.esc;
  let st = { q: "", muscle: "" };
  const EQUIP = ["Bilanciere", "Bilanciere EZ", "Manubri", "Macchina", "Cavi", "Corpo libero", "Sbarra", "Parallele", "Kettlebell", "Elastici", "Ruota"];

  function listHtml() {
    const fav = st.muscle === "_fav", only = fav ? "" : st.muscle;
    const l = DB.exercises.list({ q: st.q, muscle: only, fav });
    if (!l.length) return fav && !st.q ? A.empty("Nessun preferito", "Apri un esercizio e tocca «Aggiungi ai preferiti», oppure usa la stella nella scelta degli esercizi.") : A.empty("Nessun esercizio trovato", `Prova con un'altra ricerca oppure <button class="ar-link" data-act="lib-new-q">crea «${esc(st.q || "un nuovo esercizio")}»</button>.`);
    const groups = only ? [[only, l]] : DB.MUSCLES.map((m) => [m, l.filter((e) => e.primary === m)]).filter(([, a]) => a.length);
    return groups.map(([m, a]) => `<h2 class="ar-h2">${fmt.muscle(m)} <span class="cnt">${a.length}</span></h2>` + a.map((e) => `<button class="ar-card row link" data-act="lib-open" data-id="${e.id}"><div><b>${e.fav ? '<span class="ar-favmark" aria-label="Preferito">★</span> ' : ""}${esc(e.name)}${e.custom ? ' <em class="pill">tuo</em>' : ""}</b><small>${esc(e.equipment || "—")}${e.secondary.length ? " · anche " + e.secondary.map((s) => fmt.muscle(s).toLowerCase()).join(", ") : ""}</small></div><span>›</span></button>`).join("")).join("");
  }
  A.screen("library", () => {
    view.innerHTML = A.head("Esercizi", `${DB.exercises.list().length} esercizi`) +
      `<input class="ar-in" id="libQ" data-inp="lib-q" placeholder="Cerca un esercizio…" value="${esc(st.q)}" autocomplete="off" aria-label="Cerca">
       <div class="ar-chips scroll"><button class="ar-chip${st.muscle ? "" : " on"}" data-act="lib-m" data-m="">Tutti</button><button class="ar-chip${st.muscle === "_fav" ? " on" : ""}" data-act="lib-m" data-m="_fav">★ Preferiti</button>${DB.MUSCLES.map((m) => `<button class="ar-chip${st.muscle === m ? " on" : ""}" data-act="lib-m" data-m="${m}">${fmt.muscle(m)}</button>`).join("")}</div>
       <button class="ar-btn ghost big" data-act="lib-new">+ Esercizio personalizzato</button><div id="libList">${listHtml()}</div>`;
  });

  function detail(id) {
    const e = DB.exercises.get(id); if (!e) return;
    const act = DB.workouts.active(), rec = DB.records().find((r) => r.exerciseId === id);
    A.modal(`<img id="exImg" class="ar-eximg" alt="Dimostrazione: ${esc(e.name)}" hidden>
      <div class="ar-chips"><span class="ar-chip on">${fmt.muscle(e.primary)}</span>${e.secondary.map((s) => `<span class="ar-chip">${fmt.muscle(s)}</span>`).join("")}${e.equipment ? `<span class="ar-chip">${esc(e.equipment)}</span>` : ""}</div>
      <h3 class="ar-h3">Come si esegue</h3><p class="ar-instr">${e.instructions ? esc(e.instructions).replace(/\n/g, "<br>") : "Nessuna istruzione inserita."}</p>
      <h3 class="ar-h3">Il tuo storico</h3>${rec ? `<div class="ar-sum"><div><b>${fmt.kg(rec.maxWeight.weight)}</b><span>massimo (× ${rec.maxWeight.reps})</span></div><div><b>${fmt.kg(rec.best1RM.value)}</b><span>1RM stimato</span></div><div><b>${rec.sessions}</b><span>sessioni</span></div></div>` : ""}${A.exHistory(id)}
      <div class="ar-btnrow"><button class="ar-btn ghost" data-act="lib-fav" data-id="${id}" aria-pressed="${!!e.fav}">${e.fav ? "★ Nei preferiti" : "☆ Aggiungi ai preferiti"}</button></div>
      <div class="ar-btnrow">${act ? `<button class="ar-btn" data-act="lib-add" data-id="${id}">Aggiungi all'allenamento</button>` : ""}${e.custom ? `<button class="ar-btn ghost" data-act="lib-edit" data-id="${id}">Modifica</button><button class="ar-btn ghost danger" data-act="lib-del" data-id="${id}">Elimina</button>` : `<button class="ar-btn ghost" data-act="lib-copy" data-id="${id}">Crea copia personalizzata</button>`}</div>`, { title: e.name, wide: true });
    const img = $("#exImg"); if (img && e.key) { img.onload = () => (img.hidden = false); A.loadImg(img, "esercizi/" + e.key); } else if (img) img.remove();
  }

  function form(ex, { name = "", then = null } = {}) {
    const e = ex || { name, primary: "", secondary: [], equipment: "", instructions: "" };
    A.modal(`<label class="ar-lbl">Nome<input class="ar-in" id="lfName" maxlength="60" value="${esc(e.name)}" autocomplete="off"></label>
      <label class="ar-lbl">Gruppo muscolare principale<select class="ar-in" id="lfPrim"><option value="">Scegli…</option>${DB.MUSCLES.map((m) => `<option value="${m}"${e.primary === m ? " selected" : ""}>${fmt.muscle(m)}</option>`).join("")}</select></label>
      <p class="ar-lbl">Muscoli secondari</p><div class="ar-chips" id="lfSec">${DB.MUSCLES.map((m) => `<button type="button" class="ar-chip${e.secondary.includes(m) ? " on" : ""}" data-act="lib-sec" data-m="${m}" aria-pressed="${e.secondary.includes(m)}">${fmt.muscle(m)}</button>`).join("")}</div>
      <label class="ar-lbl">Attrezzo<input class="ar-in" id="lfEq" list="lfEqList" maxlength="40" value="${esc(e.equipment)}" autocomplete="off"><datalist id="lfEqList">${EQUIP.map((q) => `<option value="${q}">`).join("")}</datalist></label>
      <label class="ar-lbl">Istruzioni<textarea class="ar-in" id="lfInstr" rows="4" maxlength="800">${esc(e.instructions)}</textarea></label>
      <button class="ar-btn" data-act="lib-save" data-id="${ex ? ex.id : ""}">Salva esercizio</button>`, { title: ex ? "Modifica esercizio" : "Nuovo esercizio" });
    form.then = then;
  }
  A.exerciseForm = form;

  A.reg({
    "lib-q": (el) => { st.q = el.value; $("#libList").innerHTML = listHtml(); },
    "lib-m": (el) => { st.muscle = el.dataset.m; A.render(); },
    "lib-open": (el) => detail(+el.dataset.id),
    "lib-new": () => form(null),
    "lib-new-q": () => form(null, { name: st.q }),
    "lib-fav": (el) => { const on = DB.exercises.toggleFav(+el.dataset.id); el.textContent = on ? "★ Nei preferiti" : "☆ Aggiungi ai preferiti"; el.setAttribute("aria-pressed", on); const l = $("#libList"); if (l) l.innerHTML = listHtml(); toast(on ? "Aggiunto ai preferiti ★" : "Tolto dai preferiti"); },
    "lib-edit": (el) => form(DB.exercises.get(+el.dataset.id)),
    "lib-copy": (el) => { const e = DB.exercises.get(+el.dataset.id); form(null, { name: e.name + " (mio)" }); $("#lfPrim").value = e.primary; $("#lfInstr").value = e.instructions; $("#lfEq").value = e.equipment; document.querySelectorAll("#lfSec .ar-chip").forEach((c) => c.classList.toggle("on", e.secondary.includes(c.dataset.m))); },
    "lib-sec": (el) => { el.classList.toggle("on"); el.setAttribute("aria-pressed", el.classList.contains("on")); },
    "lib-save": (el) => {
      const o = { name: $("#lfName").value, primary: $("#lfPrim").value, equipment: $("#lfEq").value, instructions: $("#lfInstr").value, secondary: [...document.querySelectorAll("#lfSec .ar-chip.on")].map((c) => c.dataset.m) };
      const e = el.dataset.id ? DB.exercises.update(+el.dataset.id, o) : DB.exercises.add(o), then = form.then; form.then = null;
      A.close(); toast("Esercizio salvato ✓"); if (then) then(e.id); else A.render();
    },
    "lib-del": (el) => { const e = DB.exercises.get(+el.dataset.id); if (!confirm(`Eliminare «${e.name}»?\nGli allenamenti passati che lo contengono restano invariati.`)) return; const r = DB.exercises.remove(e.id); A.close(); toast(r === "archived" ? "Esercizio nascosto (resta nello storico)" : "Esercizio eliminato"); A.render(); },
    "lib-add": (el) => { const a = DB.workouts.active(); DB.workouts.addExercise(a.id, +el.dataset.id); A.close(); toast("Aggiunto all'allenamento ✓"); }
  });
})();
