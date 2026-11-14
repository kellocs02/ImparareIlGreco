// Test del motore del consigliere (nessun browser). Uso: node tests/arete-swap.test.js  (dalla cartella del progetto)
const assert = require("assert");
global.window = undefined;
require("../arete-data.js"); require("../arete-swap.js");
const D = globalThis.AreteData, S = globalThis.AreteSwap;
const all = D.EXERCISES.map((e, i) => Object.assign({ id: i + 1 }, e)), by = (k) => all.find((e) => e.key === k);
let n = 0; const t = (name, fn) => { fn(); n++; console.log("ok - " + name); };

t("solo stesso muscolo principale, mai l'esercizio stesso", () => {
  for (const r of S.REASONS) for (const src of all) {
    const res = S.suggest(src, all, { reason: r[0] });
    assert(res.length > 0, src.key + " senza alternative");
    res.forEach((x) => { assert.notStrictEqual(x.exercise.id, src.id); });
    const same = res.filter((x) => x.exercise.primary === src.primary);
    assert(same.length >= Math.min(3, all.filter((e) => e.primary === src.primary && e.id !== src.id).length), "poche alternative per " + src.key);
  }
});
t("ordinamento decrescente e stabile", () => {
  const r = S.suggest(by("panca-piana"), all, { reason: "similar" });
  for (let i = 1; i < r.length; i++) assert(r[i - 1].score >= r[i].score);
});
t("«Occupato»: gli attrezzi diversi stanno davanti a quello uguale", () => {
  const src = by("lat-machine"), r = S.suggest(src, all, { reason: "busy" }).slice(0, 5);
  assert(r.every((x) => x.exercise.equipment !== src.equipment), "tra i primi 5 c'è lo stesso attrezzo");
});
t("«Non ho l'attrezzo»: premia corpo libero, elastici e manubri", () => {
  const r = S.suggest(by("chest-press"), all, { reason: "noequip" }).slice(0, 3);
  assert(r.every((x) => ["Corpo libero", "Elastici", "Manubri"].includes(x.exercise.equipment)), JSON.stringify(r.map((x) => x.exercise.name)));
});
t("«Simili»: la variante dello stesso movimento sale in alto", () => {
  const r = S.suggest(by("hip-thrust-macchina"), all, { reason: "similar" }).slice(0, 3).map((x) => x.exercise.key);
  assert(r.some((k) => k.startsWith("hip-thrust")), r.join());
});
t("«Mi dà fastidio»: non mette in cima lo stesso movimento", () => {
  const r = S.suggest(by("hip-thrust-macchina"), all, { reason: "pain" }).slice(0, 3).map((x) => x.exercise.key);
  assert(!r.some((k) => k.startsWith("hip-thrust")), r.join());
});
t("preferiti e archiviati", () => {
  const c = all.map((e) => Object.assign({}, e)), src = c.find((e) => e.key === "trazioni");
  c.find((e) => e.key === "pulley-basso").archived = true;
  assert(!S.suggest(src, c).some((x) => x.exercise.key === "pulley-basso"));
  const before = S.suggest(src, c).findIndex((x) => x.exercise.key === "rematore-manubrio");
  c.find((e) => e.key === "rematore-manubrio").fav = true;
  assert(S.suggest(src, c).findIndex((x) => x.exercise.key === "rematore-manubrio") <= before);
});
t("le motivazioni sono testo non vuoto", () => { S.suggest(by("croci-cavi"), all).forEach((x) => assert(x.why && x.why.length > 10)); });
console.log(n + " test superati");
