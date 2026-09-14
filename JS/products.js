"use strict";

/* =========================================================
   PRODUCT VIEW STATE
   ========================================================= */

const featuredProducts = {
  monitor: products.find((product) => product.id === "nex-v1"),
  pc: products.find((product) => product.id === "nex-core-x"),
  peripherals: products.find((product) => product.id === "nex-m1"),
  "cables-devices": products.find((product) => product.id === "nex-usb-hub"),
  setup: products.find((product) => product.id === "nex-ch1"),
};

let currentFeaturedProduct = featuredProducts.monitor;
let currentProductFilter = "all";
let currentProductSort = "featured";

/* =========================================================
   PRODUCTS
   ========================================================= */

function initializeProducts() {
  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      elements.filterButtons.forEach((item) => {
        item.classList.remove("is-active");
      });

      button.classList.add("is-active");

      currentProductFilter = button.dataset.category || "all";

      renderProducts();
    });
  });

  elements.viewAllProducts?.addEventListener("click", () => {
    currentProductFilter = "all";

    elements.filterButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.category === "all");
    });

    if (elements.productSearchInput) {
      elements.productSearchInput.value = "";
    }

    renderProducts();

    document.querySelector("#products")?.scrollIntoView({
      behavior: "smooth",
    });
  });

  elements.productSort?.addEventListener("change", () => {
    currentProductSort = elements.productSort.value;
    renderProducts();
  });

  renderProducts();
}

function renderProducts() {
  if (!elements.productGrid) {
    return;
  }

  const query = elements.productSearchInput?.value.trim().toLowerCase() || "";

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      currentProductFilter === "all" ||
      product.category === currentProductFilter;

    const matchesSearch = !query || matchesProductSearch(product, query);

    return matchesCategory && matchesSearch;
  });

  filteredProducts.sort((firstProduct, secondProduct) => {
    if (currentProductSort === "rating") {
      return secondProduct.rating - firstProduct.rating;
    }

    if (currentProductSort === "price-low") {
      return firstProduct.price - secondProduct.price;
    }

    if (currentProductSort === "price-high") {
      return secondProduct.price - firstProduct.price;
    }

    return 0;
  });

  elements.productGrid.innerHTML = filteredProducts
    .map(createProductCard)
    .join("");

  if (elements.productEmptyState) {
    elements.productEmptyState.hidden = filteredProducts.length !== 0;
  }

  updateWishlistUI();
}

