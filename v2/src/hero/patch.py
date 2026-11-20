"""Hero sekcie v2 podľa makiet: konkrétny produkt + skutočná cena (overené v data/catalog.js 20. 11. 2026)."""
V = "C:/Users/samue/dami-web/v2/"


def sub1(s, old, new):
    assert s.count(old) == 1, old[:90]
    return s.replace(old, new)


# ---------- dami.js: stav otvorenia predajne ----------
p = V + "js/dami.js"; s = open(p, encoding="utf-8").read()
if "function openNow" not in s:
    s = sub1(s, "  function header(variant = \"dark\", active = \"\") {", """  /* otvorené / zatvorené podľa skutočných hodín: Po–Pi 9:30–17:00, So 9:00–12:00 */
  function openNow(d = new Date()) {
    const day = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    const slot = day >= 1 && day <= 5 ? [570, 1020] : day === 6 ? [540, 720] : null;
    if (slot && m >= slot[0] && m < slot[1]) return { open: true, text: `Teraz otvorené · do ${slot[1] === 1020 ? "17:00" : "12:00"}` };
    const next = (day >= 1 && day <= 4 && m >= 1020) || (day === 0) ? "zajtra o 9:30" : day === 5 && m >= 1020 ? "v sobotu o 9:00" : day === 6 && m >= 720 ? "v pondelok o 9:30" : m < (day === 6 ? 540 : 570) ? `dnes o ${day === 6 ? "9:00" : "9:30"}` : "v pondelok o 9:30";
    return { open: false, text: `Teraz zatvorené · otvárame ${next}` };
  }

  function header(variant = "dark", active = "") {""")
    s = sub1(s, "REVIEWS, HEUREKA, stars,", "REVIEWS, HEUREKA, openNow, stars,")
open(p, "w", encoding="utf-8").write(s)

# ---------- index.html: carousel ----------
p = V + "index.html"; s = open(p, encoding="utf-8").read()
a = s.index("  const SLIDES = ["); b = s.index("  ];", a) + 4
s = s[:a] + """  const live = DAMI.openNow();
  const SLIDES = [
    { k: "gastro", theme: "red hero", img: "img/hero/ban2-gastro.webp", label: "Gastro", h: "Rondon, ktorý zvládne celú zmenu.",
      line: "CHEFLINE rondon, krátky rukáv, čierny<br>za <b>19,90 €</b>", cta: btn("btn--white btn--xl", prodUrl("chefline-rondon-kratky-rukav-cierny-cvoky"), "Pozrieť rondon"),
      cta2: `<a class="btn btn--ghost btn--xl" href="${catUrl("gastro")}">Celé gastro</a>`,
      stk: `<span class="stk stk--round stk--m">Giblors až<b>−14 %</b></span>` },
    { k: "zdrav", theme: "light", img: "img/hero/ban2-zdrav.webp", label: "Zdravotníctvo a wellness", h: "Set blúza + nohavice za 29,80 €",
      line: "CESARE · biela, mätová, bordó, svetlomodrá · XS–3XL", cta: btn("btn--red btn--xl", prodUrl("cesare-zdrav-noh-belasa"), "Vybrať farbu"), cta2: `<a class="link" href="zdravotnictvo.html">Celé zdravotníctvo</a>` },
    { k: "pracovne", theme: "dark", img: "img/hero/ban2-pracovne.webp", label: "Zimné bundy", h: "Bunda CARSON za 27,90 €",
      line: "Predtým 36,00 € · 17 zimných búnd, k tomu vesty a zimné rukavice", cta: btn("btn--red btn--xl", catUrl("zimne-bundy"), "Zimné bundy"), cta2: `<a class="link link--w" href="${prodUrl("carson-bunda-panska")}">Bunda CARSON</a>` },
    { k: "obuv", theme: "red", img: "img/hero/ban2-obuv.webp", label: "Bezpečnostná obuv", h: "Obuv S3 od 39,90 €",
      line: "CXS EVO ICON S3S · kompozitná špica, bez kovu · 41–46", cta: btn("btn--white btn--xl", catUrl("s1-s1p-s3-ocelovou-vystuzou"), "Vybrať obuv"),
      stk: `<span class="stk stk--round stk--ink" style="right:5%;top:9%">Vyskúšaj<br>v predajni</span>` },
    { k: "firmy", theme: "light", img: "img/hero/ban2-firmy.webp", label: "Pre firmy", h: "Vaše logo na celom tíme.",
      line: "Výšivka alebo potlač loga · nákup na faktúru s IČO · ponuka a vzorky", cta: btn("btn--red btn--xl", "pre-firmy.html", "Napísať dopyt") },
    { k: "predajna", theme: "red store", img: "", label: "Predajňa Piešťany", h: "Nájdeš nás na Gaštanovej.",
      line: `<b>${live.text}</b> · ${FIRM.street} · ★ 4,7 Google (42)`, cta: `<a class="btn btn--white btn--xl" href="${FIRM.map}" target="_blank" rel="noopener">Navigovať ${ARR.replace("<svg", '<svg class="ico"')}</a>`,
      art: `<div class="slide__store"><div class="frame"><img src="../assets/img/predajna-exterier.webp" alt="Budova predajne DAMI v Piešťanoch"></div>
        <div class="ticket"><b>Odložíme ti tovar z e-shopu.</b><img src="img/hand-red.png" alt=""></div></div>` },
  ];""" + s[b:]
