// Schermate e ciclo di vita della modalità arcade.
window.TankBattle = (() => {
  const { tanks, difficulties, duration, specialCost, tierNames, modes } = TankRules;
  const outcomes = { win: "Vittoria", loss: "Sconfitta", draw: "Pareggio" };
  const promptText = { gr2it: "SCEGLI LA TRADUZIONE", it2gr: "SCEGLI LA PAROLA GRECA", listen: "ASCOLTA E SCEGLI LA TRADUZIONE" };
  // Se il dispositivo non può riprodurre l'audio, "Ascolto" non è disponibile e si torna alle miste.
  const modeOf = (progress) => Object.hasOwn(modes, progress.mode) && (progress.mode !== "listen" || TankWords.canListen())
    ? progress.mode : "mixed";
  const timeText = (ms) => {
    const seconds = Math.ceil(Math.max(0, ms) / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  };
  const percent = (n, d) => d ? Math.round(100 * n / d) : 0;
  const stat = (label, value) => `<div><dt>${label}</dt><dd>${value}</dd></div>`;
  let frame = 0, battleEvents;

  function clear() {
    cancelAnimationFrame(frame);
    battleEvents?.abort();
    battleEvents = null;
  }
  function leave() {
    clear();
    view.classList.remove("tank-view");
  }
  function screen(html) {
    clear();
    view.classList.add("tank-view");
    view.innerHTML = `<div class="tb">${html}</div>`;
    window.scrollTo(0, 0);
  }
  function bind(id, fn) { $(`#tb-${id}`).onclick = () => fn(); }
  function focus(id) { $(`#tb-${id}`).focus({ preventScroll: true }); }

  function selected(progress) {
    return tanks.find((tank) => tank.id === progress.selected && TankProgress.unlocked(tank, progress)) || tanks[0];
  }
  function nextGoal(progress) {
    const next = tanks.find((tank) => !TankProgress.unlocked(tank, progress));
    return next ? `<b>Prossimo carro · ${next.name}</b><span>${TankProgress.requirements(next, progress)}</span>`
      : "<b>Hangar completo</b><span>Hai sbloccato tutti e quattro i carri.</span>";
  }
  function header(label, action = "hub") {
    return `<div class="tb-top"><button class="tb-link" id="tb-${action}">‹ ${label}</button><span>GREEK TANK BATTLE</span></div>`;
  }
  function showcase(tank, enemy) {
    return { player: { tank, hp: tank.hp }, bot: { tank: enemy, hp: enemy.hp }, now: 0, shots: [], effects: [] };
  }
  function missedWords() {
    return TankProgress.get().mistakes.filter((id) => state.err[id]).map((id) => wordMap().get(id)).filter(Boolean);
  }
  function roster(tank, progress, current) {
    const open = TankProgress.unlocked(tank, progress);
    return `<article class="tb-tank ${current === tank ? "is-picked" : ""}" style="--tank-color:${tank.color};--tank-trim:${tank.trim}">
      <div class="tb-tank-art"><canvas data-portrait="${tank.id}" aria-hidden="true"></canvas>
        <span>${tank.id === "zeus" ? "LEGGENDARIO" : "LIVELLO " + tank.level}</span></div>
      <div class="tb-tank-body"><h3>${tank.name}</h3>
        <dl class="tb-tank-stats">${stat("HP", tank.hp)}${stat("Attacco", tank.attack)}${stat("Corazza", percent(tank.armor, 1) + "%")}${stat("Velocità", tank.speed + "/5")}</dl>
        <p><strong>${tank.special}</strong><br>${tank.description}</p>
        <button class="tb-button" type="button" data-select="${tank.id}" ${open ? "" : "disabled"} aria-pressed="${tank === current}">
          ${tank === current ? "✓ Selezionato" : open ? "Seleziona " + tank.name : "🔒 Bloccato"}</button>
        ${open ? "" : `<small class="tb-req">${TankProgress.requirements(tank, progress)}</small>`}
      </div></article>`;
  }

  function hub(focusTank = null) {
    const progress = TankProgress.get(), tank = selected(progress), errors = missedWords();
    const difficulty = Object.hasOwn(difficulties, progress.difficulty) ? progress.difficulty : "normal";
    const mode = modeOf(progress);
    screen(`${header("Home", "home")}
      <section class="tb-hero" aria-labelledby="tb-title">
        <canvas id="tb-cover" role="img" aria-label="Due carri mitologici si affrontano davanti a un tempio greco"></canvas>
        <div class="tb-hero-copy"><span class="tb-kicker">ARENA DELL’OLIMPO · DUELLO 1 CONTRO 1</span>
          <h1 id="tb-title" tabindex="-1">Greek Tank<br><em>Battle</em></h1>
          <p>Traduci dal greco, carica il cannone e sfida i carri dell’Olimpo.</p></div>
      </section>
      <div class="tb-launch">
        <label for="tb-difficulty">Difficoltà del duello<select id="tb-difficulty">
          ${Object.entries(difficulties).map(([id, rules]) => `<option value="${id}" ${id === difficulty ? "selected" : ""}>${rules.name}</option>`).join("")}
        </select></label>
        <label for="tb-mode">Tipo di domande<select id="tb-mode">
          ${Object.entries(modes).map(([id, label]) => `<option value="${id}" ${id === mode ? "selected" : ""}
            ${id === "listen" && !TankWords.canListen() ? "disabled" : ""}>${label}</option>`).join("")}
        </select></label>
        <button class="tb-button primary" id="tb-start">Entra nell’arena <span>▶</span></button>
      </div>
      <div class="tb-actions">
        <button class="tb-button" id="tb-hangar">Scegli il carro · ${tank.name}</button>
        <button class="tb-button" id="tb-stats">Statistiche e classifica</button>
        ${errors.length ? `<button class="tb-button" id="tb-review">Ripassa gli errori · ${errors.length}</button>` : ""}
      </div>
      <details class="tb-guide"><summary>Come si gioca</summary>
        <p>Ogni traduzione giusta lancia un colpo e carica energia. Dopo 3 risposte esatte di fila aumentano i danni. A 5, il prossimo speciale si potenzia. Rispondi entro 2,3 s per il bonus di precisione.</p>
        <p>Lo speciale costa ${specialCost} energia. Vinci con un KO o, dopo 90 s, conservando la percentuale di HP più alta. Su tastiera usa 1–4 per rispondere, E per lo speciale e R per riascoltare.</p>
        <p>Le domande possono essere dal greco all’italiano, dall’italiano al greco oppure di ascolto: scegli il tipo qui sopra. Le parole che sbagli tornano più spesso nei duelli successivi, finché non le azzecchi.</p>
      </details>
      <dl class="tb-stat-grid">${stat("Duelli giocati", Number(progress.games))}${stat("Vittorie", Number(progress.wins))}${stat("Esperienza", Number(progress.xp) + " PE")}</dl>
      <div class="tb-milestone">${nextGoal(progress)}</div>
      <h2 class="tb-heading" id="tb-roster" tabindex="-1">Hangar dell’Olimpo</h2>
      <div class="tb-roster">${tanks.map((entry) => roster(entry, progress, tank)).join("")}</div>`);
    TankArena.scene($("#tb-cover"), true)(showcase(tank, tank === tanks[3] ? tanks[2] : tanks[3]));
    view.querySelectorAll("[data-portrait]").forEach((canvas) =>
      TankArena.portrait(canvas, tanks.find((entry) => entry.id === canvas.dataset.portrait)));
    bind("home", () => go("home"));
    bind("hangar", () => { focus("roster"); $("#tb-roster").scrollIntoView(); });
    bind("start", () => start(tank, $("#tb-difficulty").value, $("#tb-mode").value));
    bind("stats", stats);
    if (errors.length) bind("review", () => review(errors));
    $("#tb-difficulty").onchange = (event) => TankProgress.update({ difficulty: event.target.value });
    $("#tb-mode").onchange = (event) => TankProgress.update({ mode: event.target.value });
    view.querySelectorAll("[data-select]:not(:disabled)").forEach((button) => {
      button.onclick = () => {
        TankProgress.update({ selected: button.dataset.select });
        hub(button.dataset.select);
      };
    });
    if (focusTank) view.querySelector(`[data-select="${focusTank}"]`).focus();
    else focus("title");
  }

  function hud(unit, side, label) {
    return `<div class="tb-fighter ${side}"><div class="tb-identity"><small>${label} · LV ${unit.tank.level}</small>
      <strong>${unit.tank.name}</strong></div><div class="tb-hp"><span id="tb-${side}-hp"></span>
      <progress id="tb-${side}-bar" max="${unit.tank.hp}" value="${unit.hp}" aria-label="Salute ${label.toLowerCase()}"></progress></div>
      <small id="tb-${side}-count"></small></div>`;
  }
  function updateText(el, text) { if (el.textContent !== text) el.textContent = text; }
  function updateValue(el, value) { if (el.value !== value) el.value = value; }

  function start(tank, difficulty, mode = modeOf(TankProgress.get())) {
    // Solo il mazzo del giocatore pesca le parole sbagliate e usa i tipi di domanda scelti: il bot resta classico.
    const match = TankRules.duel({ tank, difficulty, nextPlayer: TankWords.deck(difficulty, { weak: true, mode }), nextBot: TankWords.deck(difficulty) });
    screen(`<div class="tb-top"><button class="tb-link" id="tb-quit">‹ Lascia il duello</button>
      <span>DUELLO · ${difficulties[difficulty].name.toUpperCase()}</span></div>
      <div class="tb-combat" aria-label="Duello nell’arena">
        <div class="tb-hud">${hud(match.player, "player", "TU")}
          <div class="tb-clock" id="tb-clock" aria-label="Tempo rimanente"></div>${hud(match.bot, "bot", "BOT")}</div>
        <div class="tb-arena"><canvas id="tb-arena" role="img" aria-label="Arena del duello con proiettili e impatti"></canvas>
          <div id="tb-event" class="tb-event" role="status" hidden></div></div>
        <div class="tb-controls">
          <div class="tb-charge"><span id="tb-charge-text"></span><progress id="tb-energy" max="100" value="0" aria-label="Energia speciale"></progress></div>
          <button class="tb-button primary" id="tb-special" aria-disabled="true">${tank.special}<small id="tb-special-status"></small></button>
        </div>
      </div>
      <section class="tb-quiz" aria-labelledby="tb-prompt">
        <div class="tb-quiz-top"><span id="tb-prompt">SCEGLI LA TRADUZIONE</span><span id="tb-qtime"></span></div>
        <progress id="tb-question-bar" aria-label="Tempo per la domanda"></progress>
        <h1 id="tb-word" lang="el" tabindex="-1" aria-live="polite"></h1>
        <button type="button" class="tb-button tb-replay" id="tb-replay" hidden>🔊 Riascolta</button>
        <div class="tb-answers">${Array.from({ length: 4 }, (_, i) =>
          `<button type="button" class="tb-answer"><span>${i + 1}</span><strong></strong></button>`).join("")}</div>
        <p class="tb-feedback" id="tb-feedback" role="status"></p>
      </section>`);
    const paint = TankArena.scene($("#tb-arena"));
    const elements = Object.fromEntries([...view.querySelectorAll("[id^=tb-]")].map((el) => [el.id.slice(3), el]));
    const choices = [...view.querySelectorAll(".tb-answer")];
    const events = battleEvents = new AbortController(), { signal } = events;
    let shown, last = performance.now();
    const { player, bot } = match;

    function update() {
      updateText(elements.clock, timeText(duration - match.now));
      for (const [side, unit] of [["player", player], ["bot", bot]]) {
        updateText(elements[side + "-hp"], `${unit.hp}/${unit.tank.hp} HP`);
        updateValue(elements[side + "-bar"], unit.hp);
        updateText(elements[side + "-count"], `${unit.correct}/${unit.correct + unit.wrong} esatte`);
      }
      const armed = player.energy >= specialCost;
      elements.special.setAttribute("aria-disabled", String(!armed));
      elements.special.classList.toggle("is-charged", armed);
      updateValue(elements.energy, player.energy);
      updateText(elements["charge-text"], `Energia ${player.energy}/100 · Serie ×${player.combo}${player.combo >= 3 ? " ⚡" : ""}`);
      updateText(elements["special-status"], player.charged ? "Potenziato · " + (armed ? "pronto" : "60 energia") : armed ? "Pronto · E" : "60 energia");
      const notice = match.notice?.until > match.now;
      elements.event.hidden = !notice;
      updateText(elements.event, notice ? match.notice.label : "");
      updateText(elements.feedback, match.feedback || " ");
      const q = player.question;
      if (q !== shown) {
        shown = q;
        updateText(elements.prompt, q ? promptText[q.kind] + " · " + tierNames[q.tier].toUpperCase() : "RIARMO IN CORSO");
        if (q) {
          const listen = q.kind === "listen";
          updateText(elements.word, listen ? "🔊 Ascolta" : q.kind === "it2gr" ? q.w.it : q.w.gr);
          elements.word.lang = q.kind === "gr2it" ? "el" : "it";
          elements.word.classList.toggle("is-italian", q.kind !== "gr2it"); // l'italiano può essere lungo: carattere più piccolo
          elements.replay.hidden = !listen;
          if (listen) speak(q.w.gr);
        }
        choices.forEach((button, i) => {
          button.setAttribute("aria-disabled", String(!q));
          if (q) {
            updateText(button.lastElementChild, q.opts[i]);
            button.lastElementChild.lang = q.kind === "it2gr" ? "el" : "it";
            button.classList.remove("is-right", "is-wrong");
          } else {
            const a = match.answers.at(-1);
            const option = button.lastElementChild.textContent;
            button.classList.toggle("is-right", a.answer === option);
            button.classList.toggle("is-wrong", !a.ok && a.choice === option);
          }
        });
      }
      if (q) {
        const time = player.deadline - match.now;
        elements["question-bar"].max = player.deadline - player.asked;
        updateValue(elements["question-bar"], time);
        updateText(elements.qtime, Math.ceil(time / 1000) + " s");
      } else {
        updateValue(elements["question-bar"], 0);
        updateText(elements.qtime, " ");
      }
    }

    function sync(stamp) {
      if (!document.hidden) match.advance(match.now + Math.max(0, stamp - last));
      last = stamp;
      if (match.outcome) {
        finish(match, difficulty);
        return false;
      }
      return true;
    }
    function tick(stamp) {
      if (!sync(stamp)) return;
      update();
      paint(match);
      frame = requestAnimationFrame(tick);
    }
    function choose(i) {
      const question = shown;
      if (sync(performance.now()) && question && match.answer(question, question.opts[i])) update();
    }
    function special() {
      if (sync(performance.now()) && match.special()) update();
    }
    function replay() {
      if (shown?.kind === "listen") speak(shown.w.gr);
    }
    document.addEventListener("visibilitychange", () => { last = performance.now(); }, { signal });
    window.addEventListener("pageshow", () => { last = performance.now(); }, { signal });
    document.addEventListener("keydown", (event) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (/^[1-4]$/.test(event.key)) choose(Number(event.key) - 1);
      else if (event.key.toLowerCase() === "e") special();
      else if (event.key.toLowerCase() === "r") replay();
    }, { signal });
    bind("quit", hub);
    bind("special", special);
    bind("replay", replay);
    choices.forEach((button, i) => { button.onclick = () => choose(i); });
    update();
    paint(match);
    focus("word");
    frame = requestAnimationFrame(tick);
  }

  function answerRows(list) {
    return list.length ? `<ul class="tb-words">${list.map(({ word, choice, ok }) => `<li>
      <strong lang="el">${esc(word.gr)}</strong><span>${esc(word.it)}</span>
      ${ok ? "" : `<small>${choice === null ? "Tempo scaduto" : "Hai scelto " + esc(choice)}</small>`}</li>`).join("")}</ul>`
      : "<p>Nessuna parola in questa sezione.</p>";
  }
  function finish(match, difficulty) {
    const { progress, xp, accuracy, average, rewards } = TankProgress.record(match, difficulty);
    const { player, bot, outcome, answers } = match;
    const misses = answers.filter((a) => !a.ok);
    const wreck = outcome === "win" ? bot : outcome === "loss" ? player : null;
    screen(`${header("Hangar")}
      <section class="tb-result ${outcome}">
        <canvas id="tb-result-arena" role="img" aria-label="Arena al termine del duello"></canvas>
        <div class="tb-result-copy"><span class="tb-kicker">${match.reason === "ko" ? "DUELLO DECISO PER KO" : "TEMPO SCADUTO"}</span>
          <h1 id="tb-result" tabindex="-1">${outcomes[outcome]}</h1><p>+${xp} PE · Tu ${player.hp}/${player.tank.hp} HP · Bot ${bot.hp}/${bot.tank.hp} HP</p></div>
      </section>
      ${rewards.length ? `<p class="tb-reward" role="status">Nuovo carro sbloccato · ${rewards.map((tank) => tank.name).join(", ")}</p>` : ""}
      <dl class="tb-stat-grid">${stat("Corrette", player.correct)}${stat("Errori e scadute", player.wrong)}
        ${stat("Accuratezza", accuracy + "%")}${stat("Tempo medio", average === null ? "—" : (average / 1000).toFixed(1).replace(".", ",") + " s")}
        ${stat("Serie migliore", player.best)}${stat("Corrette bot", bot.correct)}</dl>
      <div class="tb-milestone">${nextGoal(progress)}</div>
      <div class="tb-actions"><button class="tb-button primary" id="tb-again">Nuovo duello</button>
        ${misses.length ? `<button class="tb-button" id="tb-review">Ripassa le parole sbagliate</button>` : ""}
        <button class="tb-button" id="tb-stats">Statistiche</button></div>
      <details class="tb-guide" ${misses.length ? "open" : ""}><summary>Da ripassare · ${misses.length}</summary>${answerRows(misses)}</details>
      <details class="tb-guide"><summary>Parole indovinate · ${player.correct}</summary>${answerRows(answers.filter((a) => a.ok))}</details>`);
    const paint = TankArena.scene($("#tb-result-arena"), true);
    const begin = performance.now();
    function animate(stamp) {
      const elapsed = Math.min(1350, Math.max(0, stamp - begin));
      paint(match, match.now + elapsed, wreck);
      if (elapsed < 1350) frame = requestAnimationFrame(animate);
    }
    paint(match, match.now, wreck);
    if (!TankArena.reduced.matches) frame = requestAnimationFrame(animate);
    bind("again", () => start(player.tank, difficulty));
    bind("hub", hub);
    bind("stats", stats);
    if (misses.length) bind("review", () => review(misses.map((a) => a.word)));
    focus("result");
  }

  function review(words) {
    const unique = [...new Map(words.map((word) => [word.id, word])).values()];
    leave();
    window.scrollTo(0, 0);
    runTest(unique.map((word) => {
      const { opts } = TankWords.question(word);
      return { w: word, opts, ans: word.it, main: word.gr, spk: word.gr, say: word.gr,
        prompt: "Che cosa significa?", after: `<b>${esc(word.gr)}</b> = ${esc(word.it)}` };
    }), {
      title: "Ripasso dall’arena", onExit: () => hub(),
      onEnd: ({ score, total }) => {
        screen(`${header("Hangar")}<h1 id="tb-review-done" tabindex="-1">Ripasso completato</h1>
          <p>${score} risposte corrette su ${total}.</p><button class="tb-button primary" id="tb-return">Torna all’hangar</button>`);
        bind("hub", hub);
        bind("return", hub);
        focus("review-done");
      }
    });
  }

  function stats() {
    const p = TankProgress.get();
    const favorite = [...tanks].sort((a, b) => (p.uses[b.id] || 0) - (p.uses[a.id] || 0))[0];
    screen(`${header("Hangar")}<h1 id="tb-stats-title" tabindex="-1">Statistiche personali</h1>
      <dl class="tb-stat-grid">${stat("Partite", Number(p.games))}${stat("Vittorie", Number(p.wins))}${stat("Sconfitte", Number(p.losses))}
      ${stat("Pareggi", Number(p.draws))}${stat("Vittorie %", percent(p.wins, p.games) + "%")}${stat("Corrette totali", Number(p.correct))}
      ${stat("Migliore serie", Number(p.best))}${stat("Carro preferito", p.uses[favorite.id] ? favorite.name : "—")}${stat("Esperienza", Number(p.xp) + " PE")}</dl>
      <h2 class="tb-heading">Classifica personale</h2>
      <p>I 10 migliori duelli per esperienza, con accuratezza e risposte corrette come spareggio.</p>
      ${p.records.length ? `<ol class="tb-records">${p.records.map((r) => `<li>
        <div><strong>${outcomes[r.outcome] || "Duello"} · ${tanks.find((tank) => tank.id === r.tank)?.name || "—"}</strong>
          <small>${esc(difficulties[r.difficulty]?.name || "—")} · ${Number(r.accuracy)}% · ${Number(r.correct)} corrette</small></div>
        <b>${Number(r.xp)} PE</b></li>`).join("")}</ol>` : "<p>Completa il tuo primo duello per entrare in classifica.</p>"}`);
    bind("hub", hub);
    focus("stats-title");
  }

  return { hub, leave };
})();