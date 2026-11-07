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
    catalog = { all, accepted, tiers: TankRules.tierNames.map((_, tier) => all.filter((w) => w.tier === tier)) };
    return catalog;
  }

  function question(w) {
    const { all, accepted, tiers } = words();
    const seen = new Set(accepted.get(norm(w.gr)) || meanings(w.it));
    const tier = w.tier ?? all.find((entry) => entry.key === norm(w.gr))?.tier ?? 0;
    const topic = w.topic ?? w.cat;
    const opts = [w.it];
    const groups = [all.filter((entry) => entry.topic === topic), tiers[tier], all];
    for (const group of groups) {
      for (const other of shuffle(group)) {
        const keys = meanings(other.it);
        if (other.key === norm(w.gr) || keys.some((key) => seen.has(key))) continue;
        opts.push(other.it);
        keys.forEach((key) => seen.add(key));
        if (opts.length === 4) return { w, tier, opts: shuffle(opts) };
      }
    }
    throw new Error("Vocabolario insufficiente per Greek Tank Battle");
  }

  function deck(difficulty) {
    const { tiers } = words();
    let schedule = [], bags = [], last = [];
    return () => {
      if (!schedule.length) schedule = shuffle(TankRules.difficulties[difficulty].tiers);
      const tier = schedule.pop();
      if (!bags[tier]?.length) bags[tier] = shuffle(tiers[tier]);
      const eligible = bags[tier].findIndex((w) => !last.includes(w.key));
      const [w] = bags[tier].splice(Math.max(0, eligible), 1);
      last = [w.key, ...last].slice(0, 10);
      return question(w);
    };
  }

  return { deck, question };
})();
