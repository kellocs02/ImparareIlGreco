// Una sezione del salvataggio e del backup esistenti, inizializzata anche sui vecchi backup.
const TankProgress = (() => {
  function get() {
    const stored = state.tankBattle;
    return {
      games: 0, wins: 0, losses: 0, draws: 0, correct: 0, best: 0, xp: 0, hardWins: 0,
      selected: "hermes", difficulty: "normal", mode: "mixed",
      ...(stored && typeof stored === "object" ? stored : {}),
      uses: stored?.uses || {}, records: Array.isArray(stored?.records) ? stored.records.filter((entry) => entry && typeof entry === "object") : [],
      mistakes: Array.isArray(stored?.mistakes) ? stored.mistakes : []
    };
  }

  const unlocked = (tank, progress) => progress.wins >= tank.wins && progress.xp >= tank.xp &&
    progress.hardWins >= (tank.hardWins || 0);

  function requirements(tank, progress) {
    const parts = [`${Math.min(progress.wins, tank.wins)}/${tank.wins} vittorie`];
    if (tank.xp) parts.push(`${Math.min(progress.xp, tank.xp)}/${tank.xp} PE`);
    if (tank.hardWins) parts.push(`${Math.min(progress.hardWins, tank.hardWins)}/${tank.hardWins} vittorie a Difficile`);
    return parts.join(" · ");
  }

  function update(options) {
    state.tankBattle = { ...get(), ...options };
    save();
  }

  function record(match, difficulty) {
    const progress = get();
    const { player, answers, outcome } = match;
    const correct = player.correct, accuracy = answers.length ? Math.round(correct / answers.length * 100) : 0;
    const timed = answers.filter((a) => !a.timeout);
    const average = timed.length ? timed.reduce((sum, a) => sum + a.elapsed, 0) / timed.length : null;
    const xp = correct ? Math.round((correct * 7 + player.best * 2 + { win: 45, draw: 25, loss: 10 }[outcome]) *
      { easy: 1, normal: 1.15, hard: 1.30 }[difficulty]) : 0;
    const entry = { tank: player.tank.id, difficulty, outcome, xp, correct, accuracy, best: player.best, date: Date.now() };
    const before = TankRules.tanks.filter((tank) => unlocked(tank, progress));
    progress.games++;
    progress.wins += Number(outcome === "win");
    progress.losses += Number(outcome === "loss");
    progress.draws += Number(outcome === "draw");
    progress.hardWins += Number(outcome === "win" && difficulty === "hard");
    progress.correct += correct;
    progress.best = Math.max(progress.best, player.best);
    progress.xp += xp;
    progress.uses = { ...progress.uses, [entry.tank]: (progress.uses[entry.tank] || 0) + 1 };
    if (answers.length) progress.records = [...progress.records, entry].sort((a, b) =>
      b.xp - a.xp || b.accuracy - a.accuracy || b.correct - a.correct || a.date - b.date).slice(0, 10);
    // Come nel resto dell'app: +1 se sbagli, −1 se rispondi bene (a 0 la parola esce dal ripasso).
    for (const { word, ok } of answers) {
      if (ok) {
        for (const id of TankWords.errorIds(word)) {
          if (state.err[id] > 1) state.err[id]--;
          else delete state.err[id];
        }
      } else state.err[word.id] = Math.min((state.err[word.id] || 0) + 1, 9);
    }
    const missed = answers.filter((answer) => !answer.ok).map(({ word }) => word.id);
    progress.mistakes = [...new Set([...missed, ...progress.mistakes])].filter((id) => state.err[id]);
    update(progress);
    const rewards = TankRules.tanks.filter((tank) => unlocked(tank, progress) && !before.includes(tank));
    return { progress, xp, accuracy, average, rewards };
  }

  return { get, update, record, unlocked, requirements };
})();