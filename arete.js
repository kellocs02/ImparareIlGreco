// ARETE (Ἀρετή) — modulo fitness: nucleo (navigazione propria, funzioni comuni, home).
// Le altre schermate stanno in arete-workout.js, arete-routines.js, arete-diary.js, arete-progress.js, arete-library.js
// e si registrano con Arete.screen(nome, funzione). Si entra con go("arete") (vedi app.js) e si esce con "‹ Ελληνικά".
window.Arete = (() => {
  const DB = AreteDB, D = AreteData;
  const SECTIONS = [
    ["home", "Home", '<path d="M3 10 12 4l9 6M5 10v9M9 10v9M15 10v9M19 10v9M3 21h18"/>'],
    ["workout", "Allenamento", '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>'],
    ["routines", "Routine", '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'],
    ["diary", "Diario", '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'],
    ["progress", "Progressi", '<path d="M3 20h18M6 20v-7M11 20V6M16 20v-10"/>'],
    ["library", "Esercizi", '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>']
  ];
  const screens = {}, acts = {};
  let section = "home", isOpen = false, ticker = null, themeBackup = null, quoteIdx = 0, credits = null, restNotified = null;

  // ---------- Formati ----------
  const WD = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"], WDL = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const MO = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const p2 = (n) => String(n).padStart(2, "0");
  const num = (n) => String(Math.round(n * 100) / 100).replace(".", ",");
  const fmt = {
    kg: (n) => num(n) + " kg",
    vol: (n) => Math.round(n).toLocaleString("it-IT") + " kg",
    clock: (ms) => { const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return (h ? h + ":" + p2(m) : m) + ":" + p2(s % 60); },
    dur: (ms) => { const m = Math.round(ms / 60000); if (m < 60) return m + " min"; return Math.floor(m / 60) + " h " + p2(m % 60) + " min"; },
    dayShort: (ts) => { const d = new Date(ts); return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()].slice(0, 3)}`; },
    dayLong: (ts) => { const d = new Date(ts); return `${WDL[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]} ${d.getFullYear()}`; },
    time: (ts) => { const d = new Date(ts); return p2(d.getHours()) + ":" + p2(d.getMinutes()); },
    muscle: (k) => D.MUSCLE_NAMES[k] || k
  };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  // ---------- Azioni (click/change/input) con gestione errori ----------
  function handle(e) {
    if (e instanceof DB.VErr) return toast(e.message);
    console.error(e); toast("Qualcosa non ha funzionato: " + (e && e.message ? e.message : "errore sconosciuto"));
  }
  function guard(fn) { try { const r = fn(); if (r && r.catch) r.catch(handle); } catch (e) { handle(e); } }
  const reg = (o) => Object.assign(acts, o);
  ["click", "change", "input"].forEach((type) => document.addEventListener(type, (e) => {
    if (!document.body.classList.contains("arete")) return;
    const attr = type === "click" ? "act" : type === "change" ? "chg" : "inp";
    const el = e.target.closest(`[data-${attr}]`); if (!el) return;
    const f = acts[el.dataset[attr]]; if (f) guard(() => f(el, e));
  }));

  // ---------- Finestre ----------
  function modal(html, { title = "", wide = false } = {}) {
    close();
    const m = document.createElement("div"); m.id = "ar-modal"; m.className = "ar-modal";
    m.innerHTML = `<div class="ar-sheet${wide ? " wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="ar-sheet-top"><b>${esc(title)}</b><button class="ar-x" data-act="close" aria-label="Chiudi">✕</button></div><div class="ar-sheet-body">${html}</div></div>`;
    m.addEventListener("click", (e) => { if (e.target === m) close(); });
    document.body.appendChild(m); document.body.classList.add("ar-lock");
    return m.querySelector(".ar-sheet-body");
  }
  function close() { const m = $("#ar-modal"); if (m) m.remove(); document.body.classList.remove("ar-lock"); }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#ar-modal")) close(); });

  // ---------- Elementi comuni ----------
  function head(title, sub) {
    return `<header class="ar-head"><button class="ar-exit" data-act="exit">‹ Ελληνικά</button><span class="ar-wm" aria-hidden="true">ΑΡΕΤΗ</span><button class="ar-gear" data-act="settings" aria-label="Impostazioni">⚙</button></header>
      <h1 class="ar-h1">${esc(title)}${sub ? `<small>${sub}</small>` : ""}</h1>`;
  }
  const empty = (t, d, btn) => `<div class="ar-empty"><b>${esc(t)}</b><p>${d}</p>${btn || ""}</div>`;
  // Grafico a barre (valori reali; nessun dato = messaggio, mai numeri inventati)
  function bars(values, labels, { unit = "", h = 110 } = {}) {
    const max = Math.max(...values, 0), W = 300, bw = W / values.length;
    if (!max) return `<p class="ar-note">Ancora nessun dato in questo periodo.</p>`;
    const b = values.map((v, i) => { const bh = Math.max(v ? 3 : 0, (v / max) * (h - 34)), x = i * bw + bw * 0.16, w = bw * 0.68;
      return `<rect class="ar-bar" x="${x.toFixed(1)}" y="${(h - 18 - bh).toFixed(1)}" width="${w.toFixed(1)}" height="${bh.toFixed(1)}" rx="2"/>${v ? `<text class="ar-val" x="${(x + w / 2).toFixed(1)}" y="${(h - 22 - bh).toFixed(1)}">${num(v)}${unit}</text>` : ""}<text class="ar-lab" x="${(x + w / 2).toFixed(1)}" y="${h - 4}">${esc(labels[i])}</text>`; }).join("");
    return `<svg class="ar-chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="Grafico a barre">${b}<line class="ar-axis" x1="0" y1="${h - 18}" x2="${W}" y2="${h - 18}"/></svg>`;
  }

  // ---------- Immagini delle statue (le inserisce l'utente in statue/, vedi statue/LEGGIMI.md) ----------
  const EXTS = ["jpg", "jpeg", "webp", "png"];
  function loadImg(img, base, onFail) { // prova jpg, jpeg, webp, png; se nessuna esiste chiama onFail
    let i = 0;
    img.onerror = () => { i++; if (i < EXTS.length) img.src = `${base}.${EXTS[i]}`; else { img.onerror = null; img.remove(); if (onFail) onFail(); } };
    img.src = `${base}.${EXTS[0]}`;
  }
  function loadCredits() { if (!credits) credits = fetch("statue/credits.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({})); return credits; }
  function nextQuote() { try { quoteIdx = (+localStorage.getItem("arete-qi") || 0) + 1; localStorage.setItem("arete-qi", String(quoteIdx)); } catch (e) { quoteIdx++; } quoteIdx %= D.QUOTES.length; }
  function hero() {
    const q = D.QUOTES[quoteIdx % D.QUOTES.length], st = D.STATUES.find((s) => s.id === q.statue) || D.STATUES[0];
    return `<section class="ar-hero" id="arHero" data-statue="${st.id}">
        <img class="ar-hero-img" alt="${esc(st.name)}, ${esc(st.by)}" decoding="async">
        <div class="ar-hero-shade"></div>
        <button class="ar-rot" data-act="rot" aria-label="Mostra un'altra citazione">↻</button>
        <blockquote class="ar-hero-text">
          <p class="ar-q-gr" lang="${q.la ? "la" : "grc"}">${esc(q.gr || q.la)}</p>
          <p class="ar-q-it">«${esc(q.it)}»</p>
          <footer class="ar-by">${esc(q.by)}</footer>
        </blockquote>
      </section>
      <p class="ar-caption"><b>${esc(st.name)}</b> · ${esc(st.by)}, ${esc(st.date)}<span id="arCredit"></span></p>`;
  }
  function bindHero() {
    const h = $("#arHero"); if (!h) return;
    const id = h.dataset.statue, img = h.querySelector("img");
    loadImg(img, "statue/" + id, () => h.classList.add("noimg"));
    loadCredits().then((c) => { const el = $("#arCredit"); if (el && c && c[id]) el.textContent = " — " + c[id]; });
  }

  // ---------- Obiettivo settimanale (lun–dom): conta gli allenamenti realmente conclusi ----------
  function goalCard() {
    const g = DB.goal();
    if (!g.goal) return `<p class="ar-note small"><button class="ar-link" data-act="settings">Imposta un obiettivo settimanale ›</button></p>`;
    const pct = Math.min(100, Math.round((g.done / g.goal) * 100)), reached = g.done >= g.goal;
    return `<div class="ar-card ar-goal${reached ? " reached" : ""}"><div class="ar-goal-top"><b>Obiettivo della settimana</b><span>${g.done} / ${g.goal}</span></div>
      <i class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${g.goal}" aria-valuenow="${Math.min(g.done, g.goal)}" aria-label="Allenamenti questa settimana"><b style="width:${pct}%"></b></i>
      <small>${reached ? (g.done > g.goal ? `Obiettivo superato di ${g.done - g.goal}. ` : "Obiettivo raggiunto! ") : `Ti ${g.goal - g.done === 1 ? "manca" : "mancano"} ${plural(g.goal - g.done, "allenamento", "allenamenti")}. `}Da lunedì a domenica.</small></div>`;
  }

  // ---------- Home ----------
  function home() {
    const s = DB.settings.get(), t = new Date(), wd = t.getDay();
    const hr = t.getHours(), greet = hr < 12 ? "Buongiorno" : hr < 18 ? "Buon pomeriggio" : "Buonasera";
    const tot = DB.totals(), monthKey = DB.dateKey(Date.now()).slice(0, 7);
    const fin = DB.workouts.finished(), inMonth = fin.filter((w) => DB.dateKey(w.startedAt).slice(0, 7) === monthKey);
    const act = DB.workouts.active(), rts = DB.routines.list(), todays = DB.routines.scheduledFor(wd);
    let h = head("Ἀρετή");
    h += hero();
    h += `<p class="ar-welcome"><b>Χαῖρε${s.name ? ", " + esc(s.name) : ""}.</b> ${greet}: oggi è ${WDL[wd]}.</p>`;
    if (act) h += `<button class="ar-resume" data-act="goto" data-sec="workout"><span><b>Allenamento in corso</b><small>${esc(act.name)} · ${plural(act.doneSets, "serie completata", "serie completate")}</small></span><span class="ar-resume-t" data-elapsed>${fmt.clock(DB.workouts.elapsed(act))}</span></button>`;
    else h += `<button class="ar-btn big" data-act="start-empty">Inizia allenamento</button>`;
    h += goalCard();
    h += `<h2 class="ar-h2">Oggi in programma</h2>`;
    if (todays.length) h += todays.map((r) => `<div class="ar-card row"><div><b>${esc(r.name)}</b><small>${plural(r.items.length, "esercizio", "esercizi")}${r.description ? " · " + esc(r.description) : ""}</small></div>${act ? "" : `<button class="ar-btn sm" data-act="start-routine" data-id="${r.id}">Inizia</button>`}</div>`).join("");
    else h += `<p class="ar-note">${rts.length ? "Nessuna routine assegnata a " + WDL[wd] + ". Puoi collegare le routine ai giorni della settimana dalla loro scheda." : "Non hai ancora creato routine."} <button class="ar-link" data-act="goto" data-sec="routines">${rts.length ? "Vai alle routine" : "Crea la prima routine"}</button></p>`;
    h += `<div class="ar-tiles"><div class="ar-tile"><b>${inMonth.length}</b><span>allenamenti<br>questo mese</span></div><div class="ar-tile"><b>${fmt.dur(tot.ms)}</b><span>tempo totale<br>di allenamento</span></div><div class="ar-tile"><b>${fmt.vol(inMonth.reduce((a, w) => a + w.volume, 0))}</b><span>volume<br>questo mese</span></div></div>`;
    h += `<h2 class="ar-h2">Ultime 8 settimane</h2><div class="ar-card">${bars(DB.weekly(8).map((w) => w.count), DB.weekly(8).map((w) => { const d = new Date(w.start); return d.getDate() + "/" + (d.getMonth() + 1); }))}<button class="ar-link" data-act="goto" data-sec="progress">Tutti i progressi ›</button></div>`;
    h += `<h2 class="ar-h2">Allenamenti recenti</h2>`;
    h += fin.length ? fin.slice(0, 3).map((w) => `<button class="ar-card row link" data-act="wk-open" data-id="${w.id}"><div><b>${esc(w.name)}</b><small>${fmt.dayShort(w.startedAt)} · ${fmt.dur(w.duration)} · ${fmt.vol(w.volume)}</small></div><span>›</span></button>`).join("")
      : `<p class="ar-note">Nessun allenamento concluso: i tuoi allenamenti compariranno qui.</p>`;
    if (rts.length) h += `<h2 class="ar-h2">Le tue routine</h2><div class="ar-chips">${rts.map((r) => `<button class="ar-chip" data-act="${act ? "goto" : "start-routine"}" data-sec="workout" data-id="${r.id}">▶ ${esc(r.name)}</button>`).join("")}</div>`;
    view.innerHTML = h; bindHero();
  }

  // ---------- Avvio allenamenti ----------
  function startEmpty(openPicker) { DB.workouts.start({}); show("workout"); if (openPicker && Arete.pickExercise) Arete.pickExercise(); }
  function startRoutine(id) { DB.workouts.start({ routineId: +id }); show("workout"); }

  // ---------- Impostazioni ----------
  function settings() {
    const s = DB.settings.get();
    modal(`<label class="ar-lbl">Il tuo nome (facoltativo)<input class="ar-in" id="arsName" maxlength="30" value="${esc(s.name)}" autocomplete="off"></label>
      <label class="ar-lbl">Recupero predefinito tra le serie (secondi)<input class="ar-in" id="arsRest" inputmode="numeric" value="${s.rest}"></label>
      <label class="ar-lbl">Obiettivo settimanale (allenamenti a settimana, 0 = nessuno)<input class="ar-in" id="arsGoal" inputmode="numeric" value="${s.weeklyGoal || 0}"></label>
      <label class="ar-lbl ar-chk"><input type="checkbox" id="arsBg" ${Bg.enabled() ? "checked" : ""}> Recupero anche a schermo spento: conto alla rovescia nella tendina e suono alla fine <small>(durante il recupero può mettere in pausa la musica)</small></label>
      <p class="ar-note">Le unità sono i chilogrammi. I dati di ARETE restano sul telefono e sono inclusi nel backup di Ελληνικά (scheda Progressi, «Salva backup»).</p>
      <button class="ar-btn" data-act="settings-save">Salva</button>`, { title: "Impostazioni" });
  }

  // ---------- Timer (cronometro, recupero) ----------
  function beep() {
    try { const C = window.AudioContext || window.webkitAudioContext, a = new C(), o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + 0.25); setTimeout(() => a.close(), 600); } catch (e) {}
    try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
  }
  function tick() {
    const a = DB.workouts.active(); if (!a) return;
    document.querySelectorAll("[data-elapsed]").forEach((el) => (el.textContent = fmt.clock(DB.workouts.elapsed(a))));
    const left = a.rest ? Math.ceil((a.rest.endsAt - Date.now()) / 1000) : null;
    document.querySelectorAll("[data-rest]").forEach((el) => { el.textContent = left === null ? "" : left > 0 ? fmt.clock(left * 1000) : "Recupero finito"; el.classList.toggle("done", left !== null && left <= 0); });
    const pct = a.rest ? Math.max(0, Math.min(100, (1 - left / a.rest.total) * 100)) : 0;
    document.querySelectorAll("[data-restbar]").forEach((el) => (el.style.width = pct + "%"));
    if (a.rest && left <= 0 && restNotified !== a.rest.endsAt) { restNotified = a.rest.endsAt; if (!Bg.active()) beep(); toast("Recupero finito: prossima serie"); }
  }
  function miniBar() {
    let m = $("#ar-mini"); const a = isOpen && section !== "workout" ? DB.workouts.active() : null;
    if (!a) { if (m) m.remove(); return; }
    if (!m) { m = document.createElement("button"); m.id = "ar-mini"; m.className = "ar-mini"; m.dataset.act = "goto"; m.dataset.sec = "workout"; document.body.appendChild(m); }
    m.innerHTML = `<span class="dot"></span><b>${esc(a.name)}</b><span data-elapsed>${fmt.clock(DB.workouts.elapsed(a))}</span><span class="rest" data-rest></span><span>›</span>`;
  }

  // ---------- Recupero in background: contatore nella tendina del telefono + suono alla fine ----------
  // Un browser non può programmare una notifica a pagina chiusa senza un server. Il trucco usato qui: durante il recupero
  // si riproduce un audio silenzioso. Così la pagina resta attiva anche con lo schermo spento e il telefono mostra nella
  // tendina un "lettore multimediale" con il conto alla rovescia (e −15 s / +15 s). Allo scadere parte il suono.
  // Si può disattivare dalle impostazioni (⚙): l'audio può mettere in pausa la musica che stai ascoltando.
  const Bg = (() => {
    const KEY = "arete-bg";
    const enabled = () => { try { return localStorage.getItem(KEY) !== "off"; } catch (e) { return true; } };
    const setEnabled = (on) => { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) {} if (!on) stop(); };
    let audio = null, mode = "off", rung = null, lastText = "", urls = {};
    const wav = (samples, rate) => {
      const n = samples.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf), w = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
      w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
      for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, samples[i], true);
      return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
    };
    const silence = () => urls.s || (urls.s = wav(Int16Array.from({ length: 16000 }, (_, i) => (i % 2 ? 1 : -1)), 8000)); // rumore di ampiezza 1/32768: inudibile
    const alarm = () => {
      if (urls.a) return urls.a;
      const R = 22050, out = new Int16Array(Math.floor(R * 1.4)); // tre "bip" a 880 Hz
      [0, 0.45, 0.9].forEach((t0) => { const a = Math.floor(t0 * R), len = Math.floor(0.3 * R); for (let i = 0; i < len; i++) { const env = Math.min(1, i / 200, (len - i) / 400); out[a + i] = Math.round(Math.sin((2 * Math.PI * 880 * i) / R) * 0.75 * 32767 * env); } });
      return (urls.a = wav(out, R));
    };
    const ms = () => ("mediaSession" in navigator ? navigator.mediaSession : null);
    const acts = () => {
      const m = ms(); if (!m) return;
      const adj = (d) => () => { try { const w = DB.workouts.active(); if (w && w.rest) { DB.workouts.adjustRest(w.id, d); if (isOpen) render(); poll(); } } catch (e) {} };
      const set = (a, f) => { try { m.setActionHandler(a, f); } catch (e) {} };
      set("previoustrack", adj(-15)); set("nexttrack", adj(15));
      set("pause", () => { try { const w = DB.workouts.active(); if (w) DB.workouts.skipRest(w.id); } catch (e) {} stop(); if (isOpen) render(); });
      set("play", () => {});
    };
    const meta = (title, artist, pos) => {
      const m = ms(); if (!m) return;
      const key = title + "|" + artist; if (key !== lastText) { lastText = key; try { m.metadata = new MediaMetadata({ title, artist, album: "⏮ −15 s    ⏭ +15 s", artwork: [{ src: "icon-192.png", sizes: "192x192", type: "image/png" }, { src: "icon-512.png", sizes: "512x512", type: "image/png" }] }); } catch (e) {} }
      try { m.playbackState = "playing"; if (pos && m.setPositionState) m.setPositionState({ duration: pos[0], position: Math.max(0, Math.min(pos[0], pos[1])), playbackRate: 1 }); } catch (e) {}
    };
    function ensure() { if (!audio) { audio = new Audio(); audio.preload = "auto"; audio.setAttribute("playsinline", ""); } return audio; }
    function playSrc(src, loop) { const a = ensure(); a.loop = loop; a.src = src; a.volume = 1; const p = a.play(); return p && p.then ? p.then(() => true, () => false) : Promise.resolve(true); }
    function stop() {
      mode = "off"; lastText = "";
      if (audio) { try { audio.onended = null; audio.pause(); audio.removeAttribute("src"); audio.load(); } catch (e) {} }
      const m = ms(); if (m) { try { m.playbackState = "none"; m.metadata = null; ["previoustrack", "nexttrack", "pause", "play"].forEach((a) => m.setActionHandler(a, null)); } catch (e) {} }
    }
    function startCount() { mode = "counting"; acts(); playSrc(silence(), true).then((ok) => { if (!ok && mode === "counting") mode = "off"; }); }
    function ring() {
      mode = "ringing"; meta("Recupero finito", "Prossima serie 💪", null);
      playSrc(alarm(), false).then((ok) => { if (!ok) { mode = "off"; beep(); return; } if (audio) audio.onended = () => { if (mode === "ringing") stop(); }; setTimeout(() => { if (mode === "ringing") stop(); }, 4000); });
    }
    function poll() {
      if (!enabled()) { if (mode !== "off") stop(); return; }
      let a = null, r = null; try { a = DB.workouts.active(); r = a && a.rest; } catch (e) {}
      if (!r) { if (mode === "counting") stop(); return; }
      const left = Math.ceil((r.endsAt - Date.now()) / 1000);
      if (left > 0) {
        if (mode !== "counting") startCount();
        if (mode === "counting") meta("Recupero " + fmt.clock(left * 1000), "ARETE · " + a.name, [r.total, r.total - left]);
      } else if (mode === "counting" && rung !== r.endsAt) { rung = r.endsAt; ring(); }
    }
    // Sblocca l'audio al primo tocco (necessario su iPhone, innocuo altrove)
    const unlock = () => { document.removeEventListener("pointerdown", unlock, true); if (!enabled()) return; try { const a = ensure(); a.src = silence(); a.volume = 0; const p = a.play(); if (p && p.then) p.then(() => { if (mode === "off") { a.pause(); a.removeAttribute("src"); } }, () => {}); } catch (e) {} };
    document.addEventListener("pointerdown", unlock, true);
    setInterval(poll, 500);
    // true se è il modulo di background a gestire il suono di fine recupero (così non suona due volte)
    return { active: () => mode === "counting" || mode === "ringing", enabled, setEnabled, stop, poll };
  })();

  // ---------- Navigazione ----------
  function nav() {
    let n = $("#anav");
    if (!n) { n = document.createElement("nav"); n.id = "anav"; n.setAttribute("aria-label", "ARETE"); document.body.appendChild(n); }
    n.innerHTML = SECTIONS.map(([k, label, ic]) => `<button data-act="goto" data-sec="${k}" class="${k === section ? "on" : ""}" ${k === section ? 'aria-current="page"' : ""}><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic}</svg><span>${label}</span></button>`).join("");
  }
  function show(sec) {
    if (Arete.flush) Arete.flush();
    if (sec) section = sec;
    if (!screens[section]) section = "home";
    close(); nav(); view.className = "ar-view";
    const fn = section === "home" ? home : screens[section];
    try { fn(); } catch (e) { handle(e); view.innerHTML = head("ARETE") + empty("Schermata non disponibile", esc(e.message)); }
    miniBar(); tick(); window.scrollTo(0, 0);
  }
  const render = () => { if (Arete.flush) Arete.flush(); const y = window.scrollY; show(); window.scrollTo(0, y); };
  function open(sec) {
    if (!isOpen) {
      isOpen = true; document.body.classList.add("arete");
      const m = document.querySelector('meta[name="theme-color"]'); if (m) { themeBackup = m.content; m.content = "#0e0d0c"; }
      nextQuote(); ticker = setInterval(tick, 1000);
      const n = DB.notice(); if (n) { setTimeout(() => toast(n), 400); DB.clearNotice(); }
    }
    show(sec || "home");
  }
  function leave() {
    if (!isOpen) return;
    isOpen = false; document.body.classList.remove("arete", "ar-lock"); clearInterval(ticker); ticker = null; close();
    ["#anav", "#ar-mini"].forEach((s) => { const e = $(s); if (e) e.remove(); });
    const m = document.querySelector('meta[name="theme-color"]'); if (m && themeBackup) m.content = themeBackup;
    view.className = "";
  }

  reg({
    exit: () => go("home"),
    goto: (el) => show(el.dataset.sec),
    close: () => close(),
    rot: () => { quoteIdx = (quoteIdx + 1) % D.QUOTES.length; try { localStorage.setItem("arete-qi", String(quoteIdx)); } catch (e) {} const old = $("#arHero"), cap = old && old.nextElementSibling; if (old) { old.remove(); if (cap) cap.remove(); } $(".ar-welcome").insertAdjacentHTML("beforebegin", hero()); bindHero(); },
    "start-empty": () => startEmpty(false),
    "start-routine": (el) => startRoutine(el.dataset.id),
    settings: () => settings(),
    "settings-save": () => { DB.settings.set({ name: $("#arsName").value, rest: $("#arsRest").value, weeklyGoal: $("#arsGoal").value }); Bg.setEnabled($("#arsBg").checked); close(); toast("Impostazioni salvate ✓"); render(); },
    "wk-open": (el) => { if (Arete.openWorkout) Arete.openWorkout(+el.dataset.id); }
  });
  DB.onEvent((k, m) => { if (k === "error") toast(m); });
  DB.seedExercises(D.EXERCISES);

  return { SECTIONS, DB, D, fmt, num, plural, esc: (s) => esc(s), screen: (n, f) => (screens[n] = f), reg, modal, close, head, empty, bars, show, render, open, leave, miniBar, tick, guard, startEmpty, startRoutine, loadImg, isOpen: () => isOpen, section: () => section };
})();