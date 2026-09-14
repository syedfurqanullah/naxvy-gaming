"use strict";

/* =========================================================
   SETUP BUILDER
   ========================================================= */

function initializeSetupBuilder() {
  renderSetupSelection();

  elements.saveSetupButton?.addEventListener("click", saveSetup);
}

function renderSetupSelection() {
  if (!elements.setupSelectionGrid) {
    return;
  }

  elements.setupSelectionGrid.innerHTML = products
    .map((product) => {
      const selected = state.setup.includes(product.id);

      return `
          <button
            class="setup-product-card ${selected ? "is-selected" : ""}"
            type="button"
            data-setup-product="${product.id}"
            aria-pressed="${selected}"
          >
            <div class="setup-product-image">
              <img
                src="${product.cardImage || product.image}"
                alt="${escapeHTML(product.name)}"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div class="setup-product-info">
              <div>
                <span class="setup-product-category">
                  ${escapeHTML(product.categoryLabel)}
                </span>

                <strong class="setup-product-name">
                  ${escapeHTML(product.name)}
                </strong>
              </div>

              <span class="setup-product-price">
                ${formatCurrency(product.price)}
              </span>
            </div>

            <span class="setup-check" aria-hidden="true">&#10003;</span>
          </button>
        `;
    })
    .join("");

  elements.setupSelectionGrid
    .querySelectorAll("[data-setup-product]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        toggleSetupProduct(button.dataset.setupProduct);
      });
    });
}

function toggleSetupProduct(productId) {
  const index = state.setup.indexOf(productId);

  if (index === -1) {
    state.setup.push(productId);
  } else {
    state.setup.splice(index, 1);
  }

  saveStorage(STORAGE_KEYS.setup, state.setup);

  renderSetup();
  renderSetupSelection();
}

function renderSetup() {
  if (!elements.selectedSetupList) {
    return;
  }

  const selectedProducts = state.setup.map(findProduct).filter(Boolean);

  elements.selectedSetupList.innerHTML = selectedProducts.length
    ? selectedProducts
        .map(
          (product) => `
              <div class="selected-setup-item">
                <div>
                  <strong>${escapeHTML(product.name)}</strong>
                  <span>${formatCurrency(product.price)}</span>
                </div>

                <button
                  type="button"
                  data-remove-setup="${product.id}"
                  aria-label="Remove ${escapeHTML(product.name)}"
                >
                  &times;
                </button>
              </div>
            `,
        )
        .join("")
    : `
          <div class="setup-empty">
            <p>No gear selected yet.</p>
          </div>
        `;

  const total = selectedProducts.reduce(
    (sum, product) => sum + product.price,
    0,
  );

  if (elements.setupTotal) {
    elements.setupTotal.textContent = formatCurrency(total);
  }

  const score = Math.min(state.setup.length * 25, 100);

  if (elements.setupScore) {
    elements.setupScore.textContent = `${score}%`;
  }

  if (elements.setupScoreProgress) {
    elements.setupScoreProgress.style.width = `${score}%`;
  }

  elements.selectedSetupList
    .querySelectorAll("[data-remove-setup]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        toggleSetupProduct(button.dataset.removeSetup);
      });
    });
}

function saveSetup() {
  if (!state.setup.length) {
    showToast("Select at least one product first.", "error");

    return;
  }

  saveStorage(STORAGE_KEYS.setup, state.setup);

  showToast("Your NEXVY setup has been saved.");
}
