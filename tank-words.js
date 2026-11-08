// Gli ID restano quelli di WORDS e delle lezioni, anche per il ripasso successivo.
const TankWords = (() => {
  let catalog;
  const meanings = (text) => [norm(text), ...text.split(/[\/;,]/).map((part) => norm(part.replace(/\([^)]*\)/g, "")))].filter(Boolean);
  const usable = (w) => /\p{Script=Greek}/u.test(w.gr) && w.gr.length <= 38 &&
    !/[→…]/.test(w.gr) && w.it.length <= 78 && meanings(w.it).length > 0;

  function words() {
    if (catalog) return catalog;
    const base = BASE_WORDS.map((w) => ({ ...w, tier: 0, topic: w.cat }));
    const lessons = LEVELS.flatMap((level, a) => levelParts(a).flatMap((part) => wordsOf([part]).map((w) => ({
      ...w, tier: Math.min(2, Math.floor(level.n / 2)), topic: `L${a}-${part.b}`
    }))));
    const accepted = new Map(), unique = new Map();
    for (const w of [...base, ...lessons].filter(usable)) {
      const key = norm(w.gr);
      if (!accepted.has(key)) accepted.set(key, new Set());
      meanings(w.it).forEach((meaning) => accepted.get(key).add(meaning));
      if (!unique.has(key)) unique.set(key, { ...w, key });
    }
    const all = [...unique.values()];
    catalog = { all, accepted, byKey: unique, tiers: TankRules.tierNames.map((_, tier) => all.filter((w) => w.tier === tier)) };
    return catalog;
  }

  // ---------- Tipo di domanda ----------
  // gr2it: greco → italiano · it2gr: italiano → greco · listen: ascolto → italiano
  const canListen = () => Object.keys(AUDIO).length > 0 || "speechSynthesis" in window;

  function kindFor(w, mode) {
    if (mode === "reverse") return "it2gr";
    if (mode === "listen") return canListen() ? "listen" : "gr2it";
    if (mode !== "mixed") return "gr2it";
    // Miste: l'italiano → greco è più difficile, quindi compare di più ai livelli alti.
    const roll = Math.random(), tier = w.tier ?? 0;
    if (roll < [0, 0.25, 0.4][tier]) return "it2gr";
    return roll > 0.75 && canListen() ? "listen" : "gr2it";
  }

  function question(w, kind = "gr2it") {
    const { all, accepted, tiers } = words();
    const seen = new Set(accepted.get(norm(w.gr)) || meanings(w.it));
    const tier = w.tier ?? all.find((entry) => entry.key === norm(w.gr))?.tier ?? 0;
    const topic = w.topic ?? w.cat;
    const reverse = kind === "it2gr";
    const answer = reverse ? w.gr : w.it;
    const opts = [answer];
    const groups = [all.filter((entry) => entry.topic === topic), tiers[tier], all];
    for (const group of groups) {
      for (const other of shuffle(group)) {
        const keys = meanings(other.it);
        // Scarto i sinonimi: se due parole greche hanno lo stesso significato, una sola risposta deve restare giusta.
        if (other.key === norm(w.gr) || keys.some((key) => seen.has(key))) continue;
        opts.push(reverse ? other.gr : other.it);
        keys.forEach((key) => seen.add(key));
        if (opts.length === 4) return { w, tier, kind, answer, opts: shuffle(opts) };
      }
    }
    throw new Error("Vocabolario insufficiente per Greek Tank Battle");
  }

  // ---------- Parole da ripassare ----------
  // state.err[id] conta gli errori netti della parola. Qui le ritrovo nel catalogo del duello.
  function weak() {
    const { byKey } = words(), found = new Map();
    for (const [id, count] of Object.entries(state.err)) {
      const word = wordMap().get(id), entry = word && byKey.get(norm(word.gr));
      if (entry && count > 0) found.set(entry.key, { w: entry, count: Math.max(count, found.get(entry.key)?.count || 0) });
    }
    return [...found.values()];
  }

  // Una domanda su tre circa è una parola sbagliata, scelta con più probabilità se hai sbagliato più volte.
  // Le ultime 10 parole non si ripetono, quindi con pochi errori il resto del mazzo prevale da solo.
  function pickWeak(last) {
    if (Math.random() >= 0.3) return null;
    const pool = weak().filter(({ w }) => !last.includes(w.key));
    let roll = Math.random() * pool.reduce((sum, entry) => sum + entry.count, 0);
    for (const entry of pool) if ((roll -= entry.count) < 0) return entry.w;
    return null;
  }

  // Tutti gli ID di state.err che indicano la stessa parola greca (una parola può comparire in più lezioni).
  function errorIds(w) {
    const key = norm(w.gr), ids = new Set([w.id]);
    for (const id of Object.keys(state.err)) {
      const other = wordMap().get(id);
      if (other && norm(other.gr) === key) ids.add(id);
    }
    return [...ids];
  }

  function deck(difficulty, { weak: favorWeak = false, mode = "classic" } = {}) {
    const { tiers } = words();
    let schedule = [], bags = [], last = [];
    return () => {
      let w = favorWeak ? pickWeak(last) : null;
      if (!w) {
        if (!schedule.length) schedule = shuffle(TankRules.difficulties[difficulty].tiers);
        const tier = schedule.pop();
        if (!bags[tier]?.length) bags[tier] = shuffle(tiers[tier]);
        let eligible = bags[tier].findIndex((entry) => !last.includes(entry.key));
        if (eligible < 0) { // restano solo parole uscite da poco: ricomincio con un sacchetto nuovo
          bags[tier] = shuffle(tiers[tier]);
          eligible = bags[tier].findIndex((entry) => !last.includes(entry.key));
        }
        [w] = bags[tier].splice(Math.max(0, eligible), 1);
      }
      last = [w.key, ...last].slice(0, 10);
      return question(w, kindFor(w, mode));
    };
  }

  return { deck, question, errorIds, canListen };
})();
