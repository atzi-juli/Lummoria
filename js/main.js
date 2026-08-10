/**
 * =====================================================================
 * MAIN.JS — Render + interacciones
 * =====================================================================
 * Este archivo lee SITE_CONFIG (config.js) y construye el DOM.
 * No necesitas editar este archivo para cambiar contenido — edita config.js.
 * =====================================================================
 */

(function () {
  const cfg = SITE_CONFIG;

  /* ---------------------------------------------------------------- */
  /* Helpers                                                           */
  /* ---------------------------------------------------------------- */
  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else node.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  };

  const iconSvg = (name) => {
    const icons = {
      hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 12V5a1.5 1.5 0 0 1 3 0v5M11 10V4a1.5 1.5 0 0 1 3 0v6M14 10V5.5a1.5 1.5 0 0 1 3 0V13M17 10.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L4 15.8c-.6-1-.3-2 .6-2.5.8-.4 1.7-.1 2.3.7L8 15"/></svg>',
      spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/><circle cx="12" cy="12" r="3.2"/></svg>',
      leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M20 4C10 4 4 10 4 18c0 .6.4 1 1 1 8 0 14-6 14-15 0-.3 0-.3 1 0Z"/><path d="M6 18c3-4 7-8 12-11"/></svg>',
      flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3c1 3-2 4-2 7a3 3 0 1 0 6 0c0-1-1-1.6-1-2.8 1.6 1 3 3.2 3 5.8a6 6 0 1 1-12 0c0-4 2.5-6 3.5-9.5.6-1 1.5-1 2.5-.5Z"/></svg>',
    };
    return icons[name] || "";
  };

  /* ---------------------------------------------------------------- */
  /* Header + Nav                                                      */
  /* ---------------------------------------------------------------- */
  function renderHeader() {
    const nav = document.getElementById("nav-links");
    cfg.nav.forEach((item) => {
      nav.appendChild(el("a", { href: item.href, class: "nav-link" }, item.label));
    });
    document.getElementById("brand-name").textContent = cfg.brand.name;
    document.getElementById("brand-name-footer").textContent = cfg.brand.name;

    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    cfg.nav.forEach((item) => {
      mobileMenu.appendChild(el("a", { href: item.href, class: "mobile-nav-link" }, item.label));
    });
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
      mobileToggle.classList.toggle("is-open");
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        mobileToggle.classList.remove("is-open");
      })
    );

    // Header sutil al hacer scroll
    const header = document.getElementById("site-header");
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 24);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Hero                                                               */
  /* ---------------------------------------------------------------- */
  function renderHero() {
    document.getElementById("hero-title").textContent = cfg.hero.title;
    document.getElementById("hero-subtitle").textContent = cfg.hero.subtitle;
    document.getElementById("hero-cta-primary").textContent = cfg.hero.ctaPrimary;
    document.getElementById("hero-cta-secondary").textContent = cfg.hero.ctaSecondary;
    document.getElementById("hero-image").src = cfg.hero.image;

    document.getElementById("hero-cta-primary").addEventListener("click", () => {
      trackEvent("hero_cta_click", { cta: "primary", label: cfg.hero.ctaPrimary });
    });
    document.getElementById("hero-cta-secondary").addEventListener("click", () => {
      trackEvent("hero_cta_click", { cta: "secondary", label: cfg.hero.ctaSecondary });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Categorías                                                         */
  /* ---------------------------------------------------------------- */
  function renderCategories() {
    const grid = document.getElementById("category-grid");
    cfg.categories.forEach((cat, i) => {
      const card = el("div", { class: "category-card reveal", style: `transition-delay:${i * 90}ms` }, [
        el("div", { class: "category-card__image-wrap" }, [
          el("img", { src: cat.image, alt: cat.name, class: "category-card__image", loading: "lazy" }),
          el("span", { class: "category-card__icon" }, cat.icon),
        ]),
        el("div", { class: "category-card__body" }, [
          el("h3", { class: "category-card__title" }, cat.name),
          el("p", { class: "category-card__desc" }, cat.description),
          el("button", { class: "link-btn", type: "button" }, "Explorar →"),
        ]),
      ]);
      card.querySelector(".link-btn").addEventListener("click", () => {
        trackEvent("category_click", { category_id: cat.id, category_name: cat.name });
        document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
        setActiveCategoryFilter(cat.id);
      });
      grid.appendChild(card);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Productos                                                          */
  /* ---------------------------------------------------------------- */
  let activeFilter = "all";
  const productObserverTracked = new Set();

  function setActiveCategoryFilter(catId) {
    activeFilter = catId;
    document.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === catId);
    });
    renderProductGrid();
  }

  function renderFilterPills() {
    const wrap = document.getElementById("product-filters");
    const all = el("button", { class: "filter-pill is-active", "data-filter": "all", type: "button" }, "Todas");
    all.addEventListener("click", () => setActiveCategoryFilter("all"));
    wrap.appendChild(all);
    cfg.categories.forEach((cat) => {
      const pill = el("button", { class: "filter-pill", "data-filter": cat.id, type: "button" }, cat.name);
      pill.addEventListener("click", () => setActiveCategoryFilter(cat.id));
      wrap.appendChild(pill);
    });
  }

  function renderProductGrid() {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";
    const items =
      activeFilter === "all" ? cfg.products : cfg.products.filter((p) => p.category === activeFilter);

    items.forEach((product, index) => {
      const card = el("article", { class: "product-card reveal", "data-product-id": product.id }, [
        el("div", { class: "product-card__image-wrap" }, [
          el("img", { src: product.image, alt: product.name, class: "product-card__image", loading: "lazy" }),
          el("span", { class: "product-card__category" }, product.categoryLabel),
        ]),
        el("div", { class: "product-card__body" }, [
          el("h3", { class: "product-card__title" }, product.name),
          el("p", { class: "product-card__desc" }, product.description),
          el("div", { class: "product-card__footer" }, [
            el("span", { class: "product-card__price" }, product.price),
            el(
              "button",
              { class: "btn-heart", type: "button", "data-product-id": product.id },
              ["♥ ", "Quiero esta vela"]
            ),
          ]),
        ]),
      ]);

      const btn = card.querySelector(".btn-heart");
      btn.addEventListener("click", () => {
        trackEvent("product_interest", {
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          position: index + 1,
        });
        openInterestModal(product);
      });

      grid.appendChild(card);
    });

    observeReveals();
    observeProductViews(items);
  }

  function observeProductViews(items) {
    const cards = document.querySelectorAll(".product-card");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.dataset.productId;
          if (entry.isIntersecting && !productObserverTracked.has(id)) {
            productObserverTracked.add(id);
            const product = items.find((p) => p.id === id);
            if (product) {
              trackEvent("product_view", { product_id: product.id, product_name: product.name });
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    cards.forEach((c) => io.observe(c));
  }

  /* ---------------------------------------------------------------- */
  /* Modal de interés                                                   */
  /* ---------------------------------------------------------------- */
  function openInterestModal(product) {
    const modal = document.getElementById("interest-modal");
    document.getElementById("modal-product-name").textContent = product.name;
    modal.dataset.productId = product.id;
    modal.dataset.productName = product.name;
    modal.dataset.productCategory = product.category;
    document.getElementById("modal-step-form").classList.remove("hidden");
    document.getElementById("modal-step-thanks").classList.add("hidden");
    document.getElementById("modal-contact-input").value = "";
    modal.classList.add("open");
    document.body.classList.add("no-scroll");
  }

  function closeInterestModal() {
    document.getElementById("interest-modal").classList.remove("open");
    document.body.classList.remove("no-scroll");
  }

  function wireModal() {
    const modal = document.getElementById("interest-modal");
    document.getElementById("modal-close").addEventListener("click", closeInterestModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeInterestModal();
    });
    document.getElementById("modal-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const contact = document.getElementById("modal-contact-input").value.trim();
      if (!contact) return;
      trackEvent("lead_product_interest", {
        product_id: modal.dataset.productId,
        product_name: modal.dataset.productName,
        category: modal.dataset.productCategory,
        contact_provided: true,
      });
      document.getElementById("modal-step-form").classList.add("hidden");
      document.getElementById("modal-step-thanks").classList.remove("hidden");
    });
  }

  /* ---------------------------------------------------------------- */
  /* Propuesta de valor                                                 */
  /* ---------------------------------------------------------------- */
  function renderValueProps() {
    const wrap = document.getElementById("value-grid");
    cfg.valueProps.forEach((v, i) => {
      wrap.appendChild(
        el("div", { class: "value-item reveal", style: `transition-delay:${i * 90}ms` }, [
          el("span", { class: "value-item__icon", html: iconSvg(v.icon) }),
          el("h3", { class: "value-item__title" }, v.title),
          el("p", { class: "value-item__desc" }, v.description),
        ])
      );
    });
  }

  /* ---------------------------------------------------------------- */
  /* Brand story                                                        */
  /* ---------------------------------------------------------------- */
  function renderBrandStory() {
    document.getElementById("story-title").textContent = cfg.brandStory.title;
    document.getElementById("story-image").src = cfg.brandStory.image;
    const p = document.getElementById("story-paragraphs");
    cfg.brandStory.paragraphs.forEach((text) => p.appendChild(el("p", { class: "story-paragraph" }, text)));
  }

  /* ---------------------------------------------------------------- */
  /* Encuesta de preferencia                                            */
  /* ---------------------------------------------------------------- */
  function renderPoll() {
    document.getElementById("poll-title").textContent = cfg.poll.title;
    const wrap = document.getElementById("poll-options");
    cfg.categories.forEach((cat) => {
      const btn = el("button", { class: "poll-option", type: "button", "data-cat": cat.id }, [
        el("span", { class: "poll-option__icon" }, cat.icon),
        el("span", { class: "poll-option__label" }, cat.name),
      ]);
      btn.addEventListener("click", () => {
        trackEvent("category_preference", { category_id: cat.id, category_name: cat.name });
        document.querySelectorAll(".poll-option").forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        document.getElementById("poll-thanks").classList.remove("hidden");
        document.getElementById("poll-thanks").textContent = cfg.poll.thanks;
      });
      wrap.appendChild(btn);
    });
  }

  /* ---------------------------------------------------------------- */
  /* CTA final                                                          */
  /* ---------------------------------------------------------------- */
  function renderFinalCta() {
    document.getElementById("final-cta-title").textContent = cfg.finalCta.title;
    document.getElementById("final-cta-subtitle").textContent = cfg.finalCta.subtitle;
    document.getElementById("final-cta-btn").textContent = cfg.finalCta.cta;

    document.getElementById("final-cta-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const val = document.getElementById("final-cta-input").value.trim();
      if (!val) return;
      trackEvent("lead_start", { source: "final_cta", contact_provided: true });
      document.getElementById("final-cta-form").classList.add("hidden");
      document.getElementById("final-cta-thanks").classList.remove("hidden");
    });
  }

  /* ---------------------------------------------------------------- */
  /* Footer                                                             */
  /* ---------------------------------------------------------------- */
  function renderFooter() {
    ["instagram", "tiktok", "whatsapp"].forEach((key) => {
      const a = document.getElementById(`footer-${key}`);
      a.href = cfg.footer[key];
      a.addEventListener("click", () => trackEvent("social_click", { network: key }));
    });
    document.getElementById("footer-privacy").href = cfg.footer.privacy;
    document.getElementById("footer-year").textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------- */
  /* Scroll reveal                                                      */
  /* ---------------------------------------------------------------- */
  function observeReveals() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal:not(.is-visible)").forEach((elm) => io.observe(elm));
  }

  /* ---------------------------------------------------------------- */
  /* Init                                                                */
  /* ---------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderHero();
    renderCategories();
    renderFilterPills();
    renderProductGrid();
    renderValueProps();
    renderBrandStory();
    renderPoll();
    renderFinalCta();
    renderFooter();
    wireModal();
    observeReveals();
  });
})();
