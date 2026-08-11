/**
 * =====================================================================
 * MAIN.JS — Render + interacciones
 * =====================================================================
 * Lee SITE_CONFIG (config.js), construye la landing y gestiona:
 * - productos y filtros
 * - modal de interés individual
 * - "Mi selección" (carrito de interés, sin pagos)
 * - Formspree + eventos de analítica
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
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
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

  function syncBodyScrollLock() {
    const interestOpen = document.getElementById("interest-modal")?.classList.contains("open");
    const selectionOpen = document.getElementById("selection-cart-overlay")?.classList.contains("open");
    document.body.classList.toggle("no-scroll", Boolean(interestOpen || selectionOpen));
  }

  /* ---------------------------------------------------------------- */
  /* Mi selección — estado, cantidades y persistencia                  */
  /* ---------------------------------------------------------------- */
  const SELECTION_STORAGE_KEY = "lummoria_selected_products";
  let selectedProducts = []; // [{ id: string, quantity: number }]

  function getProductById(productId) {
    return cfg.products.find((product) => product.id === productId) || null;
  }

  function getSelectionEntry(productId) {
    return selectedProducts.find((item) => item.id === productId) || null;
  }

  function getProductQuantity(productId) {
    return getSelectionEntry(productId)?.quantity || 0;
  }

  function getSelectedProductObjects() {
    return selectedProducts
      .map((item) => {
        const product = getProductById(item.id);
        return product ? { ...product, quantity: item.quantity } : null;
      })
      .filter(Boolean);
  }

  function getSelectedTotalQuantity() {
    return selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
  }

  function loadSelection() {
    let stored = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY) || "[]");
      if (Array.isArray(parsed)) stored = parsed;
    } catch (e) {
      stored = [];
    }

    const validIds = new Set(cfg.products.map((product) => product.id));
    const merged = new Map();

    // Compatibilidad con la versión anterior: ["id-1", "id-2"]
    // y con la nueva: [{ id: "id-1", quantity: 2 }].
    stored.forEach((item) => {
      if (typeof item === "string" && validIds.has(item)) {
        merged.set(item, (merged.get(item) || 0) + 1);
        return;
      }

      if (item && typeof item === "object" && typeof item.id === "string" && validIds.has(item.id)) {
        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
        merged.set(item.id, (merged.get(item.id) || 0) + quantity);
      }
    });

    selectedProducts = Array.from(merged, ([id, quantity]) => ({ id, quantity }));
    saveSelection();
  }

  function saveSelection() {
    try {
      localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(selectedProducts));
    } catch (e) {
      // localStorage puede estar deshabilitado; la selección seguirá viva en memoria.
    }
  }

  function isProductSelected(productId) {
    return getProductQuantity(productId) > 0;
  }

  function updateSelectionCounter() {
    const totalQuantity = getSelectedTotalQuantity();
    const count = document.getElementById("selection-cart-count");
    const button = document.getElementById("selection-cart-button");
    if (count) count.textContent = String(totalQuantity);
    if (button) {
      button.classList.toggle("has-items", totalQuantity > 0);
      button.setAttribute(
        "aria-label",
        totalQuantity
          ? `Abrir mi selección: ${totalQuantity} ${totalQuantity === 1 ? "vela" : "velas"}`
          : "Abrir mi selección de velas"
      );
    }
  }

  function syncProductSelectionButtons() {
    document.querySelectorAll(".product-selection-control[data-selection-product-id]").forEach((control) => {
      const productId = control.dataset.selectionProductId;
      const quantity = getProductQuantity(productId);
      const addButton = control.querySelector(".btn-select");
      const stepper = control.querySelector(".product-quantity-stepper");
      const quantityLabel = control.querySelector(".product-quantity-value");

      if (addButton) {
        addButton.classList.toggle("hidden", quantity > 0);
        addButton.setAttribute("aria-pressed", quantity > 0 ? "true" : "false");
      }
      if (stepper) stepper.classList.toggle("hidden", quantity === 0);
      if (quantityLabel) quantityLabel.textContent = String(quantity);
    });
  }

  function addToSelection(productId, amount = 1) {
    const product = getProductById(productId);
    const increment = Math.max(1, Math.floor(Number(amount) || 1));
    if (!product) return false;

    const entry = getSelectionEntry(productId);
    if (entry) entry.quantity += increment;
    else selectedProducts.push({ id: productId, quantity: increment });

    saveSelection();
    updateSelectionCounter();
    syncProductSelectionButtons();
    renderSelectionCart();

    trackEvent("cart_add", {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      quantity: increment,
      resulting_quantity: getProductQuantity(productId),
    });
    return true;
  }

  function decreaseSelectionQuantity(productId, amount = 1) {
    const product = getProductById(productId);
    const entry = getSelectionEntry(productId);
    const decrement = Math.max(1, Math.floor(Number(amount) || 1));
    if (!entry) return false;

    const removedQuantity = Math.min(decrement, entry.quantity);
    entry.quantity -= removedQuantity;
    if (entry.quantity <= 0) {
      selectedProducts = selectedProducts.filter((item) => item.id !== productId);
    }

    saveSelection();
    updateSelectionCounter();
    syncProductSelectionButtons();
    renderSelectionCart();

    if (product) {
      trackEvent("cart_remove", {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        quantity: removedQuantity,
        resulting_quantity: getProductQuantity(productId),
      });
    }
    return true;
  }

  function removeFromSelection(productId) {
    const product = getProductById(productId);
    const entry = getSelectionEntry(productId);
    if (!entry) return false;

    const removedQuantity = entry.quantity;
    selectedProducts = selectedProducts.filter((item) => item.id !== productId);
    saveSelection();
    updateSelectionCounter();
    syncProductSelectionButtons();
    renderSelectionCart();

    if (product) {
      trackEvent("cart_remove", {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        quantity: removedQuantity,
        resulting_quantity: 0,
      });
    }
    return true;
  }

  function clearSelection() {
    selectedProducts = [];
    saveSelection();
    updateSelectionCounter();
    syncProductSelectionButtons();
    renderSelectionCart();
  }

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
    const items = activeFilter === "all" ? cfg.products : cfg.products.filter((p) => p.category === activeFilter);

    items.forEach((product, index) => {
      const quantity = getProductQuantity(product.id);
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
          ]),
          el("div", { class: "product-card__actions" }, [
            el(
              "button",
              { class: "btn-heart", type: "button", "data-product-id": product.id },
              ["♥ ", "Quiero esta vela"]
            ),
            el(
              "div",
              {
                class: "product-selection-control",
                "data-selection-product-id": product.id,
              },
              [
                el(
                  "button",
                  {
                    class: quantity > 0 ? "btn-select hidden" : "btn-select",
                    type: "button",
                    "aria-pressed": quantity > 0 ? "true" : "false",
                  },
                  "Agregar a mi selección"
                ),
                el(
                  "div",
                  {
                    class: quantity > 0 ? "product-quantity-stepper" : "product-quantity-stepper hidden",
                    role: "group",
                    "aria-label": `Cantidad de ${product.name}`,
                  },
                  [
                    el(
                      "button",
                      {
                        class: "quantity-stepper__btn product-quantity-minus",
                        type: "button",
                        "aria-label": `Quitar una unidad de ${product.name}`,
                      },
                      "−"
                    ),
                    el("span", { class: "product-quantity-value", "aria-live": "polite" }, String(quantity)),
                    el(
                      "button",
                      {
                        class: "quantity-stepper__btn product-quantity-plus",
                        type: "button",
                        "aria-label": `Agregar otra unidad de ${product.name}`,
                      },
                      "+"
                    ),
                  ]
                ),
              ]
            ),
          ]),
        ]),
      ]);

      card.querySelector(".btn-heart").addEventListener("click", () => {
        trackEvent("product_interest", {
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          position: index + 1,
        });
        openInterestModal(product);
      });

      const addButton = card.querySelector(".btn-select");
      addButton.addEventListener("click", () => {
        if (addToSelection(product.id)) {
          const stepper = card.querySelector(".product-quantity-stepper");
          if (stepper) {
            stepper.classList.add("is-flash");
            window.setTimeout(() => stepper.classList.remove("is-flash"), 450);
          }
        }
      });

      card.querySelector(".product-quantity-plus").addEventListener("click", () => {
        addToSelection(product.id);
      });

      card.querySelector(".product-quantity-minus").addEventListener("click", () => {
        decreaseSelectionQuantity(product.id);
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
  /* Mi selección — drawer                                             */
  /* ---------------------------------------------------------------- */
  let selectionContactMethod = "email";

  function renderSelectionContactSummary() {
    const summary = document.getElementById("selection-cart-contact-summary");
    if (!summary) return;
    summary.innerHTML = "";
    getSelectedProductObjects().forEach((product) => {
      summary.appendChild(el("span", { class: "selection-cart__chip" }, `${product.name} ×${product.quantity}`));
    });
  }

  function renderSelectionCart() {
    const itemsWrap = document.getElementById("selection-cart-items");
    const empty = document.getElementById("selection-cart-empty");
    const summary = document.getElementById("selection-cart-summary");
    const countLabel = document.getElementById("selection-cart-count-label");
    if (!itemsWrap || !empty || !summary || !countLabel) return;

    const products = getSelectedProductObjects();
    const totalQuantity = getSelectedTotalQuantity();
    itemsWrap.innerHTML = "";

    if (!products.length) {
      itemsWrap.classList.add("hidden");
      empty.classList.remove("hidden");
      summary.classList.add("hidden");
      renderSelectionContactSummary();
      return;
    }

    itemsWrap.classList.remove("hidden");
    empty.classList.add("hidden");
    summary.classList.remove("hidden");

    products.forEach((product) => {
      const item = el("div", { class: "selection-cart__item" }, [
        el("img", {
          src: product.image,
          alt: product.name,
          class: "selection-cart__item-image",
          loading: "lazy",
        }),
        el("div", { class: "selection-cart__item-copy" }, [
          el("p", { class: "selection-cart__item-name" }, product.name),
          el("p", { class: "selection-cart__item-category" }, product.categoryLabel || product.category),
          el(
            "div",
            { class: "selection-cart__quantity", role: "group", "aria-label": `Cantidad de ${product.name}` },
            [
              el(
                "button",
                {
                  class: "quantity-stepper__btn selection-cart__quantity-minus",
                  type: "button",
                  "aria-label": `Quitar una unidad de ${product.name}`,
                },
                "−"
              ),
              el("span", { class: "selection-cart__quantity-value", "aria-live": "polite" }, String(product.quantity)),
              el(
                "button",
                {
                  class: "quantity-stepper__btn selection-cart__quantity-plus",
                  type: "button",
                  "aria-label": `Agregar otra unidad de ${product.name}`,
                },
                "+"
              ),
            ]
          ),
        ]),
        el("div", { class: "selection-cart__item-actions" }, [
          el(
            "button",
            {
              class: "selection-cart__remove",
              type: "button",
              "data-remove-product-id": product.id,
              "aria-label": `Eliminar todas las unidades de ${product.name} de mi selección`,
            },
            "Eliminar"
          ),
        ]),
      ]);

      item.querySelector(".selection-cart__quantity-minus").addEventListener("click", () => {
        decreaseSelectionQuantity(product.id);
      });
      item.querySelector(".selection-cart__quantity-plus").addEventListener("click", () => {
        addToSelection(product.id);
      });
      item.querySelector(".selection-cart__remove").addEventListener("click", () => {
        removeFromSelection(product.id);
      });
      itemsWrap.appendChild(item);
    });

    const designCount = products.length;
    const unitLabel = totalQuantity === 1 ? "vela seleccionada" : "velas seleccionadas";
    countLabel.textContent =
      totalQuantity === designCount
        ? `${totalQuantity} ${unitLabel}`
        : `${totalQuantity} ${unitLabel} · ${designCount} ${designCount === 1 ? "diseño" : "diseños"}`;
    renderSelectionContactSummary();
  }

  function showSelectionListStep() {
    document.getElementById("selection-cart-step-list").classList.remove("hidden");
    document.getElementById("selection-cart-step-contact").classList.add("hidden");
    document.getElementById("selection-cart-step-thanks").classList.add("hidden");
    renderSelectionCart();
  }

  function setSelectionContactMethod(method) {
    selectionContactMethod = method;
    document.querySelectorAll(".selection-contact-method-pill").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.method === method);
    });
    document.getElementById("selection-contact-email").classList.toggle("hidden", method !== "email");
    document.getElementById("selection-contact-whatsapp").classList.toggle("hidden", method !== "whatsapp");
  }

  function hideSelectionError() {
    const error = document.getElementById("selection-cart-form-error");
    error.textContent = "";
    error.classList.add("hidden");
  }

  function showSelectionError(message) {
    const error = document.getElementById("selection-cart-form-error");
    error.textContent = message;
    error.classList.remove("hidden");
  }

  function setSelectionSubmitting(isSubmitting) {
    const button = document.getElementById("selection-cart-submit");
    button.disabled = isSubmitting;
    button.textContent = isSubmitting ? "Guardando…" : "Avísenme cuando estén disponibles";
  }

  function showSelectionContactStep() {
    const products = getSelectedProductObjects();
    if (!products.length) {
      showSelectionListStep();
      return;
    }

    trackEvent("cart_interest_start", { product_count: products.length, total_quantity: getSelectedTotalQuantity() });

    document.getElementById("selection-cart-step-list").classList.add("hidden");
    document.getElementById("selection-cart-step-contact").classList.remove("hidden");
    document.getElementById("selection-cart-step-thanks").classList.add("hidden");

    const form = document.getElementById("selection-cart-form");
    form.reset();
    document.getElementById("selection-contact-whatsapp").value = "+57 ";
    setSelectionContactMethod("email");
    hideSelectionError();
    renderSelectionContactSummary();
  }

  function openSelectionCart() {
    const overlay = document.getElementById("selection-cart-overlay");
    showSelectionListStep();
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    syncBodyScrollLock();
    trackEvent("cart_open", { product_count: selectedProducts.length, total_quantity: getSelectedTotalQuantity() });
  }

  function closeSelectionCart() {
    const overlay = document.getElementById("selection-cart-overlay");
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    syncBodyScrollLock();
  }

  function wireSelectionCart() {
    const overlay = document.getElementById("selection-cart-overlay");
    const form = document.getElementById("selection-cart-form");

    document.getElementById("selection-cart-button").addEventListener("click", openSelectionCart);
    document.getElementById("selection-cart-close").addEventListener("click", closeSelectionCart);
    document.getElementById("selection-cart-back").addEventListener("click", showSelectionListStep);
    document.getElementById("selection-cart-interest-btn").addEventListener("click", showSelectionContactStep);

    document.getElementById("selection-cart-explore").addEventListener("click", () => {
      closeSelectionCart();
      document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
    });

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeSelectionCart();
    });

    document.querySelectorAll(".selection-contact-method-pill").forEach((btn) => {
      btn.addEventListener("click", () => setSelectionContactMethod(btn.dataset.method));
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideSelectionError();

      const products = getSelectedProductObjects();
      if (!products.length) {
        showSelectionError("Tu selección está vacía.");
        return;
      }

      const emailInput = document.getElementById("selection-contact-email");
      const whatsappInput = document.getElementById("selection-contact-whatsapp");
      const consent = document.getElementById("selection-consent").checked;
      const emailValue = emailInput.value.trim();
      const whatsappValue = whatsappInput.value.trim();

      if (selectionContactMethod === "email") {
        if (!emailValue || !emailInput.checkValidity()) {
          showSelectionError("Ingresa un email válido.");
          return;
        }
      } else {
        const digits = whatsappValue.replace(/\D/g, "");
        if (digits.length < 7) {
          showSelectionError("Ingresa un número de WhatsApp válido.");
          return;
        }
      }

      if (!consent) {
        showSelectionError("Debes aceptar que te contactemos para continuar.");
        return;
      }

      // Congelamos la selección para que el payload y Analytics representen
      // exactamente los mismos productos, incluso si el DOM cambia después.
      const productIds = products.map((product) => product.id);
      const productNames = products.map((product) => product.name);
      const productCategories = products.map((product) => product.category);
      const productQuantities = products.map((product) => product.quantity);
      const totalQuantity = productQuantities.reduce((sum, quantity) => sum + quantity, 0);
      const productSummary = products.map((product) => `${product.name} x${product.quantity}`).join(" | ");

      setSelectionSubmitting(true);
      const result = await submitLead({
        lead_type: "multi_product_interest",
        source: "selection_cart",
        contact_method: selectionContactMethod,
        email: selectionContactMethod === "email" ? emailValue : "",
        whatsapp: selectionContactMethod === "whatsapp" ? whatsappValue : "",
        consent: true,
        selected_product_count: products.length,
        selected_total_quantity: totalQuantity,
        selected_product_ids: productIds.join(","),
        selected_product_names: productNames.join(" | "),
        selected_product_categories: productCategories.join(" | "),
        selected_product_quantities: productQuantities.join(","),
        selected_products_summary: productSummary,
      });
      setSelectionSubmitting(false);

      if (!result.ok) {
        showSelectionError(result.error);
        return;
      }

      // Nunca se envían email/teléfono a GA4.
      trackEvent("cart_lead_submit", {
        product_count: products.length,
        total_quantity: totalQuantity,
        product_ids: productIds.join(","),
        source: "selection_cart",
      });

      clearSelection();
      document.getElementById("selection-cart-step-list").classList.add("hidden");
      document.getElementById("selection-cart-step-contact").classList.add("hidden");
      document.getElementById("selection-cart-step-thanks").classList.remove("hidden");
    });
  }

  /* ---------------------------------------------------------------- */
  /* Modal de interés individual                                       */
  /* ---------------------------------------------------------------- */
  let modalContactMethod = "email";

  function setModalContactMethod(method) {
    modalContactMethod = method;
    document.querySelectorAll("#interest-modal .contact-method-pill").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.method === method);
    });
    document.getElementById("modal-contact-email").classList.toggle("hidden", method !== "email");
    document.getElementById("modal-contact-whatsapp").classList.toggle("hidden", method !== "whatsapp");
  }

  function openInterestModal(product) {
    const modal = document.getElementById("interest-modal");
    document.getElementById("modal-product-name").textContent = product.name;

    modal.dataset.productId = product.id;
    modal.dataset.productName = product.name;
    modal.dataset.productCategory = product.category;

    document.getElementById("modal-step-form").classList.remove("hidden");
    document.getElementById("modal-step-thanks").classList.add("hidden");

    const form = modal.querySelector("form");
    if (form) form.reset();
    document.getElementById("modal-contact-whatsapp").value = "+57 ";
    setModalContactMethod("email");
    hideModalError();

    modal.classList.add("open");
    syncBodyScrollLock();
  }

  function closeInterestModal() {
    document.getElementById("interest-modal").classList.remove("open");
    syncBodyScrollLock();
  }

  function showModalError(message) {
    const err = document.getElementById("modal-form-error");
    err.textContent = message;
    err.classList.remove("hidden");
  }

  function hideModalError() {
    const err = document.getElementById("modal-form-error");
    err.classList.add("hidden");
    err.textContent = "";
  }

  function setModalSubmitting(isSubmitting) {
    const btn = document.getElementById("modal-submit-btn");
    btn.disabled = isSubmitting;
    btn.textContent = isSubmitting ? "Enviando…" : "Avísenme cuando esté disponible";
  }

  function wireModal() {
    const modal = document.getElementById("interest-modal");
    document.getElementById("modal-close").addEventListener("click", closeInterestModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeInterestModal();
    });

    document.querySelectorAll("#interest-modal .contact-method-pill").forEach((btn) => {
      btn.addEventListener("click", () => setModalContactMethod(btn.dataset.method));
    });

    document.getElementById("modal-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      hideModalError();

      const consentChecked = document.getElementById("modal-consent").checked;
      const emailInput = document.getElementById("modal-contact-email");
      const whatsappInput = document.getElementById("modal-contact-whatsapp");
      const emailValue = emailInput.value.trim();
      const whatsappValue = whatsappInput.value.trim();

      if (modalContactMethod === "email") {
        if (!emailValue || !emailInput.checkValidity()) {
          showModalError("Ingresa un email válido.");
          return;
        }
      } else {
        const digits = whatsappValue.replace(/\D/g, "");
        if (digits.length < 7) {
          showModalError("Ingresa tu número de WhatsApp.");
          return;
        }
      }

      if (!consentChecked) {
        showModalError("Debes aceptar que te contactemos para continuar.");
        return;
      }

      setModalSubmitting(true);

      const payload = {
        lead_type: "product_interest",
        product_id: modal.dataset.productId,
        product_name: modal.dataset.productName,
        category: modal.dataset.productCategory,
        contact_method: modalContactMethod,
        email: modalContactMethod === "email" ? emailValue : "",
        whatsapp: modalContactMethod === "whatsapp" ? whatsappValue : "",
        consent: true,
        source: "product_modal",
      };

      const result = await submitLead(payload);
      setModalSubmitting(false);

      if (!result.ok) {
        showModalError(result.error);
        return;
      }

      trackEvent("lead_product_interest", {
        product_id: modal.dataset.productId,
        product_name: modal.dataset.productName,
        category: modal.dataset.productCategory,
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
  /* CTA final (si se reactiva en index.html)                           */
  /* ---------------------------------------------------------------- */
  function renderFinalCta() {
    const title = document.getElementById("final-cta-title");
    const form = document.getElementById("final-cta-form");
    if (!title || !form) return;

    document.getElementById("final-cta-title").textContent = cfg.finalCta.title;
    document.getElementById("final-cta-subtitle").textContent = cfg.finalCta.subtitle;
    document.getElementById("final-cta-btn").textContent = cfg.finalCta.cta;

    const btn = document.getElementById("final-cta-btn");
    const errorEl = document.getElementById("final-cta-error");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorEl) errorEl.classList.add("hidden");

      const input = document.getElementById("final-cta-input");
      const val = input.value.trim();
      if (!val) return;

      const isEmail = val.includes("@");
      btn.disabled = true;
      const originalLabel = btn.textContent;
      btn.textContent = "Enviando…";

      const result = await submitLead({
        lead_type: "general_waitlist",
        product_id: "",
        product_name: "",
        category: "",
        contact_method: isEmail ? "email" : "whatsapp",
        email: isEmail ? val : "",
        whatsapp: isEmail ? "" : val,
        consent: true,
        source: "landing_final_cta",
      });

      btn.disabled = false;
      btn.textContent = originalLabel;

      if (!result.ok) {
        if (errorEl) {
          errorEl.textContent = result.error;
          errorEl.classList.remove("hidden");
        }
        return;
      }

      trackEvent("lead_start", { source: "final_cta" });
      form.classList.add("hidden");
      document.getElementById("final-cta-thanks")?.classList.remove("hidden");
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
    loadSelection();
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
    wireSelectionCart();
    renderSelectionCart();
    updateSelectionCounter();
    syncProductSelectionButtons();
    observeReveals();
  });
})();
