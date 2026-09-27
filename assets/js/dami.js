/* DAMI — zdieľané správanie: header/footer, karty, košík, obľúbené, vyhľadávanie, reveal, View Transitions */
(function () {
  const D = window.DAMI_DATA;
  const P = Object.fromEntries(D.products.map(p => [p.id, p]));

  const FIRM = {
    name: "DAMI pracovné odevy", legal: "Adriána Piknová - DAMI", ico: "40 749 797",
    street: "Gaštanová 6396", city: "921 01 Piešťany",
    phone: "0902 482 244", phone2: "0911 263 250", mail: "damiobchod@gmail.com",
    hours: [["Po – Pi", "9:30 – 17:00"], ["So", "9:00 – 12:00"], ["Ne", "Zatvorené"]],
    map: "https://www.google.com/maps/search/?api=1&query=Ga%C5%A1tanov%C3%A1+6396+Pie%C5%A1%C5%A5any",
  };

  /* ---------- ikony (stroke, 24px) ---------- */
  const I = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    heart: '<path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.4 4 4.5 7.1 4.5c2 0 3.6 1.1 4.9 3 1.3-1.9 2.9-3 4.9-3 3.1 0 5.4 2.9 4.3 6.2C19.5 15.4 12 20 12 20z"/>',
    cart: '<path d="M2.5 3.5h2.6l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.1l1.7-6.8H6.3"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    chevR: '<path d="m9 6 6 6-6 6"/>',
    chevL: '<path d="m15 6-6 6 6 6"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    truck: '<path d="M2.5 6.5h11v9.5h-11zM13.5 10h4l3 3.2V16h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    people: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.8-3.3 3.2-5 6-5s5.2 1.7 6 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M16.5 14.3c2.4.2 4 1.7 4.6 4.2"/>',
    family: '<circle cx="8" cy="7.5" r="2.8"/><circle cx="16" cy="7.5" r="2.8"/><path d="M3 19c.6-3.4 2.6-5.5 5-5.5s4.4 2.1 5 5.5M11 19c.6-3.4 2.6-5.5 5-5.5s4.4 2.1 5 5.5"/>',
    chat: '<path d="M4 5.5h16v10.5H9.5L5 20v-4H4z"/><circle cx="9" cy="10.8" r=".6"/><circle cx="12" cy="10.8" r=".6"/><circle cx="15" cy="10.8" r=".6"/>',
    box: '<path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9"/>',
    store: '<path d="M3.5 9.5 5 4.5h14l1.5 5"/><path d="M3.5 9.5c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5c0 1.4 1.1 2.5 2.5 2.5h2c1.4 0 2.5-1.1 2.5-2.5 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5"/><path d="M5 12v8.5h14V12M10 20.5v-5h4v5"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    phone: '<path d="M5 3.5h3.5l1.8 4.5-2.3 1.5a11 11 0 0 0 6.5 6.5l1.5-2.3 4.5 1.8V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.1A1.5 1.5 0 0 1 5 3.5z"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
    parking: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M9.5 16.5v-9h3.5a2.8 2.8 0 0 1 0 5.6H9.5"/>',
    tag: '<path d="M3.5 12.3V4.5c0-.6.4-1 1-1h7.8l8.2 8.2a1.4 1.4 0 0 1 0 2l-6.8 6.8a1.4 1.4 0 0 1-2 0z"/><circle cx="8" cy="8" r="1.4"/>',
    headset: '<path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="3.5" y="13" width="4" height="6" rx="1.2"/><rect x="16.5" y="13" width="4" height="6" rx="1.2"/><path d="M18.5 19c0 1.2-1.5 2-4 2h-2"/>',
    shirt: '<path d="M8.5 3.5 3.5 6.5l2 4 2-1v11h9v-11l2 1 2-4-5-3a3.5 3.5 0 0 1-7 0z"/>',
    stitch: '<path d="M4 20 18 6M15 3.5l5.5 5.5"/><path d="M6 13.5l4.5 4.5M9 10.5l4.5 4.5" stroke-dasharray="1.5 2"/>',
    percent: '<circle cx="12" cy="12" r="9"/><path d="m8.5 15.5 7-7"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="15" r="1.1"/>',
    check: '<path d="m5 12.5 4.5 4.5L19.5 7"/>',
    checkC: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.2 9.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M3.5 7h17M3.5 12h17M3.5 17h17"/>',
    ruler: '<path d="M3 16.5 16.5 3 21 7.5 7.5 21z"/><path d="m7 12.5 1.8 1.8M10 9.5l1.8 1.8M13 6.5l1.8 1.8"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
    list: '<path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12"/><circle cx="4.5" cy="6.5" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="17.5" r=".8"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    refresh: '<path d="M20 8.5A8.5 8.5 0 0 0 4.6 7M4 15.5A8.5 8.5 0 0 0 19.4 17"/><path d="M4 3.5V7.5h4M20 20.5V16.5h-4"/>',
    send: '<path d="M21 3.5 3 10.5l7 3 3 7z"/><path d="m10 13.5 5-5"/>',
    cart2: '<path d="M3 4h2.2l2.2 10.6a1.4 1.4 0 0 0 1.4 1.1h8.9a1.4 1.4 0 0 0 1.4-1.1L20.6 7H6"/>',
    hanger: '<path d="M12 7.5a2 2 0 1 1 2-2c0 1.3-2 1.6-2 3.5l8.3 6a1.2 1.2 0 0 1-.7 2.2H4.4a1.2 1.2 0 0 1-.7-2.2L12 9"/>',
    boot: '<path d="M5 4.5h6v7.5l7.5 2.5c1.5.5 2.5 1.8 2.5 3.3V19H3.5z"/><path d="M3.5 16h17.5"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12.5 9 5 9-5M3 16.5l9 5 9-5"/>',
    vest: '<path d="M8 3.5 5 5.5v15h5.5L12 13l1.5 7.5H19v-15l-3-2-4 5z"/>',
    ig: '',
  };
  const ico = (n, cls = "ico") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n] || ""}</svg>`;
  const SWOOSH = '<svg viewBox="0 0 160 16" aria-hidden="true"><path d="M3 11c30-5 70-8 150-7" stroke="#e3151d" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M28 14c28-3 60-5 96-4" stroke="#e3151d" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/></svg>';
  const script = (a = "Profesionáli", b = "nakupujú v DAMI.", cls = "") =>
    `<div class="script ${cls}" aria-label="${a} ${b}"><span>${a}</span><span>${b}</span>${SWOOSH}</div>`;

  /* ---------- formátovanie, url ---------- */
  const eur = n => n.toFixed(2).replace(".", ",") + " €";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const qp = k => new URLSearchParams(location.search).get(k);
  const catUrl = k => `kategoria.html?c=${k}`;
  const prodUrl = id => `produkt.html?p=${encodeURIComponent(id)}`;
  const inSec = (p, s) => p.sec.includes(s);
  const secProducts = s => D.products.filter(p => inSec(p, s));
  const catProducts = k => (D.cats[k]?.products || []).map(id => P[id]).filter(Boolean);
  const sectionOf = k => Object.entries(D.sections).find(([s, v]) => v.root === k || v.subs.includes(k))?.[0];
  const brandLabel = p => p.brand || catLabel(p);
  function catLabel(p) {
    const k = p.cats.find(c => D.cats[c] && !Object.values(D.sections).some(s => s.root === c));
    return k ? D.cats[k].name : "";
  }
  /* krátky názov: bez značky na začiatku */
  const shortName = p => p.name.replace(/^(CXS|ARDON®?|Batz|CHEFLINE)\s+/i, "");

  /* ---------- NAV ---------- */
  const SEC_IMG = {
    gastro: "assets/img/gastro-kuchar-sm.webp", zdravotnictvo: "assets/img/zdravotnictvo-sm.webp",
    pracovne: "assets/img/pracovne-odevy-sm.webp", obuv: "assets/img/obuv-bezpecnostna-sm.webp",
    doplnky: "assets/gen/cat-ochranne.webp",
  };
  const NAV = [
    { k: "gastro", label: "Gastro a biele odevy", href: catUrl("gastro") },
    { k: "zdravotnictvo", label: "Zdravotníctvo a wellness", href: "zdravotnictvo.html" },
    { k: "pracovne", label: "Pracovné odevy", href: catUrl("pracovne") },
    { k: "obuv", label: "Obuv", href: catUrl("obuv") },
    { k: "doplnky", label: "Doplnky", href: catUrl("doplnky") },
    { k: "znacky", label: "Značky", href: "znacky.html" },
    { k: "firmy", label: "Pre firmy", href: "pre-firmy.html" },
    { k: "predajna", label: "Predajňa<span class=\"nav__more\"> v Piešťanoch</span>", href: "predajna.html", red: true },
  ];
  function mega(k) {
    const s = D.sections[k]; if (!s) return "";
    const subs = s.subs.filter(c => D.cats[c]?.products.length);
    const cols = [[], [], []]; subs.forEach((c, i) => cols[Math.floor(i / Math.ceil(subs.length / 3))].push(c));
    const brands = [...new Set(secProducts(k).map(p => p.brand).filter(Boolean))];
    return `<div class="mega"><div class="mega__in">
      ${cols.map((col, i) => col.length ? `<div>${i === 0 ? `<h4>${esc(s.name)}</h4>` : "<h4>&nbsp;</h4>"}<ul>${col.map(c =>
        `<li><a href="${catUrl(c)}">${esc(D.cats[c].name)} <small>${D.cats[c].products.length}</small></a></li>`).join("")}</ul></div>` :
        (brands.length ? `<div><h4>Značky</h4><ul>${brands.map(b => `<li><a href="${catUrl(k)}&b=${encodeURIComponent(b)}">${esc(b)}</a></li>`).join("")}</ul></div>` : "<div></div>")).join("")}
      <a class="mega__feat" href="${k === "zdravotnictvo" ? "zdravotnictvo.html" : catUrl(k)}"><img src="${SEC_IMG[k]}" alt="" loading="lazy">
        <span class="eyebrow">${secProducts(k).length} produktov</span><b>Zobraziť celú kategóriu ${esc(s.name.toLowerCase())}</b></a>
    </div></div>`;
  }

  function header(variant = "dark", active = "") {
    const light = variant === "light";
    return `<header class="hdr ${variant === "over" ? "hdr--over" : ""} ${light ? "hdr--light" : ""}">
      <div class="wrap hdr__in">
        <button class="burger" data-open-nav aria-label="Menu">${ico("menu")}</button>
        <a class="hdr__logo" href="index.html" aria-label="DAMI pracovné odevy – domov"><img src="assets/img/logo-${light ? "light" : "dark"}.png" alt="DAMI pracovné odevy" width="400" height="237"></a>
        <nav class="nav" aria-label="Hlavné menu">${NAV.map(n => `<div class="nav__i"><a class="nav__a ${n.red ? "nav__a--red" : ""} ${active === n.k ? "is-on" : ""}" href="${n.href}">${n.label}${D.sections[n.k] ? ico("chev", "") : ""}</a>${mega(n.k)}</div>`).join("")}</nav>
        <div class="hdr__tools">
          <label class="search"><input type="search" placeholder="Hľadať produkty, značky…" aria-label="Hľadať" data-search>${ico("search", "")}<div class="search__res" data-search-res></div></label>
          <a class="tool tool--search" href="kategoria.html?c=all" aria-label="Hľadať">${ico("search")}</a>
          <a class="tool tool--acc" href="#" aria-label="Môj účet">${ico("user")}</a>
          <a class="tool tool--fav" href="kategoria.html?c=oblubene" aria-label="Obľúbené">${ico("heart")}<span class="tool__badge" data-fav-count hidden>0</span></a>
          <button class="tool" data-open-cart aria-label="Košík">${ico("cart")}<span class="tool__badge" data-cart-count>0</span><span class="tool__sum" data-cart-sum>0,00 €</span></button>
        </div>
      </div>
    </header>`;
  }

  function footer() {
    return `<footer class="ftr"><div class="wrap">
      <div class="ftr__grid">
        <div class="ftr__brand"><img src="assets/img/logo-dark.png" alt="DAMI pracovné odevy" loading="lazy"><p>Rodinná firma z Piešťan.<br>Vybavujeme ľudí, ktorí udržujú svet v pohybe.</p></div>
        <ul><li><a href="predajna.html">O nás</a></li><li><a href="pre-firmy.html">Pre firmy</a></li><li><a href="predajna.html">Predajňa v Piešťanoch</a></li><li><a href="znacky.html">Značky</a></li><li><a href="predajna.html#kontakt">Kontakt</a></li></ul>
        <ul><li><a href="#">Obchodné podmienky</a></li><li><a href="#">Doprava a platba</a></li><li><a href="#">Reklamácie</a></li><li><a href="#">Veľkostné tabuľky</a></li><li><a href="#">Ochrana osobných údajov</a></li></ul>
        <div class="ftr__nl"><h5>Odoberajte novinky</h5><p>Akcie, novinky a inšpirácie priamo do vášho e-mailu.</p>
          <form data-nl><input type="email" required placeholder="Váš e-mail" aria-label="E-mail"><button aria-label="Odoberať">${ico("arrow")}</button></form></div>
        <div class="ftr__contact" style="font-size:12.5px;line-height:1.7;opacity:.85">${FIRM.street}<br>${FIRM.city}<br><a href="tel:${FIRM.phone.replace(/\s/g, "")}">${FIRM.phone}</a><br><a href="mailto:${FIRM.mail}">${FIRM.mail}</a></div>
      </div>
      <div class="ftr__bottom"><span>© ${new Date().getFullYear()} ${FIRM.legal} · IČO ${FIRM.ico}</span><span>Ceny sú uvedené s DPH.</span></div>
    </div></footer>`;
  }

  function mobileNav() {
    return `<div class="mnav" aria-hidden="true"><div class="mnav__hd"><img src="assets/img/logo-dark.png" alt="DAMI"><button class="drawer__x" data-close-nav aria-label="Zavrieť">${ico("x")}</button></div>
      ${NAV.map(n => D.sections[n.k] ? `<details><summary>${n.label}${ico("chev", "")}</summary><ul><li><a href="${n.href}"><b>Všetko z kategórie</b></a></li>${D.sections[n.k].subs.filter(c => D.cats[c]?.products.length).map(c => `<li><a href="${catUrl(c)}">${esc(D.cats[c].name)}</a></li>`).join("")}</ul></details>` : `<a href="${n.href}" ${n.red ? 'style="color:var(--red)"' : ""}>${n.label}${ico("chevR", "")}</a>`).join("")}
      <div class="mnav__foot"><b>${FIRM.street}, ${FIRM.city}</b><a href="tel:${FIRM.phone.replace(/\s/g, "")}">${FIRM.phone}</a><span>Po – Pi 9:30 – 17:00 · So 9:00 – 12:00</span></div></div>`;
  }

  function chrome() {
    return `<div class="drawer-bg" data-close-cart></div>
      <aside class="drawer" aria-label="Košík" aria-hidden="true"><div class="drawer__hd"><h3>Košík</h3><button class="drawer__x" data-close-cart aria-label="Zavrieť">${ico("x")}</button></div>
        <div class="drawer__list" data-cart-list></div><div class="drawer__ft" data-cart-ft></div></aside>
      <div class="toast" role="status" aria-live="polite">${ico("checkC")}<span data-toast-msg></span></div>${mobileNav()}`;
  }

  /* ---------- karta produktu ---------- */
  const BADGE = { "sale": ["Akcia", ""] };
  function card(p, o = {}) {
    const sale = p.price > 0 && p.was > p.price;
    const cols = p.colors.slice(0, 4);
    const more = p.colors.length - cols.length;
    const badge = o.badge ? `<span class="pc__badge ${o.badge === "Novinka" ? "pc__badge--ink" : ""}">${o.badge}</span>` : sale ? `<span class="pc__badge">-${Math.round((1 - p.price / p.was) * 100)} %</span>` : "";
    return `<article class="pc ${o.compact ? "pc--compact" : ""}" data-id="${esc(p.id)}">
      <div class="pc__img">${badge}<button class="pc__fav ${isFav(p.id) ? "is-on" : ""}" data-fav="${esc(p.id)}" aria-label="Pridať k obľúbeným">${ico("heart")}</button>
        ${p.img.slice(0, 2).map((src, i) => `<img src="${src}" alt="${i ? "" : esc(p.name)}" loading="lazy" decoding="async" width="700" height="700">`).join("")}</div>
      <div class="pc__body">
        <span class="pc__brand">${esc(brandLabel(p))}</span>
        <h3 class="pc__name"><a href="${prodUrl(p.id)}">${esc(o.compact ? shortName(p) : p.name)}</a></h3>
        <div class="pc__price ${sale ? "is-sale" : ""}">${p.price ? eur(p.price) : "Cena na dopyt"}${sale ? `<s>${eur(p.was)}</s>` : ""}</div>
        ${cols.length && !o.noSw ? `<div class="sw">${cols.map(c => `<i title="${esc(c.n)}" style="background:${c.h.length > 1 ? `linear-gradient(135deg,${c.h[0]} 50%,${c.h[1]} 50%)` : c.h[0]}"></i>`).join("")}${more > 0 ? `<small>+${more}</small>` : ""}</div>` : ""}
        ${o.add ? (p.price ? `<button class="pc__add" data-quick="${esc(p.id)}">${ico("cart2")} Do košíka</button>` : `<a class="pc__add" href="${prodUrl(p.id)}">Opýtať sa na cenu</a>`) : ""}
      </div></article>`;
  }

  /* ---------- úložisko ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const cart = () => store.get("dami-cart", []).filter(l => P[l.id]);
  const favs = () => store.get("dami-fav", []);
  function isFav(id) { return favs().includes(id); }
  function toggleFav(id) {
    const f = favs(); const i = f.indexOf(id);
    i < 0 ? f.push(id) : f.splice(i, 1); store.set("dami-fav", f); syncBadges();
    return i < 0;
  }
  function addToCart(id, size = "", color = "", qty = 1) {
    const c = cart(); const l = c.find(x => x.id === id && x.size === size && x.color === color);
    l ? (l.qty += qty) : c.push({ id, size, color, qty });
    store.set("dami-cart", c); syncBadges(); renderCart();
    toast(`${shortName(P[id])} je v košíku`);
  }
  function setQty(i, q) { const c = cart(); if (!c[i]) return; q < 1 ? c.splice(i, 1) : (c[i].qty = q); store.set("dami-cart", c); syncBadges(); renderCart(); document.dispatchEvent(new Event("dami:cart")); }
  const cartTotal = () => cart().reduce((s, l) => s + P[l.id].price * l.qty, 0);
  const cartCount = () => cart().reduce((s, l) => s + l.qty, 0);
  function syncBadges() {
    document.querySelectorAll("[data-cart-count]").forEach(e => e.textContent = cartCount());
    document.querySelectorAll("[data-cart-sum]").forEach(e => e.textContent = eur(cartTotal()));
    const fc = favs().length;
    document.querySelectorAll("[data-fav-count]").forEach(e => { e.textContent = fc; e.hidden = !fc; });
  }
  const FREE = 60;
  function renderCart() {
    const list = document.querySelector("[data-cart-list]"), ft = document.querySelector("[data-cart-ft]");
    if (!list) return;
    const c = cart();
    if (!c.length) {
      list.innerHTML = `<div class="drawer__empty">${ico("cart")}<p>Košík je zatiaľ prázdny.</p><a class="btn btn--red btn--sm" href="${catUrl("gastro")}">Pozrieť kolekcie ${ico("arrow", "")}</a></div>`;
      ft.innerHTML = ""; return;
    }
    list.innerHTML = c.map((l, i) => { const p = P[l.id]; return `<div class="ci">
      <a class="ci__img" href="${prodUrl(p.id)}"><img src="${p.img[0]}" alt=""></a>
      <div><div class="ci__name">${esc(p.name)}</div><div class="ci__var">${[l.color && "Farba: " + esc(l.color), l.size && "Veľkosť: " + esc(l.size)].filter(Boolean).join(" · ")}</div>
        <div class="qty"><button data-q="${i}" data-d="-1" aria-label="Menej">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1" aria-label="Viac">+</button></div></div>
      <div><div class="ci__price">${eur(p.price * l.qty)}</div><button class="ci__rm" data-q="${i}" data-d="rm">Odstrániť</button></div></div>`; }).join("");
    const t = cartTotal(), left = FREE - t;
    ft.innerHTML = `<div class="drawer__sum"><span>Spolu s DPH</span><b>${eur(t)}</b></div>
      <div class="drawer__free">${left > 0 ? `Do dopravy zadarmo chýba ${eur(left)}. Osobný odber v Piešťanoch je vždy zadarmo.` : "Máte dopravu zadarmo."}</div>
      <a class="btn btn--red btn--block" href="kosik.html">Pokračovať do košíka ${ico("arrow", "")}</a>`;
  }
  let tt;
  function toast(msg) {
    const t = document.querySelector(".toast"); if (!t) return;
    t.querySelector("[data-toast-msg]").textContent = msg; t.classList.add("is-on");
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("is-on"), 2600);
  }
  const openCart = () => { renderCart(); document.body.classList.add("cart-open"); document.querySelector(".drawer")?.setAttribute("aria-hidden", "false"); };
  const closeCart = () => { document.body.classList.remove("cart-open"); document.querySelector(".drawer")?.setAttribute("aria-hidden", "true"); };

  /* ---------- vyhľadávanie ---------- */
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const IDX = D.products.map(p => [p, norm(p.name + " " + p.brand + " " + p.cats.map(c => D.cats[c]?.name || "").join(" "))]);
  function search(q) {
    const t = norm(q).split(/\s+/).filter(Boolean);
    return t.length ? IDX.filter(([, s]) => t.every(w => s.includes(w))).map(([p]) => p) : [];
  }
  function bindSearch() {
    document.querySelectorAll("[data-search]").forEach(inp => {
      const res = inp.parentElement.querySelector("[data-search-res]");
      inp.addEventListener("input", () => {
        const r = search(inp.value).slice(0, 7);
        if (!inp.value.trim()) return res.classList.remove("is-open");
        res.innerHTML = r.length ? r.map(p => `<a href="${prodUrl(p.id)}"><img src="${p.img[0]}" alt=""><span>${esc(p.name)}</span><b>${eur(p.price)}</b></a>`).join("") +
          `<a href="kategoria.html?c=all&q=${encodeURIComponent(inp.value)}" style="display:block;text-align:center;font-weight:600;color:var(--red)">Všetky výsledky</a>` : `<div class="search__empty">Nič sme nenašli. Skúste iný výraz alebo nám zavolajte na ${FIRM.phone}.</div>`;
        res.classList.add("is-open");
      });
      inp.addEventListener("keydown", e => { if (e.key === "Enter") location.href = `kategoria.html?c=all&q=${encodeURIComponent(inp.value)}`; if (e.key === "Escape") { inp.blur(); res.classList.remove("is-open"); } });
      inp.addEventListener("blur", () => setTimeout(() => res.classList.remove("is-open"), 180));
    });
  }

  /* ---------- delegované kliky ---------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-open-cart],[data-close-cart],[data-fav],[data-quick],[data-q],[data-open-nav],[data-close-nav],.pc a, a.pc-link");
    if (!t) return;
    if (t.matches("[data-open-cart]")) { e.preventDefault(); openCart(); }
    else if (t.matches("[data-close-cart]")) closeCart();
    else if (t.matches("[data-open-nav]")) document.body.classList.add("nav-open");
    else if (t.matches("[data-close-nav]")) document.body.classList.remove("nav-open");
    else if (t.matches("[data-fav]")) { e.preventDefault(); const on = toggleFav(t.dataset.fav); t.classList.toggle("is-on", on); toast(on ? "Pridané k obľúbeným" : "Odstránené z obľúbených"); }
    else if (t.matches("[data-quick]")) {
      e.preventDefault(); const p = P[t.dataset.quick];
      if (p.sizes.length > 1 || p.colors.length > 1) { nameImg(t.closest(".pc")); location.href = prodUrl(p.id) + "#vyber"; }
      else addToCart(p.id, p.sizes[0] || "", p.colors[0]?.n || "");
    }
    else if (t.matches("[data-q]")) { const c = cart(), i = +t.dataset.q; t.dataset.d === "rm" ? setQty(i, 0) : setQty(i, c[i].qty + +t.dataset.d); }
    else if (t.closest(".pc")) nameImg(t.closest(".pc"));
  });
  /* morph obrázka z karty do detailu produktu */
  function nameImg(pc) {
    document.querySelectorAll("[style*='view-transition-name: pimg']").forEach(x => x.style.viewTransitionName = "");
    const img = pc?.querySelector(".pc__img img"); if (img) img.style.viewTransitionName = "pimg";
    try { sessionStorage.setItem("dami-vt", pc.dataset.id); } catch {}
  }
  window.addEventListener("pageshow", e => { if (e.persisted) document.querySelectorAll(".pc__img img").forEach(x => x.style.viewTransitionName = ""); syncBadges(); });
  document.addEventListener("submit", e => {
    if (e.target.matches("[data-nl]")) { e.preventDefault(); e.target.reset(); toast("Ďakujeme, novinky vám budeme posielať."); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCart(); document.body.classList.remove("nav-open"); } });

  /* ---------- reveal ---------- */
  function reveal(root = document) {
    const els = root.querySelectorAll(".rv:not(.is-in)");
    if (!("IntersectionObserver" in window)) return els.forEach(e => e.classList.add("is-in"));
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((e, i) => { e.style.transitionDelay = (e.dataset.d || 0) + "ms"; io.observe(e); });
  }

  /* ---------- vloženie chrome do stránky ---------- */
  function mount(variant, active) {
    document.currentScript.insertAdjacentHTML("beforebegin", header(variant, active));
  }
  function mountFooter() {
    document.currentScript.insertAdjacentHTML("beforebegin", footer() + chrome());
    syncBadges(); bindSearch(); reveal();
  }

  window.DAMI = { D, P, FIRM, I, ico, script, eur, esc, qp, catUrl, prodUrl, secProducts, catProducts, sectionOf, brandLabel, catLabel, shortName,
    card, header, footer, mount, mountFooter, addToCart, setQty, cart, cartTotal, cartCount, favs, isFav, toggleFav, search, reveal, toast, openCart, syncBadges, renderCart, store, FREE };
})();
