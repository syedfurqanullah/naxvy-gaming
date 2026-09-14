"use strict";

/* =========================================================
   SEARCH
   ========================================================= */

function initializeSearch() {
  elements.searchTrigger?.addEventListener("click", openSearch);

  elements.searchClose?.addEventListener("click", closeSearch);

  elements.globalSearchInput?.addEventListener("input", handleGlobalSearch);

  elements.globalSearchInput?.addEventListener(
    "keydown",
    handleGlobalSearchKeyboard,
  );

  elements.productSearchInput?.addEventListener("input", renderProducts);
}

function openSearch() {
  if (!elements.searchPanel) {
    return;
  }

  elements.searchPanel.classList.add("is-open");
  elements.searchPanel.setAttribute("aria-hidden", "false");
  elements.searchTrigger?.setAttribute("aria-expanded", "true");

  setTimeout(() => {
    elements.globalSearchInput?.focus();
  }, 100);
}

function closeSearch() {
  elements.searchPanel?.classList.remove("is-open");
  elements.searchPanel?.setAttribute("aria-hidden", "true");
  elements.searchTrigger?.setAttribute("aria-expanded", "false");

  if (elements.globalSearchInput) {
    elements.globalSearchInput.value = "";
  }

  if (elements.globalSearchResults) {
    elements.globalSearchResults.innerHTML = "";
  }
}

function handleGlobalSearch(event) {
  const query = event.target.value.trim().toLowerCase();

  if (!elements.globalSearchResults) {
    return;
  }

  if (!query) {
    elements.globalSearchResults.innerHTML = "";
    return;
  }

  const results = products
    .filter((product) => matchesProductSearch(product, query))
    .slice(0, 8);

  if (!results.length) {
    elements.globalSearchResults.innerHTML = `
      <div class="search-no-results">
        <strong>No products found</strong>
        <p>Try another gaming product.</p>
      </div>
    `;

    return;
  }

  elements.globalSearchResults.innerHTML = results
    .map(
      (product) => `
        <button
          class="global-search-result"
          type="button"
          data-search-product="${product.id}"
        >
          <img
            src="${product.cardImage || product.image}"
            alt="${escapeHTML(product.name)}"
          />

          <span>
            <strong>${escapeHTML(product.name)}</strong>
            <small>${formatCurrency(product.price)}</small>
          </span>
        </button>
      `,
    )
    .join("");

  elements.globalSearchResults
    .querySelectorAll("[data-search-product]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const product = findProduct(button.dataset.searchProduct);

        if (!product) {
          return;
        }

        closeSearch();
        openProductModal(product);
      });
    });
}

/* =========================================================
   SEARCH HELPERS
   Reuse the same matching rules for the overlay and catalog.
   ========================================================= */

function matchesProductSearch(product, query) {
  return getSearchableProductText(product).includes(query);
}

function getSearchableProductText(product) {
  const specifications = product.specifications.flat().join(" ");

  return [
    product.name,
    product.category,
    product.categoryLabel,
    product.description,
    specifications,
  ]
    .join(" ")
    .toLowerCase();
}

function handleGlobalSearchKeyboard(event) {
  if (event.key !== "Enter") {
    return;
  }

  const firstResult = elements.globalSearchResults?.querySelector(
    "[data-search-product]",
  );

  firstResult?.click();
}