if "prodUrl" not in s[s.index("const {"):s.index("const {") + 200]:
    s = s.replace("  const { P, card, ico, FIRM, esc, catUrl, secProducts } = DAMI;", "  const { P, card, ico, FIRM, esc, catUrl, prodUrl, secProducts } = DAMI;", 1)
open(p, "w", encoding="utf-8").write(s)

# ---------- kategoria.html: banner s ponukou v hlavičke ----------
p = V + "kategoria.html"; s = open(p, encoding="utf-8").read()
s = sub1(s, """  /* ---------- hlavička kategórie ---------- */""", """  /* ---------- hlavička kategórie: banner s konkrétnou ponukou (ceny z katalógu) ---------- */
  const PROMO = {
    gastro: { img: "img/hero/kat-gastro.webp", t: "red", k: "CHEFLINE · čierny, krátky rukáv", h: "Rondon, ktorý zvládne celú zmenu.", sub: "19,90 €", href: DAMI.prodUrl("chefline-rondon-kratky-rukav-cierny-cvoky"), cta: "Pozrieť rondon" },
    pracovne: { img: "img/hero/kat-pracovne.webp", t: "dark", k: "Zima na stavbe aj v dielni", h: "Zimné bundy od 27,90 €", sub: "17 modelov · bunda CARSON predtým 36,00 €", href: catUrl("zimne-bundy"), cta: "Zimné bundy" },
    obuv: { img: "img/hero/kat-obuv.webp", t: "light", bg: "#ECE8E2", k: "CXS EVO ICON S3S", h: "Bezpečnostná obuv S3 od 39,90 €", sub: "Kompozitná špica, bez kovových súčastí", href: catUrl("s1-s1p-s3-ocelovou-vystuzou"), cta: "Obuv S1–S3" },
    doplnky: { img: "img/hero/kat-doplnky.webp", t: "light", bg: "#EFE6D8", k: "CXS ROXY WINTER", h: "Zimné rukavice od 1,80 €", sub: "Máčané v latexe aj nitrile · rukavice od 0,40 €", href: catUrl("rukavice"), cta: "Rukavice" },
    zdravotnictvo: { img: "img/hero/kat-zdrav.webp", t: "light", bg: "#F3DFE4", k: "CESARE", h: "Set blúza + nohavice za 29,80 €", sub: "Biela, mätová, bordó, svetlomodrá", href: DAMI.prodUrl("cesare-zdrav-noh-belasa"), cta: "Vybrať farbu" },
  };
  const PR = c === "oblubene" ? null : PROMO[sec];""")
