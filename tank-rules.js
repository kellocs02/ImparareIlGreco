// Motore del duello. Il tempo è espresso in millisecondi di gioco attivo.
const TankRules = (() => {
  const duration = 90000, specialCost = 60;
  const tanks = [
    { id: "hermes", name: "Hermes", level: 1, hp: 100, attack: 9, armor: 0, speed: 5, range: 0,
      color: "#6dac72", trim: "#d29a68", special: "Doppio colpo", description: "Due proiettili consecutivi", wins: 0, xp: 0 },
    { id: "ares", name: "Ares", level: 2, hp: 106, attack: 12, armor: 0.10, speed: 3, range: 0,
      color: "#b64d45", trim: "#e9aa75", special: "Colpo devastante", description: "Una granata pesante che perfora la corazza", wins: 2, xp: 0 },
    { id: "poseidon", name: "Poseidon", level: 3, hp: 116, attack: 10, armor: 0.17, speed: 2, range: 36,
      color: "#3679aa", trim: "#f0c27d", special: "Onda d’urto", description: "Un’onda ad area rallenta il riarmo per 5 s", wins: 5, xp: 650 },
    { id: "zeus", name: "Zeus", level: 4, hp: 126, attack: 13, armor: 0.23, speed: 3, range: 0,
      color: "#d9a740", trim: "#fff0a8", special: "Fulmine divino", description: "Una scarica elettrica che ignora la corazza", wins: 10, xp: 1500, hardWins: 2 }
  ];
  const difficulties = {
    easy: { name: "Facile", time: 11000, speed: [6000, 8600], correct: 5, tiers: [0, 0, 0, 1], tank: 0 },
    normal: { name: "Normale", time: 9500, speed: [4100, 6300], correct: 7, tiers: [0, 1, 1, 2], tank: 1 },
    hard: { name: "Difficile", time: 8000, speed: [2400, 4350], correct: 9, tiers: [1, 2, 2, 2], tank: 2 }
  };
  const tierNames = ["Base", "Intermedia", "Avanzata"];
  // Tipo di domande: miste, solo greco → italiano, solo italiano → greco, solo ascolto.
  const modes = { mixed: "Miste", classic: "Greco → italiano", reverse: "Italiano → greco", listen: "Ascolto" };
  const events = ["Pioggia di meteoriti", "Scudo divino", "Ira di Zeus", "Velocità divina"];
  const range = (min, max) => min + Math.random() * (max - min);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  function position(unit, isBot, now) {
    const slowed = unit.slow > now;
    const drift = Math.sin(now * (0.00065 + unit.tank.speed * 0.00012) + (isBot ? 2 : 0));
    return { x: (isBot ? 607 : 211) + drift * (slowed ? 5 : 22), y: 217 + drift * (slowed ? 7 : 38) };
  }
  const fighter = (tank) => ({
    tank, hp: tank.hp, energy: 0, combo: 0, best: 0, correct: 0, wrong: 0, charged: false,
    question: null, ready: 0, deadline: Infinity, response: Infinity, shield: 0, rage: 0, slow: 0
  });

  function duel({ tank, difficulty, nextPlayer, nextBot }) {
    const rules = difficulties[difficulty];
    const enemy = tanks[Math.min(tanks.length - 1, Math.max(rules.tank, tank.level - 1))];
    const player = fighter(tank), bot = fighter(enemy);
    const match = {
      player, bot, now: 0, shots: [], effects: [], answers: [], outcome: null, reason: null,
      notice: null, feedback: null, advance, answer, special
    };
    let nextEvent = range(23000, 34000), eventCount = 0, bonusTime = 0, accuracyBag = [];
    let botSpecial = Infinity;

    function ask(unit, next, cpu) {
      const q = next();
      const limit = rules.time + (match.now < bonusTime ? 3000 : 0);
      unit.question = q;
      unit.asked = match.now;
      unit.ready = Infinity;
      unit.deadline = match.now + limit;
      if (cpu) unit.response = match.now + range(...rules.speed);
    }

    function fire(unit, power, kind = "shell", delay = 0, pierce = 0, splash = unit.tank.range) {
      const start = match.now + delay;
      const travel = { shell: 720 - unit.tank.speed * 68, heavy: 575, wave: 640, bolt: 260 }[kind];
      const target = unit === player ? bot : player;
      // Poseidon bombarda una zona dell'arena. Gli altri colpi seguono il bersaglio.
      const aim = unit.tank.range ? position(target, target === bot, match.now) : null;
      match.shots.push({ unit, target, power, start, end: start + travel, kind, pierce, splash, aim });
    }

    function resolve(unit, choice) {
      const q = unit.question, elapsed = match.now - unit.asked, ok = choice === q.answer;
      const timeout = choice === null;
      unit.question = null;
      unit.response = unit.deadline = Infinity;
      const rearm = 1840 - unit.tank.speed * 135;
      unit.ready = match.now + rearm * (match.now < unit.slow ? 1.65 : 1);
      if (ok) {
        // Nell'ascolto il tempo include la pronuncia della parola: un po' di margine in più.
        const quick = elapsed <= 2300 + (q.kind === "listen" ? 1200 : 0);
        unit.best = Math.max(unit.best, ++unit.combo);
        unit.correct++;
        if (unit.combo === 5) unit.charged = true;
        const power = unit.tank.attack * (1 + q.tier * 0.12 + (quick ? 0.18 : 0) + (unit.combo >= 3 ? 0.24 : 0));
        unit.energy = Math.min(100, unit.energy + 16 + q.tier * 3 + (quick ? 3 : 0));
        fire(unit, power * (match.now < unit.rage ? 1.30 : 1));
        if (unit === player) {
          // Nelle domande inverse e nell'ascolto mostro la coppia completa, per fissarla.
          match.feedback = (quick ? "Colpo di precisione!" : "Colpo a segno in arrivo!") +
            (q.kind === "gr2it" ? "" : " · " + q.w.gr + " = " + q.w.it);
        }
      } else {
        unit.combo = 0;
        unit.wrong++;
        if (unit === player) match.feedback = (timeout ? "Tempo scaduto" : "Risposta errata") + " · " + q.w.gr + " = " + q.w.it;
      }
      if (unit === player) match.answers.push({ word: q.w, ok, elapsed, choice, timeout, kind: q.kind, answer: q.answer });
      else if (unit.energy >= specialCost && botSpecial === Infinity) {
        botSpecial = match.now + (difficulty === "easy" ? range(6000, 10500) : range(650, 1400));
      }
    }

    function special(unit = player) {
      if (match.outcome || unit.energy < specialCost) return false;
      unit.energy -= specialCost;
      const power = (unit.charged ? 1.42 : 1) * (match.now < unit.rage ? 1.30 : 1);
      unit.charged = false;
      switch (unit.tank.id) {
        case "hermes":
          fire(unit, 11 * power);
          fire(unit, 11 * power, "shell", 160);
          break;
        case "ares": fire(unit, 31 * power, "heavy", 0, 0.6, 35); break;
        case "poseidon": fire(unit, 25 * power, "wave", 0, 0, 72); break;
        case "zeus": fire(unit, 37 * power, "bolt", 0, 1, 50); break;
      }
      if (unit === player) match.feedback = unit.tank.special + "!";
      return true;
    }

    function botAnswer() {
      // Una quota esatta su dieci tentativi, in ordine mescolato a ogni ciclo.
      if (!accuracyBag.length) {
        accuracyBag = shuffle(Array.from({ length: 10 }, (_, i) => i < rules.correct));
      }
      const q = bot.question;
      resolve(bot, accuracyBag.pop() ? q.answer : pick(q.opts.filter((it) => it !== q.answer)));
    }

    function useBotSpecial() {
      botSpecial = Infinity;
      if (player.shield > match.now && difficulty !== "easy") {
        botSpecial = player.shield + 150;
      } else if (difficulty === "hard" && !bot.charged && bot.combo >= 3 &&
        bot.energy < 92 && bot.hp > 35 && player.hp > 28 && duration - match.now > 12000) {
        botSpecial = match.now + 1300;
      } else {
        special(bot);
      }
    }

    function event() {
      const index = Math.floor(Math.random() * events.length);
      let label = events[index];
      if (index === 0) {
        for (const unit of [player, bot]) {
          unit.hp = Math.max(0, unit.hp - 8);
          match.effects.push({ unit, kind: "meteor", start: match.now, splash: 50 });
        }
        label += " · −8 HP a entrambi";
      } else if (index === 1) {
        const unit = pick([player, bot]);
        unit.shield = match.now + 6500;
        label += " · " + (unit === player ? "il tuo carro" : "il rivale") + " subisce il 65% di danni in meno";
      } else if (index === 2) {
        player.rage = bot.rage = match.now + 7000;
        label += " · +30% danni per entrambi";
      } else {
        bonusTime = match.now + 8000;
        for (const unit of [player, bot]) {
          if (unit.question) unit.deadline += 3000;
        }
        label += " · +3 s alle domande";
      }
      match.notice = { label, until: match.now + 7000 };
      nextEvent = ++eventCount < 2 ? match.now + range(25000, 34000) : Infinity;
    }

    function impact(shot) {
      const { target, kind, power, pierce, splash, aim } = shot;
      const p = position(target, target === bot, match.now);
      const distance = aim ? Math.hypot(p.x - aim.x, p.y - aim.y) : 0;
      const areaFactor = aim ? Math.max(0, 1 - 0.30 * distance / splash) : 1;
      const shield = match.now < target.shield;
      const damage = aim && distance > splash ? 0 : Math.max(1,
        Math.round(power * areaFactor * (1 - target.tank.armor * (1 - pierce)) * (shield ? 0.35 : 1)));
      target.hp = Math.max(0, target.hp - damage);
      if (kind === "wave" && damage) {
        target.slow = match.now + 5000;
        if (Number.isFinite(target.ready)) target.ready += 650;
      }
      match.effects.push({ unit: target, kind, start: match.now, splash, damage, shield, aim });
    }

    function finish() {
      const ko = !player.hp || !bot.hp;
      const difference = player.hp * bot.tank.hp - bot.hp * player.tank.hp;
      match.reason = ko ? "ko" : "time";
      match.outcome = difference > 0 ? "win" : difference < 0 ? "loss" : "draw";
      for (const unit of [player, bot]) {
        if (!unit.hp) match.effects.push({ unit, kind: "wreck", start: match.now, splash: 70 });
      }
    }

    function advance(to) {
      while (!match.outcome && to > match.now) {
        const hit = match.shots.reduce((soonest, shot) => Math.min(soonest, shot.end), Infinity);
        match.now = Math.min(to, duration, player.ready, bot.ready, player.deadline, bot.response, hit, nextEvent, botSpecial);
        if (hit === match.now) {
          match.shots = match.shots.filter((shot) => {
            if (shot.end !== match.now) return true;
            impact(shot);
            return false;
          });
        }
        if (nextEvent === match.now) event();
        if (player.deadline === match.now) resolve(player, null);
        if (!player.hp || !bot.hp || match.now === duration) finish();
        if (match.outcome) break;
        if (bot.response === match.now) botAnswer();
        if (botSpecial === match.now) useBotSpecial();
        if (player.ready === match.now) ask(player, nextPlayer, false);
        if (bot.ready === match.now) ask(bot, nextBot, true);
      }
      match.effects = match.effects.filter((effect) => effect.start + 950 > match.now);
    }

    function answer(question, choice) {
      if (match.outcome || !question || player.question !== question || !question.opts.includes(choice)) return false;
      resolve(player, choice);
      return true;
    }

    ask(player, nextPlayer, false);
    ask(bot, nextBot, true);
    return match;
  }

  return { tanks, difficulties, duration, specialCost, tierNames, modes, duel, position };
})();