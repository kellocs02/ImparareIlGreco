// Avviso "nuova versione disponibile" e tastiera greca in tutti i campi di risposta scritta.
(function () {
  const st = document.createElement("style");
  st.textContent = `#upd{position:fixed;left:16px;right:16px;bottom:94px;z-index:20;display:flex;gap:10px;align-items:center;background:var(--ink);color:var(--bg);border-radius:12px;padding:12px 14px;font-size:14px}
#upd span{flex:1}#upd button{border:0;border-radius:8px;padding:8px 12px;font-weight:600;background:var(--gold);color:#0b1c26}#upd button.l{background:none;color:var(--bg);font-weight:400}
.kbt{margin-top:10px;text-align:center}.kbt button{border:1px solid var(--line);border-radius:999px;background:none;padding:6px 12px;font-size:13px;color:var(--muted)}`;
  document.head.appendChild(st);

  // ---------- Avviso di nuova versione ----------
  if ("serviceWorker" in navigator) {
    let had = !!navigator.serviceWorker.controller;
    const banner = () => {
      if (document.getElementById("upd")) return;
      const d = document.createElement("div"); d.id = "upd";
      d.innerHTML = `<span>Nuova versione disponibile</span><button id="updGo">Aggiorna</button><button class="l" id="updNo">Dopo</button>`;
      document.body.appendChild(d);
      document.getElementById("updGo").onclick = () => location.reload();
      document.getElementById("updNo").onclick = () => d.remove();
    };
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (had) banner(); had = true; });
    navigator.serviceWorker.getRegistration().then((r) => {
      if (!r) return;
      const check = () => r.update().catch(() => {});
      document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
      setInterval(check, 3600e3);
    });
  }

  // ---------- Tastiera greca nei quiz ----------
  const KEYS = [..."αβγδεζηθικλμνξοπρστυφχψω", ..."άέήίόύώ"];
  const html = () => `<div class="kb">${KEYS.map((c) => `<button data-c="${c}">${c}</button>`).join("")}<button class="w" data-c=" ">spazio</button><button class="w" data-c="⌫">⌫</button></div><div class="kbt"><button id="kbSw">Usa la tastiera di sistema (lettere latine)</button></div>`;
  const view_ = document.getElementById("view");
  let busy = false;
  new MutationObserver(() => {
    if (busy) return;
    const box = view_.querySelector(".typebox"), inp = box && box.querySelector("input[type=text]");
    if (!inp || view_.querySelector(".kb")) return;
    busy = true;
    box.insertAdjacentHTML("afterend", html());
    let on = true, last = inp;
    inp.setAttribute("inputmode", "none");
    box.querySelectorAll("input").forEach((i) => (i.onfocus = () => (last = i)));
    view_.querySelectorAll(".kb button").forEach((b) => (b.onclick = () => { const c = b.dataset.c; last.value = c === "⌫" ? last.value.slice(0, -1) : last.value + c; }));
    const sw = document.getElementById("kbSw");
    sw.onclick = () => {
      on = !on;
      box.querySelectorAll("input").forEach((i) => i.setAttribute("inputmode", on ? "none" : "text"));
      view_.querySelector(".kb").style.display = on ? "" : "none";
      sw.textContent = on ? "Usa la tastiera di sistema (lettere latine)" : "Torna alla tastiera greca";
      if (!on) last.focus();
    };
    busy = false;
  }).observe(view_, { childList: true, subtree: true });
})();