s = sub1(s, """    <div class="khd__img"><img src="${heroImg}" alt="" style="object-position:${heroPos}" fetchpriority="high"></div>`;""",
         """    ${PR ? `<a class="khd__img kpro kpro--${PR.t}" href="${PR.href}" style="--kbg:${PR.bg || (PR.t === "red" ? "#D9180F" : "#111")}"><img src="${PR.img}" alt="" fetchpriority="high">
      <span class="kpro__txt"><span class="kpro__k">${PR.k}</span><b class="kpro__h">${PR.h}</b><span class="kpro__sub">${PR.sub}</span><span class="btn ${PR.t === "light" ? "btn--red" : "btn--white"} btn--sm">${PR.cta} ${ico("arrow")}</span></span></a>`
      : `<div class="khd__img"><img src="${heroImg}" alt="" style="object-position:${heroPos}" fetchpriority="high"></div>`}`;""")
open(p, "w", encoding="utf-8").write(s)

p = V + "css/kategoria.css"; s = open(p, encoding="utf-8").read()
if ".kpro" not in s:
    s += """
/* banner s ponukou v hlavičke kategórie */
.kpro { display: block; color: #fff; text-decoration: none; background: var(--kbg); }
.kpro img { object-position: right center; transition: transform .6s var(--ease); }
.kpro:hover img { transform: scale(1.02); }
.kpro__txt { position: absolute; left: 5.5%; top: 50%; translate: 0 -50%; width: 44%; display: grid; justify-items: start; gap: 10px; }
.kpro__k { font: 700 13px/1.2 var(--f); letter-spacing: .08em; text-transform: uppercase; opacity: .85; }
.kpro__h { font: 900 clamp(26px, 2.6vw, 44px)/.95 var(--f-d); font-stretch: 75%; text-wrap: balance; }
.kpro__sub { font-size: clamp(14px, 1.05vw, 17px); font-weight: 600; opacity: .92; }
.kpro .btn { margin-top: 6px; }
.kpro--light { color: var(--ink); }
.kpro--light .kpro__k { color: var(--red); opacity: 1; }
@media (max-width: 760px) {
  .khd__img.kpro { display: block; margin-top: 14px; aspect-ratio: auto; min-height: 0; max-height: none; }
  .kpro img { position: static; height: 170px; object-position: 88% center; }
  .kpro__txt { position: static; translate: none; width: auto; padding: 16px 16px 18px; gap: 8px; }
  .kpro__h { font-size: 30px; }
}
"""
open(p, "w", encoding="utf-8").write(s)

# ---------- zdravotnictvo.html ----------
p = V + "zdravotnictvo.html"; s = open(p, encoding="utf-8").read()
s = sub1(s, """      <h1 class="hx">Pohodlne celú <span class="mk">zmenu.</span></h1>
      <p class="txt">Blúzy, nohavice, kimoná a obuv pre ambulancie, kozmetiku a wellness.</p>
      <div class="sh__cta"><a class="btn btn--red bx" href="kategoria.html?c=zdravotnictvo" data-arrow>Nakupovať</a><a class="ulink" href="index.html">Vrátiť sa na úvod</a></div>""",
         """      <p class="zd-eye">Zdravotníctvo a wellness</p>
      <h1 class="hx">Set blúza + nohavice za&nbsp;29,80&nbsp;€</h1>
      <p class="txt">Zdravotnícka súprava CESARE vo veľkostiach XS–3XL. K tomu blúzy, kimoná a obuv pre ambulancie, kozmetiku a wellness.</p>
      <div class="zd-sw" aria-label="Farby: biela, mätová, bordó, svetlomodrá"><i style="background:#fff"></i><i style="background:#8fd3bf"></i><i style="background:#6d1a2a"></i><i style="background:#8cc4ec"></i><span>biela · mätová · bordó · svetlomodrá</span></div>
      <div class="sh__cta"><a class="btn btn--red bx" href="produkt.html?p=cesare-zdrav-noh-belasa" data-arrow>Vybrať farbu</a><a class="ulink" href="kategoria.html?c=zdravotnictvo">Celé zdravotníctvo</a></div>""")
s = sub1(s, """<div class="sh__ph"><img src="img/zdrav-hero.webp" alt="Usmievavá zdravotná sestra v tmavomodrej zdravotníckej blúze so stetoskopom na chodbe ambulancie" width="2400" height="1339" fetchpriority="high"></div>""",
         """<div class="sh__ph zd-set"><img src="img/hero/zdrav-set.webp" alt="Zdravotnícka súprava CESARE – blúza a nohavice vo farbe bordó" width="1600" height="1040" fetchpriority="high"></div>""")
