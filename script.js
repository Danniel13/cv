// Helpers
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];

/* ===== Mobile nav ===== */
const menuBtn = $("#menuBtn");
const mobileNav = $("#mobileNav");

if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.hidden = isOpen;
  });

  $$("#mobileNav a").forEach(a => {
    a.addEventListener("click", () => {
      menuBtn.setAttribute("aria-expanded", "false");
      mobileNav.hidden = true;
    });
  });
}

/* ===== Smooth scroll ===== */
$$('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ===== Reveal on scroll ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });

$$(".reveal").forEach(el => io.observe(el));

/* ===== KPI counters ===== */
function animateCount(el, to) {
  const duration = 900;
  const start = performance.now();
  const from = 0;

  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(from + (to - from) * eased);
    el.textContent = String(val);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const kpis = $$(".kpi__n");
const kpiIO = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const to = Number(el.dataset.count || "0");
    animateCount(el, to);
    kpiIO.unobserve(el);
  });
}, { threshold: 0.35 });

kpis.forEach(k => kpiIO.observe(k));

/* ===== Modal system ===== */
const modalRoot = $("#modalRoot");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");

function openModal(templateId, title = "Detalle") {
  const tpl = document.getElementById(templateId);
  if (!tpl) return;

  modalTitle.textContent = title;
  modalBody.innerHTML = "";
  modalBody.appendChild(tpl.content.cloneNode(true));

  modalRoot.hidden = false;
  modalRoot.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // focus trap (simple)
  const closeBtn = $('.modal__close', modalRoot);
  closeBtn && closeBtn.focus();
}

function closeModal() {
  modalRoot.hidden = true;
  modalRoot.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-modal]");
  if (openBtn) {
    const id = openBtn.getAttribute("data-modal");
    const title = openBtn.dataset.title || openBtn.textContent.trim();
    openModal(id, title);
    return;
  }

  if (e.target.matches("[data-close]")) {
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalRoot && !modalRoot.hidden) closeModal();
});

/* ===== Filter + Search (Automatizaciones) ===== */
const grid = $("#projGrid");
const search = $("#search");
const filterBtns = $$(".fbtn");

let currentFilter = "all";
let currentQuery = "";

function matchesFilter(card) {
  const tags = (card.dataset.tags || "").split(/\s+/);
  if (currentFilter === "all") return true;
  return tags.includes(currentFilter);
}

function matchesQuery(card) {
  if (!currentQuery) return true;
  const title = (card.dataset.title || "").toLowerCase();
  const text = card.textContent.toLowerCase();
  return title.includes(currentQuery) || text.includes(currentQuery);
}

function applyFilters() {
  if (!grid) return;
  const cards = $$(".pCard", grid);
  cards.forEach(c => {
    const ok = matchesFilter(c) && matchesQuery(c);
    c.style.display = ok ? "" : "none";
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    const raw = btn.dataset.filter;
    // map UI categories to tags used in cards
    currentFilter = raw === "ops" ? "ops" : raw === "sec" ? "sec" : raw === "biz" ? "biz" : "all";
    applyFilters();
  });
});

if (search) {
  search.addEventListener("input", (e) => {
    currentQuery = e.target.value.trim().toLowerCase();
    applyFilters();
  });
}

/* ===== Footer year ===== */
const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());
