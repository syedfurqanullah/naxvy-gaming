"use strict";

/* =========================================================
   WISHLIST
   ========================================================= */

function toggleWishlist(productId) {
  const product = findProduct(productId);

  if (!product) {
    return;
  }

  const index = state.wishlist.indexOf(productId);

  if (index === -1) {
    state.wishlist.push(productId);
    showToast(`${product.name} added to wishlist.`);
  } else {
    state.wishlist.splice(index, 1);
    showToast(`${product.name} removed from wishlist.`);
  }

  saveStorage(STORAGE_KEYS.wishlist, state.wishlist);

  updateWishlistUI();
}

function updateWishlistUI() {
  document.querySelectorAll("[data-wishlist]").forEach((button) => {
    const productId = button.dataset.wishlist;

    const active = state.wishlist.includes(productId);

    button.classList.toggle("is-active", active);

    button.setAttribute("aria-pressed", String(active));
  });

  const featuredActive =
    currentFeaturedProduct &&
    state.wishlist.includes(currentFeaturedProduct.id);

  elements.featuredWishlist?.classList.toggle(
    "is-active",
    Boolean(featuredActive),
  );
}
