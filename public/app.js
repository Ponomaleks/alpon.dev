(() => {
  "use strict";

  // CV files. Page previews (webp) are shown on phones and in browsers
  // without a built-in PDF viewer, where an inline PDF would be blank or cut off.
  const CV = {
    en: { label: "English", pdf: "/cv/alexander-ponomarenko-cv-en.pdf", file: "Alexander_Ponomarenko_CV_EN.pdf", pages: 2 },
    no: { label: "Norsk", pdf: "/cv/alexander-ponomarenko-cv-no.pdf", file: "Alexander_Ponomarenko_CV_NO.pdf", pages: 2 },
  };
  const preview = (lang, n) => `/cv/cv-${lang}-${n}.webp`;

  const $ = (s) => document.querySelector(s);
  const tabs = [...document.querySelectorAll('.seg [role="tab"]')];
  const panel = $("#cv-panel");
  const pages = $(".viewer__pages");
  const openBtn = $("#cv-open");
  const dlBtn = $("#cv-download");
  const meta = $("#cv-meta");
  const tpl = $("#tpl-pages");

  const narrow = window.matchMedia("(max-width: 719px)");
  const usePreviews = () => navigator.pdfViewerEnabled === false || narrow.matches;

  let current = "en";

  function showPreviews(c, lang) {
    const nodes = [];
    for (let i = 1; i <= c.pages; i++) {
      const a = tpl.content.firstElementChild.cloneNode(true);
      a.href = c.pdf;
      a.setAttribute("aria-label", `CV ${c.label}, page ${i} of ${c.pages}. Opens the PDF`);
      const img = a.querySelector("img");
      img.loading = i === 1 ? "eager" : "lazy";
      img.src = preview(lang, i);
      nodes.push(a);
    }
    pages.replaceChildren(...nodes);
  }

  function showFrame(c) {
    const old = document.getElementById("cv-frame");
    const src = `${c.pdf}#view=FitH&pagemode=none`;
    if (old.getAttribute("src") === src) return;
    // A fresh iframe instead of changing src: no extra history entries per switch.
    const f = old.cloneNode(false);
    f.src = src;
    f.title = `CV, ${c.label} (PDF)`;
    old.replaceWith(f);
  }

  function render() {
    const c = CV[current];
    const previews = usePreviews();
    const frame = document.getElementById("cv-frame");

    frame.hidden = previews;
    pages.hidden = !previews;
    if (previews) {
      frame.removeAttribute("src");
      showPreviews(c, current);
    } else {
      pages.replaceChildren();
      showFrame(c);
    }

    openBtn.href = c.pdf;
    dlBtn.href = c.pdf;
    dlBtn.setAttribute("download", c.file);
    meta.textContent = `PDF · ${c.pages} pages · A4`;
    panel.setAttribute("aria-labelledby", `tab-${current}`);
    document.documentElement.dataset.cv = current;
  }

  function select(lang, { focus = false, updateUrl = true } = {}) {
    if (!CV[lang]) return;
    current = lang;
    tabs.forEach((t) => {
      const on = t.dataset.lang === lang;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    render();
    if (updateUrl) {
      const hash = lang === "no" ? "#cv-no" : "#cv";
      history.replaceState(null, "", hash);
    }
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t.dataset.lang));
    t.addEventListener("keydown", (e) => {
      const keys = { ArrowRight: 1, ArrowLeft: -1, Home: "first", End: "last" };
      if (!(e.key in keys)) return;
      e.preventDefault();
      const k = keys[e.key];
      const next = k === "first" ? tabs[0] : k === "last" ? tabs.at(-1) : tabs[(i + k + tabs.length) % tabs.length];
      select(next.dataset.lang, { focus: true });
    });
  });

  narrow.addEventListener("change", render);

  // Copy e-mail
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const label = btn.querySelector(".copy__label");
    let t;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add("is-done");
        label.textContent = "Copied";
        clearTimeout(t);
        t = setTimeout(() => { btn.classList.remove("is-done"); label.textContent = "Copy"; }, 1800);
      } catch {
        window.location.href = `mailto:${btn.dataset.copy}`;
      }
    });
  });

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Deep links: alpon.dev/#cv-no opens the Norwegian CV.
  const fromHash = /^#cv-no$/i.test(location.hash) ? "no" : "en";
  select(fromHash, { updateUrl: false });
  if (fromHash === "no") document.getElementById("cv").scrollIntoView();
})();