function createProductCard(product) {
  const isWishlisted = state.wishlist.includes(product.id);

  return `
    <article
      class="product-card"
      data-product-id="${product.id}"
    >
      <span class="product-badge">${product.rating >= 4.9 ? "Top Rated" : "Performance"}</span>
      <div class="product-card-image-wrapper">
        <img
          class="product-card-image"
          src="${product.cardImage || product.image}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          decoding="async"
        />

        <button
          class="product-wishlist ${isWishlisted ? "is-active" : ""}"
          type="button"
          data-wishlist="${product.id}"
          aria-label="Add ${escapeHTML(product.name)} to wishlist"
          aria-pressed="${isWishlisted}"
        >
          <span class="icon icon-heart" aria-hidden="true"></span>
        </button>
      </div>

      <div class="product-card-content">
        <p class="product-card-category">
          ${escapeHTML(product.categoryLabel)}
        </p>

        <h3 class="product-card-title">
          ${escapeHTML(product.name)}
        </h3>

        <div class="product-rating">
          <span aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <small>${product.rating} (${product.reviews})</small>
        </div>

        <div class="product-card-footer">
          <div class="product-card-price">
            <strong>${formatCurrency(product.price)}</strong>
            <del>${formatCurrency(product.oldPrice)}</del>
          </div>
          <div class="product-card-actions">
            <button
              class="product-card-quick-view"
              type="button"
              data-quick-view="${product.id}"
            >
              Details
            </button>

            <button
              class="product-card-add"
              type="button"
              data-add-to-cart="${product.id}"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

/* =========================================================
   PRODUCT CARD EVENTS
   ========================================================= */

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart]");

  if (addButton) {
    addToCart(addButton.dataset.addToCart);
    return;
  }

  const wishlistButton = event.target.closest("[data-wishlist]");

  if (wishlistButton) {
    toggleWishlist(wishlistButton.dataset.wishlist);
    return;
  }

  const quickViewButton = event.target.closest("[data-quick-view]");

  if (quickViewButton) {
    const product = findProduct(quickViewButton.dataset.quickView);

    if (product) {
      openProductModal(product);
    }
  }
});
/* =========================================================
   PRODUCT MODAL
   ========================================================= */

function initializeProductModal() {
  elements.productModal
    ?.querySelectorAll("[data-modal-close]")
    .forEach((button) => {
      button.addEventListener("click", closeProductModal);
    });

  elements.productModalAddCart?.addEventListener("click", () => {
    if (!currentModalProduct) {
      return;
    }

    addToCart(currentModalProduct.id);
    closeProductModal();
  });

  elements.productModalWishlist?.addEventListener("click", () => {
    if (!currentModalProduct) {
      return;
    }

    toggleWishlist(currentModalProduct.id);
    updateModalWishlistButton();
  });
}

function openProductModal(product) {
  if (!elements.productModal) {
    return;
  }

  currentModalProduct = product;

  if (elements.productModalImage) {
    elements.productModalImage.src = product.image;

    elements.productModalImage.alt = product.name;
  }

  if (elements.productModalCategory) {
    elements.productModalCategory.textContent = product.categoryLabel;
  }

  if (elements.productModalTitle) {
    elements.productModalTitle.textContent = product.name;
  }

  if (elements.productModalDescription) {
    elements.productModalDescription.textContent = product.description;
  }

  if (elements.productModalPrice) {
    elements.productModalPrice.innerHTML = `
      <strong>${formatCurrency(product.price)}</strong>
      <del>${formatCurrency(product.oldPrice)}</del>
    `;
  }

  if (elements.productModalSpecifications) {
    elements.productModalSpecifications.innerHTML = product.specifications
      .map(
        ([label, value]) => `
            <div class="modal-specification">
              <strong>${escapeHTML(value)}</strong>
              <span>${escapeHTML(label)}</span>
            </div>
          `,
      )
      .join("");
  }

  updateModalWishlistButton();

  elements.productModal.classList.add("is-open");

  elements.productModal.setAttribute("aria-hidden", "false");

  elements.body.classList.add("no-scroll");
}

function updateModalWishlistButton() {
  if (!elements.productModalWishlist || !currentModalProduct) {
    return;
  }

  const active = state.wishlist.includes(currentModalProduct.id);

  elements.productModalWishlist.textContent = active
    ? "Remove from Wishlist"
    : "Add to Wishlist";
}

function closeProductModal() {
  elements.productModal?.classList.remove("is-open");

  elements.productModal?.setAttribute("aria-hidden", "true");

  elements.body.classList.remove("no-scroll");

  currentModalProduct = null;
}
/* =========================================================
   FEATURED PRODUCTS
   ========================================================= */

function initializeFeaturedProducts() {
  elements.productTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.featuredCategory;

      const product = featuredProducts[category];

      if (!product) {
        return;
      }

      elements.productTabs.forEach((item) => {
        const active = item === tab;

        item.classList.toggle("is-active", active);

        item.setAttribute("aria-selected", String(active));
      });

      currentFeaturedProduct = product;

      renderFeaturedProduct();
    });
  });

  elements.featuredAddCart?.addEventListener("click", () => {
    if (currentFeaturedProduct) {
      addToCart(currentFeaturedProduct.id);
    }
  });

  elements.featuredWishlist?.addEventListener("click", () => {
    if (currentFeaturedProduct) {
      toggleWishlist(currentFeaturedProduct.id);
    }
  });

  renderFeaturedProduct();
}

function renderFeaturedProduct() {
  const product = currentFeaturedProduct;

  if (!product) {
    return;
  }

  if (elements.featuredImage) {
    elements.featuredImage.src = product.image;

    elements.featuredImage.alt = product.name;
  }

  const category = elements.featuredDetails?.querySelector(".product-category");

  const name = elements.featuredDetails?.querySelector(
    ".featured-product-name",
  );

  const description = elements.featuredDetails?.querySelector(
    ".featured-product-description",
  );

  if (category) {
    category.textContent = product.categoryLabel;
  }

  if (name) {
    name.textContent = product.name;
  }

  if (description) {
    description.textContent = product.description;
  }

  renderFeaturedThumbnails();

  updateWishlistUI();
}

function renderFeaturedThumbnails() {
  if (!elements.featuredThumbnails) {
    return;
  }

  elements.featuredThumbnails.innerHTML = products
    .filter((product) => product.category === currentFeaturedProduct.category)
    .map(
      (product) => `
          <button
            class="product-thumbnail ${
              product.id === currentFeaturedProduct.id ? "is-active" : ""
            }"
            type="button"
            data-featured-product="${product.id}"
            aria-label="View ${escapeHTML(product.name)}"
          >
            <img
            src="${product.cardImage || product.image}"
              alt="${escapeHTML(product.name)}"
            />
          </button>
        `,
    )
    .join("");

  elements.featuredThumbnails
    .querySelectorAll("[data-featured-product]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const product = findProduct(button.dataset.featuredProduct);

        if (!product) {
          return;
        }

        currentFeaturedProduct = product;

        renderFeaturedProduct();
      });
    });
}