open(p, "w", encoding="utf-8").write(s)
p = V + "css/zdrav.css"; s = open(p, encoding="utf-8").read()
if ".zd-set" not in s:
    s += """
/* hero: produkt na farbe (makety m-zdrav) */
.zd-hero .zd-set { background: #F3DFE4; }
.zd-hero .zd-set img { object-fit: contain; object-position: center; transform: none; }
.zd-eye { font: 800 13px/1 var(--f); letter-spacing: .1em; text-transform: uppercase; color: #5E5953; }
.zd-hero .hx { font-size: max(40px, calc(84 * var(--u))); }
.zd-sw { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 14px; color: #5E5953; }
.zd-sw i { width: 30px; height: 30px; border-radius: 50%; border: 1px solid #d6d0c8; }
@media (max-width: 760px) { .zd-hero .zd-set img { transform: none; } .zd-hero .hx { font-size: clamp(38px, 11vw, 52px); } }
"""
open(p, "w", encoding="utf-8").write(s)

# ---------- pre-firmy.html ----------
p = V + "pre-firmy.html"; s = open(p, encoding="utf-8").read()
s = sub1(s, """      <p class="txt">Pre reštaurácie, ambulancie, stavebné firmy a dielne z Piešťan a okolia.</p>""",
         """      <p class="txt">Vyšijeme alebo potlačíme vaše logo, pripravíme ponuku a vzorky a nakúpite na faktúru s IČO. Pre reštaurácie, ambulancie, stavebné firmy a dielne z Piešťan a okolia.</p>""")
s = sub1(s, """<div class="sh__ph"><img src="img/foto-tim.webp" alt="Kuchár, zdravotná sestra a pracovníci v pracovnom oblečení pred budovou" width="1600" height="905" fetchpriority="high"></div>""",
         """<div class="sh__ph"><img src="img/hero/firmy-vysivka.webp" alt="Vyšívací stroj vyšíva logo na čiernu polokošeľu (ilustračné foto)" width="1600" height="1060" fetchpriority="high"></div>""")
open(p, "w", encoding="utf-8").write(s)

# ---------- predajna.html ----------
p = V + "predajna.html"; s = open(p, encoding="utf-8").read()
s = sub1(s, """      <p class="txt">Navštívte našu predajňu v Piešťanoch. Odborné poradenstvo, široký výber a možnosť vyskúšania priamo na mieste.</p>
    </div>""", """      <p class="txt">Gaštanová 6396, Piešťany. Poradíme s veľkosťou a všetko si vyskúšate priamo na mieste.</p>
      <p class="pr-live" data-live></p>
      <ul class="pr-chips"><li>Odložíme ti tovar z e-shopu</li><li>Osobný odber zadarmo</li><li><a href="" data-gr target="_blank" rel="noopener">★ 4,7 · 42 hodnotení na Google</a></li></ul>
    </div>""")
s = sub1(s, "<script>DAMI.mountFooter()</script>", """<script>
(() => { const st = DAMI.openNow(), el = document.querySelector("[data-live]"); el.textContent = st.text; el.classList.toggle("is-open", st.open);
  document.querySelector("[data-gr]").href = DAMI.REVIEWS.url; })();
</script>
<script>DAMI.mountFooter()</script>""")
open(p, "w", encoding="utf-8").write(s)
p = V + "css/predajna.css"; s = open(p, encoding="utf-8").read()
if ".pr-live" not in s:
    s += """
.pr-live { display: inline-flex; align-items: center; gap: 10px; font-weight: 700; font-size: max(15px, calc(19 * var(--u))); }
.pr-live::before { content: ""; width: 11px; height: 11px; border-radius: 50%; background: #9a948c; }
.pr-live.is-open::before { background: #1f9d55; box-shadow: 0 0 0 4px rgba(31,157,85,.16); }
.pr-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.pr-chips li { padding: 8px 14px; border-radius: 999px; background: var(--card); font-size: 14px; font-weight: 600; }
.pr-chips a { color: inherit; text-decoration: none; }
"""
open(p, "w", encoding="utf-8").write(s)
print("ok")
