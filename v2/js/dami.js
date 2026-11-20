/* DAMI — zdieľané správanie: header/footer, karty, košík, obľúbené, vyhľadávanie, reveal, View Transitions */
(function () {
  /* ---------- veľké obrazovky: dizajn je kreslený na 1440 px, nad tým sa celá stránka plynulo zväčšuje
     až po šírku okna 2600 px; širšie okná už obsah ďalej neťahajú, ostane v strede a po bokoch je voľná plocha ---------- */
  const root = document.documentElement, MAXW = 2600;
  /* na veľkých monitoroch je všetko o 10 % menšie (ako lupa 90 % v Chrome): od 1920 px sa plynulo zmenšuje, od 2560 px je 0,9 */
  const K = w => w <= 1920 ? 1 : w >= 2560 ? .9 : 1 - .1 * (w - 1920) / 640;
  function fit() {
    const k = K(Math.min(innerWidth, MAXW + 1));
    const z = Math.min(MAXW / 1440, Math.max(1, innerWidth / 1440)) * k;
    root.style.setProperty("--k", k.toFixed(4));
    root.classList.toggle("is-capped", innerWidth > MAXW);
    root.style.zoom = z > 1.001 ? z.toFixed(4) : "";
    root.style.setProperty("--z", z.toFixed(4));
  }
  fit(); addEventListener("resize", fit);

  const D = window.DAMI_DATA;
  if (!D.__v2) { D.products.forEach(p => p.img = p.img.map(s => "../" + s)); D.__v2 = true; }
  const P = Object.fromEntries(D.products.map(p => [p.id, p]));

  const FIRM = {
    name: "DAMI pracovné odevy", legal: "Adriána Piknová - DAMI", ico: "40 749 797",
    street: "Gaštanová 6396", city: "921 01 Piešťany",
    phone: "0902 482 244", phone2: "0911 263 250", mail: "damiobchod@gmail.com",
    hours: [["Po – Pi", "9:30 – 17:00"], ["So", "9:00 – 12:00"], ["Ne", "Zatvorené"]],
    map: "https://www.google.com/maps/search/?api=1&query=Ga%C5%A1tanov%C3%A1+6396+Pie%C5%A1%C5%A5any",
  };

  /* ---------- recenzie: skutočné hodnotenie z Google (stav 20. 11. 2026, aktualizovať ručne) ---------- */
  const REVIEWS = {
    rating: 4.7, count: 42, five: 34,
    url: "https://www.google.com/maps/place/DAMI+Pracovn%C3%A9+odevy/@48.5862924,17.8173406,17z/data=!4m8!3m7!1s0x476b548abc574b81:0x52fc9a7877705c2c!9m1!1b1?hl=sk",
    items: [  /* citáty doslova z Google recenzií, bez dátumov */
      { name: "Tomáš K.", stars: 5, text: "Super obsluha, ochota aj poradenstvom odporúčam" },
      { name: "Marek M.", stars: 5, text: "dobrá cena a veľmi dobrý výber tovaru" },
      { name: "Andrea H.", stars: 5, text: "Dobrý výber za skvelé ceny" },
      { name: "Jan I.", stars: 4, text: "Pracovné odevy za rozumné ceny" },
    ],
  };
  /* Heureka: kým nie je profil, ukazuje sa miesto „pripravujeme“. Po schválení doplniť { url, pct, count }. */
  const HEUREKA = null;

  /* ---------- ikony (stroke, 24px) ---------- */
  const I = {
    home: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v11h13V9"/><path d="M10 20v-5.5h4V20"/>',
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
    upload: '<path d="M12 15V4"/><path d="m7.5 8.5 4.5-4.5 4.5 4.5"/><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
    layers: '<path d="M12 4l-8 4l8 4l8 -4l-8 -4" fill="currentColor"/><path d="M8 14l-4 2l8 4l8 -4l-4 -2"/><path d="M8 10l-4 2l8 4l8 -4l-4 -2"/>',
    needle: '<path d="M3 21c-.667 -.667 3.262 -6.236 11.785 -16.709a3.5 3.5 0 1 1 5.078 4.791c-10.575 8.612 -16.196 12.585 -16.863 11.918z"/><path d="M17.5 6.5l-1 1"/><path d="M17 7c-2.333 -2.667 -3.5 -4 -5 -4s-2 1 -2 2c0 4 8.161 8.406 6 11c-1.056 1.268 -3.363 1.285 -5.75 .808"/><path d="M5.739 15.425c-1.393 -.565 -3.739 -1.925 -3.739 -3.425"/><path d="M19.5 9.5l1.5 1.5"/>',
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
  /* podkategórie otvárame rovno pri produktoch (#produkty), hlavné sekcie s hero bannerom */
  const catUrl = k => k === "zdravotnictvo" ? "zdravotnictvo.html#vsetko" : /^zdrav-/.test(k) ? `zdravotnictvo.html?k=${k}#vsetko` : `kategoria.html?c=${k}${D.sections[k] || k === "all" || k === "oblubene" ? "" : "#produkty"}`;
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
    gastro: "../assets/img/gastro-kuchar-sm.webp", zdravotnictvo: "../assets/img/zdravotnictvo-sm.webp",
    pracovne: "../assets/img/pracovne-odevy-sm.webp", obuv: "../assets/img/obuv-bezpecnostna-sm.webp",
    doplnky: "../assets/gen/cat-ochranne.webp",
  };
  const NAV = [
    { k: "gastro", label: "Gastro", href: catUrl("gastro") },
    { k: "zdravotnictvo", label: "Zdravotníctvo", href: "zdravotnictvo.html" },
    { k: "pracovne", label: "Pracovné odevy", href: catUrl("pracovne") },
    { k: "obuv", label: "Obuv", href: catUrl("obuv") },
    { k: "doplnky", label: "Doplnky", href: catUrl("doplnky"), noChev: true },
    { k: "firmy", label: "Pre firmy", href: "pre-firmy.html" },
    { k: "predajna", label: "Predajňa", href: "predajna.html" },
  ];
  const LOGO = (cls = "") => `<span class="logo-mk"><img src="img/hand-white.svg" alt="" width="458" height="600"></span><span class="logo-t ${cls}"><b>DAMI</b><small>PRACOVNÉ ODEVY</small></span>`;
  function mega(k) {
    const s = D.sections[k]; if (!s) return "";
    const subs = s.subs.filter(c => D.cats[c]?.products.length);
    const cols = [[], [], []]; subs.forEach((c, i) => cols[Math.floor(i / Math.ceil(subs.length / 3))].push(c));
    const brands = [...new Set(secProducts(k).map(p => p.brand).filter(Boolean))];
    const zd = k === "zdravotnictvo", allUrl = zd ? "zdravotnictvo.html#vsetko" : catUrl(k);
    const brandUrl = b => zd ? `zdravotnictvo.html?b=${encodeURIComponent(b)}#vsetko` : `${catUrl(k)}&b=${encodeURIComponent(b)}`;
    return `<div class="mega"><div class="mega__in">
      ${cols.map((col, i) => col.length ? `<div>${i === 0 ? `<h4>${esc(s.name)}</h4>` : "<h4>&nbsp;</h4>"}<ul>${i === 0 ? `<li><a class="mega__all" href="${allUrl}"><b>Všetky produkty</b> <small>${secProducts(k).length}</small></a></li>` : ""}${col.map(c =>
        `<li><a href="${catUrl(c)}">${esc(D.cats[c].name)} <small>${D.cats[c].products.length}</small></a></li>`).join("")}</ul></div>` :
        (brands.length ? `<div><h4>Značky</h4><ul>${brands.map(b => `<li><a href="${brandUrl(b)}">${esc(b)}</a></li>`).join("")}</ul></div>` : "<div></div>")).join("")}
      <a class="mega__feat" href="${k === "zdravotnictvo" ? "zdravotnictvo.html" : catUrl(k)}"><img src="${SEC_IMG[k]}" alt="" loading="lazy">
        <span class="eyebrow">${secProducts(k).length} produktov</span><b>Zobraziť celú kategóriu ${esc(s.name.toLowerCase())}</b></a>
    </div></div>`;
  }

  const STAR = '<svg class="st" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
  const stars = (n = 5) => `<span class="stars" aria-label="${n} z 5">${Array.from({ length: 5 }, (_, i) => i < Math.round(n) ? STAR : STAR.replace('class="st"', 'class="st st--off"')).join("")}</span>`;
  const rate = n => n.toFixed(1).replace(".", ",");
  /* malý odznak: ★ 4,7 · 42 hodnotení na Google */
  function gBadge(cls = "") {
    return `<a class="gbadge ${cls}" href="${REVIEWS.url}" target="_blank" rel="noopener">${stars(REVIEWS.rating)}<b>${rate(REVIEWS.rating)}</b><span>${REVIEWS.count} hodnotení na Google</span></a>`;
  }
  /* miesto pre certifikát Heureka */
  function hBadge(cls = "") {
    return HEUREKA
      ? `<a class="hbadge ${cls}" href="${HEUREKA.url}" target="_blank" rel="noopener"><b>Overené zákazníkmi</b><span>Heureka · ${HEUREKA.pct} % odporúča</span></a>`
      : `<span class="hbadge hbadge--soon ${cls}"><b>Overené zákazníkmi</b><span>Heureka · pripravujeme</span></span>`;
  }
  /* blok recenzií na úvodnú stránku */
  function reviewsBlock() {
    return `<div class="revs">
      <div class="revs__sum">
        <p class="revs__eyebrow">Hodnotenia zákazníkov</p>
        <div class="revs__big"><b>${rate(REVIEWS.rating)}</b>${stars(REVIEWS.rating)}</div>
        <p class="revs__count">${REVIEWS.count} hodnotení na Google, z toho ${REVIEWS.five}× päť hviezdičiek</p>
        <div class="revs__btns"><a class="btn btn--redline btn--sm" href="${REVIEWS.url}" target="_blank" rel="noopener">Všetky recenzie na Google ${ico("arrow")}</a></div>
        ${hBadge("hbadge--lg")}
      </div>
      <div class="revs__list">${REVIEWS.items.map(r => `<figure class="rev">${stars(r.stars)}<blockquote>„${esc(r.text)}“</blockquote><figcaption>${esc(r.name)} <span>· Google</span></figcaption></figure>`).join("")}</div>
    </div>`;
  }
  /* odhad doručenia: objednávka do 13:00 ide v ten deň, doručenie 2 pracovné dni po odoslaní */
  function deliveryDate(from = new Date()) {
    const d = new Date(from); const work = x => x.getDay() % 6 !== 0;
    if (d.getHours() >= 13 || !work(d)) { do d.setDate(d.getDate() + 1); while (!work(d)); }
    for (let k = 0; k < 2; k++) { do d.setDate(d.getDate() + 1); while (!work(d)); }
    return `${["ne", "po", "ut", "st", "št", "pi", "so"][d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}.`;
  }

  /* otvorené / zatvorené podľa skutočných hodín: Po–Pi 9:30–17:00, So 9:00–12:00 */
  function openNow(d = new Date()) {
    const day = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    const slot = day >= 1 && day <= 5 ? [570, 1020] : day === 6 ? [540, 720] : null;
    if (slot && m >= slot[0] && m < slot[1]) return { open: true, text: `Teraz otvorené · do ${slot[1] === 1020 ? "17:00" : "12:00"}` };
    const next = (day >= 1 && day <= 4 && m >= 1020) || (day === 0) ? "zajtra o 9:30" : day === 5 && m >= 1020 ? "v sobotu o 9:00" : day === 6 && m >= 720 ? "v pondelok o 9:30" : m < (day === 6 ? 540 : 570) ? `dnes o ${day === 6 ? "9:00" : "9:30"}` : "v pondelok o 9:30";
    return { open: false, text: `Teraz zatvorené · otvárame ${next}` };
  }

  /* ---------- hero B (Split) a C (Produkt) podľa makiet v hero-mock/ – spoločné pre kategórie a podstránky ---------- */
  const crumbsHtml = cr => `<nav class="crumbs hv-crumbs" aria-label="Omrvinky">${cr.map(([h, t], i) => i === cr.length - 1 ? `<b>${esc(t)}</b>` : `<a href="${h}">${esc(t)}</a><span>/</span>`).join("")}</nav>`;
  /* fotka produktu s čistým (bielym) pozadím, ak ju má – mapa z js/packshots.js */
  const cleanImg = p => { const m = window.DAMI_CLEAN, i = m && m[p.id]; return i != null ? p.img[i] : null; };
  const heroBtn = ([href, t, kind = "white"]) => `<a class="btn ${kind === "ghost" ? "hv-b__ghost" : kind === "red" ? "btn--red" : kind === "line" ? "btn--redline" : "btn--white"}" href="${href}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ""}>${t}${kind === "ghost" ? "" : " " + ico("arrow")}</a>`;
  /* B: vľavo červený panel s ponukou, vpravo fotka až po okraj */
  function heroB(o) {
    return `<section class="hv hv-b${o.cls ? " " + o.cls : ""}"><div class="hv-b__red">${o.crumbs ? crumbsHtml(o.crumbs) : ""}
        ${o.eye ? `<p class="hv-b__eye">${o.eye}</p>` : ""}<h1>${o.h1}</h1>
        ${o.name ? `<p class="hv-b__name">${o.name}</p>` : ""}${o.price ? `<p class="hv-b__p">${o.price}</p>` : ""}${o.lead ? `<p class="hv-b__lead">${o.lead}</p>` : ""}
        ${o.extra || ""}
        ${o.btns ? `<div class="hv-b__btns">${o.btns.map(heroBtn).join("")}</div>` : ""}
        ${o.trust ? `<p class="hv-b__trust">${o.trust.map(t => `<span>${t}</span>`).join("")}</p>` : ""}
        <img class="hv-b__hand" src="img/hand-white.svg" alt="" width="458" height="600"></div>
      <div class="hv-b__ph"><img src="${o.photo}" alt="${esc(o.alt || "")}" style="object-position:${o.pos || "50% 50%"}" fetchpriority="high"></div></section>`;
  }
  /* C: nadpis + veľký produkt s cenovkou a vlastnosťami + pás odporúčaných */
  function heroC(o) {
    const pr = o.prod;
    return `<section class="wrap hv hv-c"><div class="hv-c__txt">${o.crumbs ? crumbsHtml(o.crumbs) : ""}${o.eye ? `<p class="hv-c__eye">${o.eye}</p>` : ""}<h1>${o.h1}</h1>
        ${o.n ? `<p class="hv-c__n">${o.n}</p>` : ""}${o.extra || ""}${o.btns ? `<div class="hv-c__btns">${o.btns.map(heroBtn).join("")}</div>` : ""}</div>
      <a class="hv-c__prod" href="${pr.href}"><img src="${pr.img}" alt="${esc(pr.alt || pr.name)}"${pr.cut ? "" : ' class="is-pack"'}><span class="hv-c__stk tg tg--cut2 tg-price">${/^od /.test(pr.price) ? `<small>od</small><b>${pr.price.slice(3)}</b>` : `<b>${pr.price}</b>`}</span>
        <span class="hv-c__info"><b>${esc(pr.name)}</b><ul>${pr.specs.map(t => `<li>${esc(t)}</li>`).join("")}</ul></span></a>
      ${o.rail && o.rail.length ? `<aside class="hv-c__rail"><h2>${o.railTitle || "Odporúčame"}</h2>${o.rail.map(p => `<a class="hv-c__item" href="${prodUrl(p.id)}"><span><img src="${cleanImg(p) || p.img[0]}" alt="" loading="lazy"></span><b>${esc(shortName(p))}</b><i>${eur(p.price)}</i></a>`).join("")}</aside>` : ""}</section>`;
  }
  /* dlaždice podkategórií s fotkou produktu: [{href, name, n, img, on}] */
  const heroTiles = items => `<div class="wrap hv-tiles" role="list">${items.map(t => `<a class="hv-tile${t.on ? " is-on" : ""}" role="listitem" href="${t.href}"${t.on ? ' aria-current="page"' : ""}><span class="hv-tile__ph">${t.img ? `<img src="${t.img}" alt="" loading="lazy">` : ""}</span><span class="hv-tile__t"><b>${esc(t.name)}</b>${t.n != null ? `<i>${t.n}</i>` : ""}</span></a>`).join("")}</div>`;
  /* skutočné vlastnosti produktu z katalógu (značka, veľkosti, farby) */
  function prodSpecs(p) {
    const out = [];
    if (p.brand) out.push(`Značka ${p.brand}`);
    if (p.sizes.length) out.push(p.sizes.length > 1 ? `Veľkosti ${p.sizes[0]} – ${p.sizes.at(-1)}` : `Veľkosť ${p.sizes[0]}`);
    if (p.colors.length > 1) out.push(`${p.colors.length} ${p.colors.length < 5 ? "farby" : "farieb"}`);
    out.push("Vyskúšaš v predajni v Piešťanoch");
    return out.slice(0, 3);
  }

  function header(variant = "dark", active = "") {
    const light = variant === "light";
    return `<div class="topbar"><a href="predajna.html">${ico("pin", "ico tb-pin")}Predajňa Piešťany</a><i class="tb-opt">•</i><span class="tb-opt">${FIRM.street}</span><i>•</i><span>Po–Pi 9:30–17:00</span><i class="tb-opt">•</i><a class="tb-opt" href="tel:${FIRM.phone.replace(/\s/g, "")}">${FIRM.phone}</a><i class="tb-opt">•</i><a class="tb-opt tb-rate" href="${REVIEWS.url}" target="_blank" rel="noopener">★ ${rate(REVIEWS.rating)} Google (${REVIEWS.count})</a></div>
    <header class="hdr">
      <div class="wrap hdr__in">
        <a class="hdr__logo" href="index.html" aria-label="DAMI pracovné odevy – domov">${LOGO()}</a>
        <nav class="nav" aria-label="Hlavné menu">${NAV.map(n => `<div class="nav__i"><a class="nav__a ${n.red ? "nav__a--red" : ""} ${active === n.k ? "is-on" : ""}" href="${n.href}">${n.label}${D.sections[n.k] && !n.noChev ? ico("chev", "") : ""}</a>${mega(n.k)}</div>`).join("")}</nav>
        <div class="hdr__tools">
          <label class="search">${ico("search", "")}<input type="search" placeholder="Hľadať produkty, značky…" aria-label="Hľadať" data-search><div class="search__res" data-search-res></div></label>
          <a class="tool tool--search" href="kategoria.html?c=all" aria-label="Hľadať">${ico("search")}</a>
          <a class="tool tool--acc" href="#" aria-label="Môj účet">${ico("user")}</a>
          <a class="tool tool--fav" href="kategoria.html?c=oblubene" aria-label="Obľúbené">${ico("heart")}<span class="tool__badge" data-fav-count hidden>0</span></a>
          <button class="tool tool--cart" data-open-cart aria-label="Košík">${ico("cart")}<span class="tool__badge" data-cart-count>0</span><span class="tool__sum" data-cart-sum>0,00 €</span></button>
          <button class="burger burger--r" data-open-nav aria-label="Menu">${ico("menu")}</button>
        </div>
      </div>
      <div class="msrch"><label class="search">${ico("search", "")}<input type="search" placeholder="Hľadať oblečenie, obuv…" aria-label="Hľadať" data-search data-msrch><div class="search__res" data-search-res></div></label></div>
    </header>`;
  }

  function footer() {
    const col = (h, items) => `<div class="ftr__col"><h5>${h}</h5><ul>${items.map(([href, t]) => `<li><a href="${href}">${t}</a></li>`).join("")}</ul></div>`;
    return `<footer class="ftr"><div class="wrap">
      <div class="ftr__grid">
        <div class="ftr__brand"><a href="index.html" aria-label="DAMI – domov">${LOGO()}</a></div>
        ${col("Produkty", [[catUrl("gastro"), "Gastro"], ["zdravotnictvo.html", "Zdravotníctvo"], [catUrl("pracovne"), "Pracovné odevy"], [catUrl("obuv"), "Obuv"], [catUrl("doplnky"), "Doplnky"]])}
        ${col("Pre zákazníkov", [["pre-firmy.html", "Pre firmy"], ["predajna.html", "Predajňa"], ["#", "Doprava a platba"], ["#", "Vrátenie a reklamácia"], ["predajna.html#kontakt", "Kontakt"]])}
        <div class="ftr__col"><h5>Predajňa Piešťany</h5><div class="ftr__contact">
          <div>${ico("pin")}<span>${FIRM.street}, Piešťany</span></div><div>${ico("clock")}<span>Po–Pi 9:30–17:00 · So 9:00–12:00</span></div>
          <div>${ico("phone")}<a href="tel:${FIRM.phone.replace(/\s/g, "")}">${FIRM.phone}</a></div></div></div>
      </div>
      <div class="ftr__trust">${gBadge("gbadge--dark")}${hBadge("hbadge--dark")}</div>
      <div class="ftr__bottom"><span>© ${new Date().getFullYear()} ${FIRM.legal} · IČO ${FIRM.ico}</span><span><a href="vyroba.html">Vlastná výroba</a> · <a href="znacky.html">Značky</a> · <a href="mailto:${FIRM.mail}">${FIRM.mail}</a></span><span>Ceny sú uvedené s DPH.</span></div>
    </div></footer>`;
  }

  function mobileNav() {
    const arr = ico("arrow", "ico mnav__arr");
    return `<div class="mnav" aria-hidden="true"><div class="mnav__hd"><a class="hdr__logo" href="index.html">${LOGO()}</a>
        <a class="tool" href="#" aria-label="Môj účet">${ico("user")}</a><button class="tool" data-open-cart aria-label="Košík">${ico("cart")}<span class="tool__badge" data-cart-count>0</span></button>
        <button class="drawer__x" data-close-nav aria-label="Zavrieť">${ico("x")}</button></div>
      <div class="mnav__search"><label class="search">${ico("search", "")}<input type="search" placeholder="Hľadať: rondon, kroksy, S3…" aria-label="Hľadať" data-search><div class="search__res" data-search-res></div></label></div>
      <nav class="mnav__big">${NAV.filter(n => D.sections[n.k]).map(n => `<a href="${n.href}">${esc(D.sections[n.k].name)}${arr}</a>`).join("")}</nav>
      <nav class="mnav__small"><a href="pre-firmy.html">Pre firmy${arr}</a><a href="predajna.html">Predajňa Piešťany${arr}</a><a href="#">Môj účet${arr}</a></nav>
      <div class="mnav__foot"><span class="logo-mk"><img src="img/hand-white.svg" alt=""></span><span><a href="${FIRM.map}" target="_blank" rel="noopener">${FIRM.street}</a> • <a href="tel:${FIRM.phone.replace(/\s/g, "")}">${FIRM.phone}</a></span></div></div>`;
  }

  /* mobil: spodná lišta ako v appke */
  function tabbar() {
    const pg = (location.pathname.split("/").pop() || "index.html").replace(".html", "");
    const on = k => k === pg || (k === "index" && pg === "") ? " is-on" : "";
    return `<nav class="tabbar" aria-label="Rýchla navigácia">
      <a class="tabbar__i${on("index")}" href="index.html">${ico("home")}<span>Domov</span></a>
      <button class="tabbar__i${pg === "kategoria" || pg === "zdravotnictvo" ? " is-on" : ""}" data-open-nav>${ico("grid")}<span>Kategórie</span></button>
      <button class="tabbar__i" data-tab-search>${ico("search")}<span>Hľadať</span></button>
      <button class="tabbar__i${on("kosik")}" data-open-cart>${ico("cart")}<span class="tool__badge" data-cart-count>0</span><span>Košík</span></button>
      <a class="tabbar__i${on("predajna")}" href="predajna.html">${ico("store")}<span>Predajňa</span></a>
    </nav>`;
  }
  function chrome() {
    return `<div class="drawer-bg" data-close-cart></div>
      <aside class="drawer" aria-label="Košík" aria-hidden="true"><div class="drawer__hd"><h3>Košík</h3><button class="drawer__x" data-close-cart aria-label="Zavrieť">${ico("x")}</button></div>
        <div class="drawer__list" data-cart-list></div><div class="drawer__ft" data-cart-ft></div></aside>
      <div class="toast" role="status" aria-live="polite">${ico("checkC")}<span data-toast-msg></span></div>${mobileNav()}${tabbar()}`;
  }

  /* ---------- karta produktu ---------- */
  const BADGE = { "sale": ["Akcia", ""] };
  /* logo na odeve: potlač alebo výšivka (cenu potvrdíme podľa loga) */
  const LOGO_OPT = [["potlac", "layers", "s potlačou loga"], ["vysivka", "needle", "s výšivkou loga"]];
  const logoName = k => k === "vysivka" ? "výšivka" : k === "potlac" ? "potlač" : "";
  function card(p, o = {}) {
    const sale = p.price > 0 && p.was > p.price;
    const cols = p.colors.slice(0, 4);
    const more = p.colors.length - cols.length;
    const badge = o.badge ? `<span class="pc__badge tg ${o.badge === "Novinka" ? "tg-new" : "tg-hl"}">${o.badge}</span>` : sale ? `<span class="pc__badge tg tg-sale">−${Math.round((1 - p.price / p.was) * 100)}&nbsp;%</span>` : "";
    return `<article class="pc ${o.compact ? "pc--compact" : ""}" data-id="${esc(p.id)}">
      <div class="pc__img">${badge}<button class="pc__fav ${isFav(p.id) ? "is-on" : ""}" data-fav="${esc(p.id)}" aria-label="Pridať k obľúbeným">${ico("heart")}</button>
        ${p.img.slice(0, 2).map((src, i) => `<img src="${src}" alt="${i ? "" : esc(p.name)}" loading="lazy" decoding="async" width="700" height="700">`).join("")}</div>
      <div class="pc__body">
        <span class="pc__brand">${esc(brandLabel(p))}</span>
        <h3 class="pc__name"><a href="${prodUrl(p.id)}">${esc(o.name || (o.compact ? shortName(p) : p.name))}</a></h3>
        <div class="pc__price ${sale ? "is-sale" : ""}">${p.price ? eur(p.price) : "Cena na dopyt"}${sale ? `<s>${eur(p.was)}</s>` : ""}</div>
        ${p.sizes.length && !o.noSz ? `<div class="pc__sizes">${p.sizes.slice(0, 5).map(z => `<i>${esc(z)}</i>`).join("")}${p.sizes.length > 5 ? `<i class="more">+${p.sizes.length - 5}</i>` : ""}</div>` : ""}
        ${cols.length && !o.noSw ? `<div class="sw">${cols.map(c => `<i title="${esc(c.n)}" style="background:${c.h.length > 1 ? `linear-gradient(135deg,${c.h[0]} 50%,${c.h[1]} 50%)` : c.h[0]}"></i>`).join("")}${more > 0 ? `<small>+${more}</small>` : ""}</div>` : ""}
        ${o.add ? (p.price ? `<div class="pc__buy"><button class="pc__add" data-quick="${esc(p.id)}">${ico("cart2")} Do košíka</button>${LOGO_OPT.map(([k, ic, t]) => `<button class="pc__lg" data-quick="${esc(p.id)}" data-logo="${k}" title="Do košíka ${t}" aria-label="Do košíka ${t}">${ico(ic)}</button>`).join("")}</div>` : `<a class="pc__add" href="${prodUrl(p.id)}">Opýtať sa na cenu</a>`) : ""}
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
  function addToCart(id, size = "", color = "", qty = 1, logo = "", extra = {}) {
    const c = cart(); const l = !extra.file && !extra.note && c.find(x => x.id === id && x.size === size && x.color === color && (x.logo || "") === logo && !x.file && !x.note);
    l ? (l.qty += qty) : c.push({ id, size, color, qty, ...(logo ? { logo, ...extra } : {}) });
    store.set("dami-cart", c); syncBadges(); renderCart();
    document.dispatchEvent(new CustomEvent("dami:add", { detail: { id, size, color, qty, logo } }));
    toast(`${shortName(P[id])} je v košíku${logo ? ` · ${logoName(logo)} loga` : ""}`);
  }
  function setQty(i, q) { const c = cart(); if (!c[i]) return; if (q < c[i].qty) document.dispatchEvent(new CustomEvent("dami:remove", { detail: { id: c[i].id, qty: c[i].qty - Math.max(0, q) } })); q < 1 ? c.splice(i, 1) : (c[i].qty = q); store.set("dami-cart", c); syncBadges(); renderCart(); document.dispatchEvent(new Event("dami:cart")); }
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
      <div><div class="ci__name">${esc(p.name)}</div><div class="ci__var">${[l.color && "Farba: " + esc(l.color), l.size && "Veľkosť: " + esc(l.size), l.logo && "Logo: " + logoName(l.logo) + (l.file ? " · " + esc(l.file) : " · logo pošlete neskôr") + (l.note ? " · „" + esc(l.note) + "“" : "") + " (cenu potvrdíme)"].filter(Boolean).join(" · ")}</div>
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
    if (e.target.closest("[data-tab-search]")) { const i = document.querySelector("[data-msrch]"); scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => i?.focus(), 250); return; }
    const t = e.target.closest("[data-open-cart],[data-close-cart],[data-fav],[data-quick],[data-q],[data-open-nav],[data-close-nav],.pc a, a.pc-link");
    if (!t) return;
    if (t.matches("[data-open-cart]")) { e.preventDefault(); document.body.classList.remove("nav-open"); openCart(); }
    else if (t.matches("[data-close-cart]")) closeCart();
    else if (t.matches("[data-open-nav]")) document.body.classList.add("nav-open");
    else if (t.matches("[data-close-nav]")) document.body.classList.remove("nav-open");
    else if (t.matches("[data-fav]")) { e.preventDefault(); const on = toggleFav(t.dataset.fav); t.classList.toggle("is-on", on); toast(on ? "Pridané k obľúbeným" : "Odstránené z obľúbených"); }
    else if (t.matches("[data-quick]")) {
      e.preventDefault(); const p = P[t.dataset.quick];
      const logo = t.dataset.logo || "";
      if (logo || p.sizes.length > 1 || p.colors.length > 1) { nameImg(t.closest(".pc")); location.href = prodUrl(p.id) + (logo ? "&logo=" + logo : "") + "#vyber"; }
      else addToCart(p.id, p.sizes[0] || "", p.colors[0]?.n || "", 1, logo);
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
  const onScroll = () => document.body.classList.toggle("is-scrolled", scrollY > 4);
  addEventListener("scroll", onScroll, { passive: true });
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

  window.DAMI = { LOGO_OPT, logoName, D, P, FIRM, I, ico, LOGO, script, eur, esc, qp, catUrl, prodUrl, secProducts, catProducts, sectionOf, brandLabel, catLabel, shortName,
    card, header, footer, mount, heroB, heroC, heroTiles, crumbsHtml, cleanImg, prodSpecs, REVIEWS, HEUREKA, openNow, stars, gBadge, hBadge, reviewsBlock, deliveryDate, mountFooter, addToCart, setQty, cart, cartTotal, cartCount, favs, isFav, toggleFav, search, reveal, toast, openCart, syncBadges, renderCart, store, FREE };
})();
