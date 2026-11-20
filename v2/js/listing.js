/* DAMI — výpis produktov s filtrami (veľkosť, farba, značka, cena, kategórie), zoradením a stránkovaním.
   Použitie: DAMI.listing({ root, base, subs, all }) — root = element s markupom ako v kategoria.html (.cat). */
(function () {
  const { D, P, ico, card, esc, FIRM, catUrl } = DAMI;
  /* produkt patrí do kategórie podľa p.cats alebo zoznamu produktov kategórie (virtuálne kategórie) */
  const inCat = (p, k) => p.cats.includes(k) || (D.cats[k]?.products || []).includes(p.id);
  const FUNNEL = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 4.5h17l-6.5 8v6l-4 2v-8z"/></svg>';
  const plural = n => n === 1 ? "produkt" : n >= 2 && n <= 4 ? "produkty" : "produktov";
  const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "XXXL", "3XL", "4XL", "5XL", "6XL", "7XL"];
  const sizeKey = s => { const i = SIZE_ORDER.indexOf(s.toUpperCase()); if (i >= 0) return i; const n = parseFloat(s); return isNaN(n) ? 999 : 100 + n; };
  const count = (arr, fn) => { const m = new Map(); arr.forEach(p => fn(p).forEach(v => m.set(v, (m.get(v) || 0) + 1))); return m; };
  const light = h => { const n = parseInt(h.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 225; };

  function listing({ root, base, subs = [], per = 24 }) {
    const $ = s => root.querySelector(s);
    const PER = per;
    const qs = new URLSearchParams(location.search), k0 = qs.get("k"), b0 = qs.get("b");
    const brands = [...count(base, p => p.brand ? [p.brand] : [])].sort((a, b) => b[1] - a[1]);
    const sizes = [...count(base, p => p.sizes)].map(([s]) => s).sort((a, b) => sizeKey(a) - sizeKey(b) || a.localeCompare(b, "sk", { numeric: true }));
    const colMap = new Map(); base.forEach(p => p.colors.forEach(cl => { if (cl.h.length === 1) { const e = colMap.get(cl.h[0]) || { h: cl.h[0], n: cl.n, k: 0 }; e.k++; colMap.set(cl.h[0], e); } }));
    const colors = [...colMap.values()].sort((a, b) => b.k - a.k).slice(0, 14);
    const prices = base.map(p => p.price).filter(Boolean);
    const LO = prices.length ? Math.floor(Math.min(...prices)) : 0, HI = prices.length ? Math.ceil(Math.max(...prices)) : 1;
    const st = { cats: k0 && subs.includes(k0) ? [k0] : [], brands: b0 && brands.some(x => x[0] === b0) ? [b0] : [], sizes: [], colors: [], min: LO, max: HI, sort: "pop", page: 1 };
    const more = { brand: false, size: false };

    function renderSide() {
      const chkList = (items, sel, key) => items.map(([v, lab, n]) => `<label class="chk"><input type="checkbox" data-f="${key}" value="${esc(v)}" ${sel.includes(v) ? "checked" : ""}><span>${esc(lab)}</span><small>${n}</small></label>`).join("");
      const catItems = subs.filter(k => D.cats[k]).map(k => [k, D.cats[k].name, base.filter(p => inCat(p, k)).length]).filter(x => x[2]);
      const br = more.brand ? brands : brands.slice(0, 5), sz = more.size ? sizes : sizes.slice(0, 12);
      const grp = (id, t, body) => `<div class="fg" data-g="${id}"><button class="fg__hd" data-toggle aria-expanded="true">${t}${ico("chev")}</button><div class="fg__bd">${body}</div></div>`;
      $("[data-side]").innerHTML = `<div class="sheet__hd"><b>Filtre</b><button class="drawer__x" data-sheet-close aria-label="Zavrieť">${ico("x")}</button></div>
        ${catItems.length > 1 ? grp("k", "Kategórie", chkList(catItems, st.cats, "cats")) : ""}
        ${sizes.length ? grp("s", "Veľkosť", `<div class="sizes">${sz.map(s => `<button class="sz ${st.sizes.includes(s) ? "is-on" : ""}" data-f="sizes" value="${esc(s)}" aria-pressed="${st.sizes.includes(s)}">${esc(s)}</button>`).join("")}</div>` + (sizes.length > 12 ? `<button class="fg__more" data-more-f="size">${more.size ? "Zobraziť menej" : `Všetky veľkosti (${sizes.length})`}</button>` : "")) : ""}
        ${colors.length ? grp("f", "Farba", `<div class="cols">${colors.map(cl => `<button class="cl ${st.colors.includes(cl.h) ? "is-on" : ""} ${light(cl.h) ? "is-light" : ""}" data-f="colors" value="${cl.h}" title="${esc(cl.n)}" aria-label="${esc(cl.n)}" aria-pressed="${st.colors.includes(cl.h)}" style="background:${cl.h}"></button>`).join("")}</div>`) : ""}
        ${brands.length ? grp("b", "Značka", chkList(br.map(([b, n]) => [b, b, n]), st.brands, "brands") + (brands.length > 5 ? `<button class="fg__more" data-more-f="brand">${more.brand ? "Zobraziť menej" : `Všetky značky (${brands.length})`}</button>` : "")) : ""}
        ${prices.length ? grp("p", "Cena", `<div class="range__val"><span data-rv="min"></span><span data-rv="max"></span></div>
            <div class="range"><div class="range__track"></div><div class="range__fill" data-fill></div>
            <input type="range" min="${LO}" max="${HI}" value="${st.min}" data-r="min" aria-label="Cena od"><input type="range" min="${LO}" max="${HI}" value="${st.max}" data-r="max" aria-label="Cena do"></div>`) : ""}
        <button class="side__reset" data-reset>Zrušiť všetky filtre</button>
        <div class="sheet__ft"><button class="btn btn--red btn--block" data-sheet-close data-sheet-count></button></div>`;
      paintRange();
    }
    function paintRange() {
      const f = $("[data-fill]"); if (!f) return;
      const w = HI - LO || 1;
      f.style.left = (st.min - LO) / w * 100 + "%"; f.style.right = (HI - st.max) / w * 100 + "%";
      $('[data-rv="min"]').textContent = `${st.min} €`; $('[data-rv="max"]').textContent = `${st.max} €`;
    }
    const active = () => st.cats.length + st.brands.length + st.sizes.length + st.colors.length + (st.min > LO || st.max < HI ? 1 : 0);
    function filtered() {
      const r = base.filter(p =>
        (!st.cats.length || st.cats.some(k => inCat(p, k))) &&
        (!st.brands.length || st.brands.includes(p.brand)) &&
        (!st.sizes.length || st.sizes.some(s => p.sizes.includes(s))) &&
        (!st.colors.length || p.colors.some(cl => st.colors.includes(cl.h[0]))) &&
        (!p.price || (p.price >= st.min && p.price <= st.max)));
      const cmp = { asc: (a, b) => (a.price || 1e9) - (b.price || 1e9), desc: (a, b) => b.price - a.price, name: (a, b) => a.name.localeCompare(b.name, "sk") }[st.sort];
      return cmp ? [...r].sort(cmp) : r;
    }
    function pager(cur, pages) {
      if (pages < 2) return "";
      const nums = Array.from({ length: pages }, (_, i) => i + 1);
      return `<button class="pager__b" data-page="${cur - 1}" ${cur === 1 ? "disabled" : ""} aria-label="Predchádzajúca strana">${ico("chevL")}</button>
        ${nums.map(n => `<button class="pager__b ${n === cur ? "is-on" : ""}" data-page="${n}" ${n === cur ? 'aria-current="page"' : ""}>${n}</button>`).join("")}
        <button class="pager__b" data-page="${cur + 1}" ${cur === pages ? "disabled" : ""} aria-label="Ďalšia strana">${ico("chevR")}</button>`;
    }
    function render() {
      const r = filtered(), pages = Math.max(1, Math.ceil(r.length / PER));
      st.page = Math.min(st.page, pages);
      const from = (st.page - 1) * PER, n = active();
      $("[data-count]").textContent = r.length > PER ? `${from + 1} – ${Math.min(from + PER, r.length)} z ${r.length} ${plural(r.length)}` : `${r.length} ${plural(r.length)}`;
      $("[data-sheet-open]").innerHTML = `${FUNNEL}<span>Filtrovať${n ? ` (${n})` : ""}</span>`;
      const sc = $("[data-sheet-count]"); if (sc) sc.textContent = `Zobraziť ${r.length} ${plural(r.length)}`;
      $("[data-reset]")?.classList.toggle("is-on", n > 0);
      $("[data-sort]").value = st.sort;
      $("[data-grid]").innerHTML = r.length ? r.slice(from, from + PER).map(p => card(p, { add: true, noSw: true })).join("") :
        `<div class="empty" style="grid-column:1/-1"><h3>Nič sme nenašli</h3><p class="muted">Skús zrušiť niektorý filter alebo nám zavolaj na ${FIRM.phone}. Radi poradíme.</p><button class="btn btn--line btn--sm" data-reset>Zrušiť filtre</button></div>`;
      $("[data-pager]").innerHTML = pager(st.page, pages);
      const chips = [...st.cats.map(v => ["cats", v, D.cats[v]?.name || v]), ...st.brands.map(v => ["brands", v, v]), ...st.sizes.map(v => ["sizes", v, "Veľkosť " + v]),
        ...st.colors.map(v => ["colors", v, colMap.get(v)?.n || "Farba"]), ...(st.min > LO || st.max < HI ? [["price", "", `${st.min} – ${st.max} €`]] : [])];
      $("[data-chips]").innerHTML = chips.length ? chips.map(([k, v, t]) => `<button class="chip" data-chip="${k}" value="${esc(v)}">${esc(t)} ${ico("x")}</button>`).join("") + (chips.length > 1 ? `<button class="chip chip--reset" data-reset>Zrušiť všetko</button>` : "") : "";
    }
    const toggle = (arr, v) => { const i = arr.indexOf(v); i < 0 ? arr.push(v) : arr.splice(i, 1); };
    const refilter = () => { st.page = 1; render(); };

    const side = $("[data-side]");
    side.addEventListener("change", e => { const t = e.target; if (t.dataset.f) { toggle(st[t.dataset.f], t.value); refilter(); } });
    side.addEventListener("input", e => {
      const t = e.target; if (!t.dataset.r) return;
      let v = +t.value;
      if (t.dataset.r === "min") { v = Math.min(v, st.max - 1); st.min = v; } else { v = Math.max(v, st.min + 1); st.max = v; }
      t.value = v; paintRange(); clearTimeout(side._t); side._t = setTimeout(refilter, 120);
    });
    root.addEventListener("click", e => {
      const t = e.target.closest("button, [data-sheet-close]"); if (!t) return;
      if (t.matches(".sz, .cl")) { toggle(st[t.dataset.f], t.value); const on = t.classList.toggle("is-on"); t.setAttribute("aria-pressed", on); refilter(); }
      else if (t.matches("[data-toggle]")) { const g = t.parentElement; g.classList.toggle("is-closed"); t.setAttribute("aria-expanded", !g.classList.contains("is-closed")); }
      else if (t.matches("[data-more-f]")) { more[t.dataset.moreF] = !more[t.dataset.moreF]; renderSide(); }
      else if (t.matches("[data-reset]")) { Object.assign(st, { cats: [], brands: [], sizes: [], colors: [], min: LO, max: HI, page: 1 }); renderSide(); render(); }
      else if (t.matches("[data-chip]")) { const k = t.dataset.chip; k === "price" ? (st.min = LO, st.max = HI) : toggle(st[k], t.value); renderSide(); refilter(); }
      else if (t.matches("[data-page]")) { st.page = +t.dataset.page; render(); const top = $(".cat").getBoundingClientRect().top + scrollY - 90; if (scrollY > top) scrollTo({ top, behavior: "smooth" }); }
      else if (t.matches("[data-sheet-open]")) document.body.classList.add("sheet-open");
      if (t.matches("[data-sheet-close]")) document.body.classList.remove("sheet-open");
    });
    $("[data-sort]").addEventListener("change", e => { st.sort = e.target.value; refilter(); });
    $(".sort").insertAdjacentHTML("beforeend", ico("chev", "ico sort__chev"));
    /* filter z dlaždíc: odkaz #vsetko?k=zdrav-obuv nastaví kategóriu */
    DAMI.listingSetCat = k => { st.cats = k ? [k] : []; renderSide(); refilter(); };
    renderSide(); render();
  }
  DAMI.listing = listing;
})();
