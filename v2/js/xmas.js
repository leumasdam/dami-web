/* DAMI – vianočný režim: svetielka + jemný sneh.
   Zapne sa sám 1. 12. – 6. 1., náhľad kedykoľvek cez ?vianoce, vypnutie ?vianoce=0 alebo tlačidlom ❄ v lište.
   Ladenie polohy svetielok: ?vianoce&tune → panel s posuvníkmi vľavo dole (desktop a mobil sa ladia zvlášť). */
(() => {
  const qs = new URLSearchParams(location.search), q = qs.get("vianoce"), TUNE = qs.has("tune");
  const KEY = "dami-xmas", CKEY = "dami-xmas-cfg";
  let pref = null;
  try { if (q !== null) localStorage.setItem(KEY, q === "0" ? "off" : "on"); pref = localStorage.getItem(KEY); } catch {}
  const now = new Date(), m = now.getMonth(), d = now.getDate();
  const season = (m === 11) || (m === 0 && d <= 6);
  const on = pref === "on" || (season && pref !== "off");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* POLOHA SVETIELOK (px od vrchu stránky, pod čiernou lištou). Hodnoty z ladiaceho panela vložiť sem. */
  const DEF = {
    d: { yL: 70, yR: 190, sag: 16, seg: 170, size: 1.2, per: 3, front: 0 },
    m: { yL: 60, yR: 150, sag: 10, seg: 100, size: 1, per: 3, front: 0 },
  };
  let CFG = JSON.parse(JSON.stringify(DEF));
  if (TUNE) try { const s = JSON.parse(localStorage.getItem(CKEY) || "null"); if (s) CFG = { d: { ...DEF.d, ...s.d }, m: { ...DEF.m, ...s.m } }; } catch {}
  const mode = () => innerWidth < 761 ? "m" : "d";

  const css = `
  .topbar { position: relative; z-index: 2; }
  main { position: relative; z-index: 1; }
  body.xm-on:not(.is-scrolled) .hdr { background: transparent; }
  .xm-garland { position: absolute; left: 0; top: 0; width: 100%; z-index: 0; pointer-events: none; overflow: visible; }
  .xm-garland.is-front { z-index: 70; }
  .xm-garland svg { display: block; overflow: visible; }
  .xm-wire { fill: none; stroke: #1d1d1d; stroke-width: 1.6; }
  .xm-b .g { transition: opacity .6s; }
  .xm-b.r .g { fill: #E1251B; } .xm-b.w .g { fill: #FFD98A; } .xm-b.y .g { fill: #FFF3D6; }
  .xm-b .c { fill: #2a2a2a; }
  .xm-b.r { filter: drop-shadow(0 0 5px rgba(225,37,27,.85)); } .xm-b.w { filter: drop-shadow(0 0 6px rgba(255,200,90,.9)); } .xm-b.y { filter: drop-shadow(0 0 5px rgba(255,236,190,.95)); }
  .xm-b.off .g { opacity: .35; } .xm-b.off { filter: none; }
  .xm-snow { position: fixed; inset: 0; z-index: 45; pointer-events: none; }
  .xm-tgl { position: absolute; right: 12px; top: 50%; translate: 0 -50%; width: 30px; height: 30px; display: grid; place-items: center; border: 0; border-radius: 50%; background: rgba(255,255,255,.1); color: #fff; cursor: pointer; font-size: 16px; line-height: 1; }
  .xm-tgl:hover { background: rgba(255,255,255,.2); }
  .xm-tgl[aria-pressed="false"] { opacity: .55; }
  .xm-tune { position: fixed; left: 12px; bottom: 12px; z-index: 200; width: 290px; max-height: 80vh; overflow: auto; background: #111; color: #fff; border-radius: 12px; padding: 14px 16px; font: 500 13px/1.3 system-ui, sans-serif; box-shadow: 0 12px 40px rgba(0,0,0,.35); }
  .xm-tune h4 { margin: 0 0 4px; font-size: 14px; } .xm-tune small { color: #aaa; display: block; margin-bottom: 10px; }
  .xm-tune label { display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; margin-bottom: 8px; }
  .xm-tune input[type=range] { grid-column: 1 / -1; width: 100%; accent-color: #E1251B; }
  .xm-tune b { color: #FFD98A; font-variant-numeric: tabular-nums; }
  .xm-tune .row { display: flex; gap: 6px; margin-top: 8px; }
  .xm-tune button { flex: 1; height: 34px; border: 0; border-radius: 8px; background: #E1251B; color: #fff; font: 700 13px system-ui; cursor: pointer; }
  .xm-tune button.ghost { background: #333; }
  .xm-tune textarea { width: 100%; height: 62px; margin-top: 8px; background: #000; color: #9f9; border: 1px solid #333; border-radius: 6px; font: 11px/1.3 ui-monospace, monospace; padding: 6px; resize: none; }
  @media (max-width: 760px) { .xm-tgl { width: 24px; height: 24px; font-size: 13px; right: 6px; } .xm-tune { left: 8px; right: 8px; width: auto; bottom: calc(76px + env(safe-area-inset-bottom)); max-height: 46vh; } }
  `;

  function garland() {
    const g = document.createElement("div"); g.className = "xm-garland"; g.setAttribute("aria-hidden", "true");
    document.body.appendChild(g);
    const cols = ["r", "w", "y", "r", "w"];
    const bulb = (x, y, rot, c, s) => `<g class="xm-b ${c}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})"><rect class="c" x="-2.6" y="-1" width="5.2" height="4.6" rx="1"/><path class="g" d="M0 3.4c3.6 0 4.6 4.4 4.1 7.2-.5 2.6-2.2 4.4-4.1 4.4s-3.6-1.8-4.1-4.4C-4.6 7.8-3.6 3.4 0 3.4z"/></g>`;
    const draw = () => {
      const c = CFG[mode()], W = g.clientWidth || innerWidth;
      const top = document.querySelector(".topbar")?.offsetHeight || 0;
      const yL = top + c.yL, yR = top + c.yR, H = Math.max(yL, yR) + c.sag + 40;
      const n = Math.ceil(W / c.seg) + 1; let path = "", bulbs = "", k = 0;
      for (let i = 0; i < n; i++) {
        const x0 = i * c.seg, x1 = x0 + c.seg, y0 = yL + (yR - yL) * (x0 / W), y1 = yL + (yR - yL) * (x1 / W), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + c.sag;
        path += `${i ? "" : `M${x0} ${y0.toFixed(1)}`} Q${cx} ${cy.toFixed(1)} ${x1} ${y1.toFixed(1)} `;
        for (let j = 1; j <= c.per; j++) {
          const t = j / (c.per + 1);
          const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1;
          const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
          bulbs += bulb(x, y, Math.atan2(dy, dx) * 180 / Math.PI * .4, cols[k++ % cols.length], c.size);
        }
      }
      g.classList.toggle("is-front", !!c.front);
      g.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><path class="xm-wire" d="${path}"/>${bulbs}</svg>`;
    };
    draw(); let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(draw, 150); });
    if (!reduce) setInterval(() => { const b = g.querySelectorAll(".xm-b"); for (let i = 0; i < Math.max(2, b.length / 8); i++) b[Math.floor(Math.random() * b.length)]?.classList.toggle("off"); }, 700);
    g.redraw = draw;
    return g;
  }

  function tuner(gl) {
    const P = [["yL", "Ľavý koniec (výška)", 0, 700, 1], ["yR", "Pravý koniec (výška)", 0, 700, 1], ["sag", "Prehnutie oblúka", 0, 80, 1], ["seg", "Dĺžka oblúka", 60, 400, 5], ["size", "Veľkosť žiaroviek", .5, 2.5, .05], ["per", "Žiaroviek na oblúk", 1, 8, 1]];
    const box = document.createElement("div"); box.className = "xm-tune";
    const render = () => {
      const md = mode(), c = CFG[md];
      box.innerHTML = `<h4>Svetielka – ${md === "d" ? "počítač" : "mobil"}</h4><small>Ťahaj posuvníky. Mobil a počítač sa ladia zvlášť (zmeň šírku okna).</small>
        ${P.map(([k, t, a, b, s]) => `<label>${t}<b data-v="${k}">${c[k]}</b><input type="range" min="${a}" max="${b}" step="${s}" value="${c[k]}" data-k="${k}"></label>`).join("")}
        <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-front ${c.front ? "checked" : ""}> Pred obsahom (inak za obsahom)</label>
        <div class="row"><button data-copy>Kopírovať nastavenie</button><button class="ghost" data-reset>Pôvodné</button></div>
        <textarea readonly data-out></textarea>`;
      out();
    };
    const out = () => { box.querySelector("[data-out]").value = JSON.stringify(CFG); try { localStorage.setItem(CKEY, JSON.stringify(CFG)); } catch {} };
    box.addEventListener("input", e => {
      const c = CFG[mode()];
      if (e.target.dataset.k) { c[e.target.dataset.k] = +e.target.value; box.querySelector(`[data-v="${e.target.dataset.k}"]`).textContent = e.target.value; }
      if (e.target.matches("[data-front]")) c.front = e.target.checked ? 1 : 0;
      gl.redraw(); out();
    });
    box.addEventListener("click", e => {
      if (e.target.matches("[data-copy]")) { const t = box.querySelector("[data-out]"); t.select(); navigator.clipboard?.writeText(t.value).catch(() => document.execCommand("copy")); e.target.textContent = "Skopírované ✓"; setTimeout(() => e.target.textContent = "Kopírovať nastavenie", 1500); }
      if (e.target.matches("[data-reset]")) { CFG[mode()] = { ...DEF[mode()] }; render(); gl.redraw(); }
    });
    let lm = mode(); addEventListener("resize", () => { if (mode() !== lm) { lm = mode(); render(); } });
    document.body.appendChild(box); render();
    return box;
  }

  function snow() {
    if (reduce) return null;
    const c = document.createElement("canvas"); c.className = "xm-snow"; c.setAttribute("aria-hidden", "true"); document.body.appendChild(c);
    const x = c.getContext("2d"); let W, H, F = [], raf, dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => { W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = W < 760 ? 34 : 70; while (F.length < n) F.push(flake(true)); F.length = n; };
    const flake = init => ({ x: Math.random() * W, y: init ? Math.random() * H : -10, r: 1.4 + Math.random() * 2.6, s: .25 + Math.random() * .55, w: Math.random() * 6.28, a: .55 + Math.random() * .4 });
    const tick = () => {
      x.clearRect(0, 0, W, H);
      for (const f of F) {
        f.y += f.s; f.w += .012; f.x += Math.sin(f.w) * .35;
        if (f.y > H + 10) Object.assign(f, flake(false));
        x.beginPath(); x.arc(f.x, f.y, f.r, 0, 6.283);
        x.fillStyle = `rgba(255,255,255,${f.a})`; x.fill();
        x.lineWidth = .8; x.strokeStyle = `rgba(120,135,150,${f.a * .45})`; x.stroke();
      }
      raf = requestAnimationFrame(tick);
    };
    size(); addEventListener("resize", size); tick();
    document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden && c.isConnected) tick(); });
    return { el: c, stop: () => { cancelAnimationFrame(raf); c.remove(); } };
  }

  function start() {
    const bar = document.querySelector(".topbar"); if (!bar) return;
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    const btn = document.createElement("button"); btn.className = "xm-tgl"; btn.type = "button"; btn.textContent = "❄";
    bar.appendChild(btn);
    let gl = null, sn = null, tn = null;
    const set = v => {
      btn.setAttribute("aria-pressed", v); btn.setAttribute("aria-label", v ? "Vypnúť vianočný režim" : "Zapnúť vianočný režim"); btn.title = btn.getAttribute("aria-label");
      document.body.classList.toggle("xm-on", v);
      if (v) { gl = gl || garland(); sn = sn || snow(); if (TUNE && !tn) tn = tuner(gl); } else { gl?.remove(); gl = null; sn?.stop(); sn = null; tn?.remove(); tn = null; }
      try { localStorage.setItem(KEY, v ? "on" : "off"); } catch {}
    };
    btn.onclick = () => set(btn.getAttribute("aria-pressed") !== "true");
    set(on || TUNE);
  }
  (season || pref !== null || TUNE) && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start());
})();
