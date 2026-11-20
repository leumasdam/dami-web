/* DAMI – meranie: Google Tag Manager (GTM-542MMSL, v ňom Google Ads AW-465935583) + GA4 (G-HF1SNM9VH5).
   - Consent Mode v2: všetko je predvolene zamietnuté, kým návštevník neklikne na lište cookies.
   - Načíta sa LEN na ostrej doméne. Na GitHub Pages / localhoste sa nič neposiela (nekazíme klientove dáta),
     test: ?track=1 (zapne aj debug_mode → udalosti vidno v GA4 DebugView), vypnutie testu ?track=0.
   - E-commerce udalosti GA4: view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase,
     sign_up (zľava 10 %), generate_lead (dopyt pre firmy), click_phone, click_navigation. */
(() => {
  const GTM = "GTM-542MMSL", GA4 = "G-HF1SNM9VH5";
  const PROD = /(^|\.)(dami-pracovne-odevy\.sk|damiodevy\.sk|damipracovneodevy\.sk)$/i.test(location.hostname);
  const q = new URLSearchParams(location.search).get("track");
  try { if (q === "1") sessionStorage.setItem("dami-track", "1"); if (q === "0") sessionStorage.removeItem("dami-track"); } catch {}
  let TEST = false; try { TEST = sessionStorage.getItem("dami-track") === "1"; } catch {}
  const ACTIVE = PROD || TEST;

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  /* ---------- súhlas (Consent Mode v2) ---------- */
  const CK = "dami-consent";
  const saved = (() => { try { return localStorage.getItem(CK); } catch { return null; } })();
  const granted = { ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" };
  const denied = { ad_storage: "denied", analytics_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };
  gtag("consent", "default", { ...denied, functionality_storage: "granted", security_storage: "granted", wait_for_update: 500 });
  if (saved === "all") gtag("consent", "update", granted);
  if (saved === "analytics") gtag("consent", "update", { ...denied, analytics_storage: "granted" });

  if (ACTIVE) {
    gtag("js", new Date());
    gtag("config", GA4, TEST ? { debug_mode: true } : {});
    const s1 = document.createElement("script"); s1.async = true; s1.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4; document.head.appendChild(s1);
    dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s2 = document.createElement("script"); s2.async = true; s2.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM; document.head.appendChild(s2);
  }
  const ev = (name, params = {}) => { if (ACTIVE) gtag("event", name, params); if (TEST) console.info("[DAMI meranie]", name, params); };

  /* ---------- e-commerce ---------- */
  const item = (id, extra = {}) => { const p = window.DAMI?.P?.[id]; if (!p) return null;
    return { item_id: p.id, item_name: p.name, item_brand: window.DAMI.brandLabel?.(p) || "", item_category: window.DAMI.sectionOf?.(p.cats?.[0]) || "", price: p.price || 0, quantity: 1, ...extra }; };
  const cartItems = () => (window.DAMI?.cart?.() || []).map(l => item(l.id, { quantity: l.qty, item_variant: [l.size, l.color, l.logo && "logo " + l.logo].filter(Boolean).join(" / ") })).filter(Boolean);
  const sum = items => Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;

  document.addEventListener("dami:add", e => { const d = e.detail || {}; const it = item(d.id, { quantity: d.qty || 1, item_variant: [d.size, d.color, d.logo && "logo " + d.logo].filter(Boolean).join(" / ") });
    if (it) ev("add_to_cart", { currency: "EUR", value: it.price * it.quantity, items: [it] }); });
  document.addEventListener("dami:remove", e => { const it = item(e.detail?.id, { quantity: e.detail?.qty || 1 }); if (it) ev("remove_from_cart", { currency: "EUR", value: it.price * it.quantity, items: [it] }); });

  function onReady() {
    const page = (location.pathname.split("/").pop() || "index.html").replace(".html", "");
    if (page === "produkt") { const id = new URLSearchParams(location.search).get("p"); const it = item(id); if (it) ev("view_item", { currency: "EUR", value: it.price, items: [it] }); }
    if (page === "kosik") { const items = cartItems(); if (items.length) { ev("view_cart", { currency: "EUR", value: sum(items), items }); ev("begin_checkout", { currency: "EUR", value: sum(items), items }); }
      /* objednávka: košík si pamätáme priebežne, „purchase“ pošleme, keď sa zobrazí poďakovanie */
      let last = items; document.addEventListener("dami:cart", () => { const c = cartItems(); if (c.length) last = c; });
      document.addEventListener("click", () => { const c = cartItems(); if (c.length) last = c; }, true);
      new MutationObserver((_, mo) => { const done = document.querySelector(".kdone"); if (!done) return; mo.disconnect();
        ev("purchase", { currency: "EUR", transaction_id: done.querySelector(".kdone__no b")?.textContent?.trim() || String(Date.now()), value: sum(last), items: last }); })
        .observe(document.body, { childList: true, subtree: true }); }
    /* zľava 10 % – registrácia (úspech = formulár dostane .is-done) */
    const rf = document.querySelector("[data-reg]");
    if (rf) new MutationObserver(() => { if (rf.classList.contains("is-done") && !rf.dataset.sent) { rf.dataset.sent = 1; ev("sign_up", { method: "email", promotion_name: "10 % na prvý nákup" }); } }).observe(rf, { attributes: true, attributeFilter: ["class"] });
    /* dopyt pre firmy */
    document.querySelector("[data-offer]")?.addEventListener("submit", () => ev("generate_lead", { lead_source: "pre-firmy" }));
    /* telefón a navigácia */
    document.addEventListener("click", e => { const a = e.target.closest("a"); if (!a) return;
      if (a.href.startsWith("tel:")) ev("click_phone", { link_url: a.href });
      else if (/google\.[a-z.]+\/maps/.test(a.href)) ev("click_navigation", { link_url: a.href }); });
    cookieBar();
  }

  /* ---------- lišta cookies ---------- */
  function cookieBar() {
    const css = `.ckb { position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 120; max-width: 720px; margin: 0 auto; background: #141414; color: #fff; border-radius: 14px; padding: 16px 18px; display: flex; gap: 14px 18px; align-items: center; flex-wrap: wrap; box-shadow: 0 16px 40px rgba(0,0,0,.3); font: 500 14px/1.4 var(--f, system-ui); }
      .ckb p { margin: 0; flex: 1 1 320px; color: #e7e2db; } .ckb b { color: #fff; }
      .ckb__btns { display: flex; gap: 8px; flex-wrap: wrap; }
      .ckb button { height: 40px; padding: 0 16px; border-radius: 8px; border: 1.5px solid rgba(255,255,255,.5); background: transparent; color: #fff; font: 700 14px var(--f, system-ui); cursor: pointer; }
      .ckb button.ckb__all { background: var(--red, #E1251B); border-color: var(--red, #E1251B); }
      @media (max-width: 760px) { .ckb { left: 8px; right: 8px; bottom: calc(76px + env(safe-area-inset-bottom)); padding: 14px; } .ckb__btns { width: 100%; } .ckb button { flex: 1; } }`;
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    const show = () => {
      if (document.querySelector(".ckb")) return;
      const b = document.createElement("div"); b.className = "ckb"; b.setAttribute("role", "dialog"); b.setAttribute("aria-label", "Nastavenia cookies");
      b.innerHTML = `<p><b>Cookies.</b> Pomáhajú nám merať návštevnosť a ukazovať relevantné ponuky. Nevyhnutné cookies pre košík fungujú vždy.</p>
        <div class="ckb__btns"><button type="button" data-ck="none">Len nevyhnutné</button><button type="button" data-ck="analytics">Len meranie</button><button type="button" class="ckb__all" data-ck="all">Prijať všetko</button></div>`;
      b.addEventListener("click", e => { const v = e.target.closest("[data-ck]")?.dataset.ck; if (!v) return;
        try { localStorage.setItem(CK, v); } catch {}
        gtag("consent", "update", v === "all" ? granted : v === "analytics" ? { ...denied, analytics_storage: "granted" } : denied);
        b.remove(); });
      document.body.appendChild(b);
    };
    if (!saved) show();
    /* odkaz na zmenu nastavení v pätičke */
    const fb = document.querySelector(".ftr__bottom span:nth-child(2)");
    if (fb && !fb.querySelector("[data-ck-open]")) { fb.insertAdjacentHTML("beforeend", ` · <a href="#" data-ck-open>Cookies</a>`); fb.querySelector("[data-ck-open]").addEventListener("click", e => { e.preventDefault(); show(); }); }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", onReady) : onReady();
})();
