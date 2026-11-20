/* DAMI – vianočný režim: svetielka pod čiernou lištou + jemný sneh.
   Zapne sa sám 1. 12. – 6. 1., náhľad kedykoľvek cez ?vianoce, vypnutie ?vianoce=0 alebo tlačidlom ❄ v lište. */
(() => {
  const q = new URLSearchParams(location.search).get("vianoce");
  const KEY = "dami-xmas";
  let pref = null;
  try { if (q !== null) localStorage.setItem(KEY, q === "0" ? "off" : "on"); pref = localStorage.getItem(KEY); } catch {}
  const now = new Date(), m = now.getMonth(), d = now.getDate();
  const season = (m === 11) || (m === 0 && d <= 6);
  const on = pref === "on" || (season && pref !== "off");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const css = `
  .hdr { isolation: isolate; }
  .hdr > *:not(.xm-garland) { position: relative; z-index: 1; }
  .xm-garland { position: absolute; left: calc(50% - 50vw); width: 100vw; top: 0; height: 64px; z-index: 0; pointer-events: none; overflow: visible; }
  .xm-garland svg { display: block; height: 64px; overflow: visible; }
  .xm-wire { fill: none; stroke: #1d1d1d; stroke-width: 1.6; }
  .xm-b { transform-box: fill-box; transform-origin: 50% 0; }
  .xm-b .g { transition: opacity .6s; }
  .xm-b.r .g { fill: #E1251B; } .xm-b.w .g { fill: #FFD98A; } .xm-b.y .g { fill: #FFF3D6; }
  .xm-b .c { fill: #2a2a2a; }
  .xm-b.r { filter: drop-shadow(0 0 5px rgba(225,37,27,.85)); } .xm-b.w { filter: drop-shadow(0 0 6px rgba(255,200,90,.9)); } .xm-b.y { filter: drop-shadow(0 0 5px rgba(255,236,190,.95)); }
  .xm-b.off .g { opacity: .35; } .xm-b.off { filter: none; }
  .xm-snow { position: fixed; inset: 0; z-index: 45; pointer-events: none; }
  .xm-tgl { position: absolute; right: 12px; top: 50%; translate: 0 -50%; width: 30px; height: 30px; display: grid; place-items: center; border: 0; border-radius: 50%; background: rgba(255,255,255,.1); color: #fff; cursor: pointer; font-size: 16px; line-height: 1; }
  .xm-tgl:hover { background: rgba(255,255,255,.2); }
  .xm-tgl[aria-pressed="false"] { opacity: .55; }
  @media (max-width: 760px) { .xm-tgl { width: 24px; height: 24px; font-size: 13px; right: 6px; } .xm-garland, .xm-garland svg { height: 48px; } }
  `;

  function garland(host) {
    const g = document.createElement("div"); g.className = "xm-garland"; g.setAttribute("aria-hidden", "true");
    host.prepend(g);
    const draw = () => {
      const W = g.clientWidth || innerWidth, mob = W < 760, seg = mob ? 104 : 168, H = mob ? 48 : 64;
      /* háčiky idú mierne šikmo (zľava vyššie, doprava nižšie), oblúky visia hlbšie a striedajú hĺbku */
      const n = Math.ceil(W / seg) + 1, cols = ["r", "w", "y", "r", "w"], drop = mob ? 10 : 16;
      const hook = i => 2 + drop * (i / (n - 1)) + (i % 2 ? 3 : 0);
      let path = "", bulbs = "", k = 0;
      for (let i = 0; i < n; i++) {
        const x0 = i * seg, x1 = x0 + seg, y0 = hook(i), y1 = hook(i + 1), cx = x0 + seg / 2, cy = Math.max(y0, y1) + (mob ? 22 : 30) + (i % 3) * 3;
        path += `${i ? "" : `M${x0} ${y0.toFixed(1)}`} Q${cx} ${cy} ${x1} ${y1.toFixed(1)} `;
        [0.2, 0.4, 0.6, 0.8].forEach(t => {
          const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1;
          const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
          const rot = Math.atan2(dy, dx) * 180 / Math.PI;
          bulbs += `<g class="xm-b ${cols[k++ % cols.length]}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(rot * .4).toFixed(1)})"><rect class="c" x="-2.6" y="-1" width="5.2" height="4.6" rx="1"/><path class="g" d="M0 3.4c3.6 0 4.6 4.4 4.1 7.2-.5 2.6-2.2 4.4-4.1 4.4s-3.6-1.8-4.1-4.4C-4.6 7.8-3.6 3.4 0 3.4z"/></g>`;
        });
      }
      g.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><path class="xm-wire" d="${path}"/>${bulbs}</svg>`;
    };
    draw(); let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(draw, 150); });
    if (!reduce) setInterval(() => { const b = g.querySelectorAll(".xm-b"); for (let i = 0; i < Math.max(2, b.length / 8); i++) b[Math.floor(Math.random() * b.length)]?.classList.toggle("off"); }, 700);
    return g;
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
    const bar = document.querySelector(".topbar"), hdr = document.querySelector(".hdr"); if (!bar || !hdr) return;
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    const btn = document.createElement("button"); btn.className = "xm-tgl"; btn.type = "button"; btn.textContent = "❄";
    bar.appendChild(btn);
    let gl = null, sn = null;
    const set = v => {
      btn.setAttribute("aria-pressed", v); btn.setAttribute("aria-label", v ? "Vypnúť vianočný režim" : "Zapnúť vianočný režim"); btn.title = btn.getAttribute("aria-label");
      if (v) { gl = gl || garland(hdr); sn = sn || snow(); } else { gl?.remove(); gl = null; sn?.stop(); sn = null; }
      try { localStorage.setItem(KEY, v ? "on" : "off"); } catch {}
    };
    btn.onclick = () => set(btn.getAttribute("aria-pressed") !== "true");
    set(on);
  }
  (season || pref !== null) && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start());
})();
