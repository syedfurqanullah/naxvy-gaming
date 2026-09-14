"use strict";

/* =========================================================
   CART INTERACTIONS
   Cart state, drawer controls, quantities, and checkout UI.
   ========================================================= */

/* =========================================================
   CART
   ========================================================= */

function initializeCart() {
  elements.cartTrigger?.addEventListener("click", openCart);

  elements.cartClose?.addEventListener("click", closeCart);

  elements.cartBrowseProducts?.addEventListener("click", () => {
    closeCart();

    document.querySelector("#products")?.scrollIntoView({
      behavior: "smooth",
    });
  });

  elements.checkoutButton?.addEventListener("click", handleCheckout);

  elements.cartItems?.addEventListener("click", handleCartAction);
}

function addToCart(productId, quantity = 1) {
  const product = findProduct(productId);

  if (!product) {
    showToast("Product not found.", "error");
    return;
  }

  const existingItem = state.cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.cart.push({
      id: productId,
      quantity,
    });
  }

  saveStorage(STORAGE_KEYS.cart, state.cart);

  renderCart();
  updateCartUI();

  showToast(`${product.name} added to cart.`);
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);

  saveStorage(STORAGE_KEYS.cart, state.cart);

  renderCart();
  updateCartUI();

  showToast("Item removed from cart.");
}

function updateCartQuantity(productId, quantity) {
  const item = state.cart.find((cartItem) => cartItem.id === productId);

  if (!item) {
    return;
  }

  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  item.quantity = quantity;

  saveStorage(STORAGE_KEYS.cart, state.cart);

  renderCart();
  updateCartUI();
}

function handleCartAction(event) {
  const button = event.target.closest("[data-cart-action]");

  if (!button) {
    return;
  }

  const productId = button.dataset.productId;
  const action = button.dataset.cartAction;

  const item = state.cart.find((cartItem) => cartItem.id === productId);

  if (!item) {
    return;
  }

  if (action === "increase") {
    updateCartQuantity(productId, item.quantity + 1);
  }

  if (action === "decrease") {
    updateCartQuantity(productId, item.quantity - 1);
  }

  if (action === "remove") {
    removeFromCart(productId);
  }
}

function renderCart() {
  if (!elements.cartItems) {
    return;
  }

  if (!state.cart.length) {
    elements.cartItems.innerHTML = "";

    if (elements.cartEmptyState) {
      elements.cartEmptyState.hidden = false;
    }

    if (elements.checkoutButton) {
      elements.checkoutButton.disabled = true;
    }

    updateCartTotal();

    return;
  }

  if (elements.cartEmptyState) {
    elements.cartEmptyState.hidden = true;
  }

  if (elements.checkoutButton) {
    elements.checkoutButton.disabled = false;
  }

  elements.cartItems.innerHTML = state.cart
    .map((item) => {
      const product = findProduct(item.id);

      if (!product) {
        return "";
      }

      return `
        <article class="cart-item">
          <div class="cart-item-image">
            <img
              src="${product.cardImage || product.image}"
              alt="${escapeHTML(product.name)}"
            />
          </div>

          <div class="cart-item-info">
            <h3>${escapeHTML(product.name)}</h3>

            <strong>
              ${formatCurrency(product.price * item.quantity)}
            </strong>

            <div class="cart-item-controls">
              <div class="quantity-control">
                <button
                  type="button"
                  data-cart-action="decrease"
                  data-product-id="${product.id}"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>${item.quantity}</span>

                <button
                  type="button"
                  data-cart-action="increase"
                  data-product-id="${product.id}"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                class="cart-remove"
                type="button"
                data-cart-action="remove"
                data-product-id="${product.id}"
              >
                Remove
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  updateCartTotal();
}

function updateCartTotal() {
  if (!elements.cartTotal) {
    return;
  }

  const total = state.cart.reduce((sum, item) => {
    const product = findProduct(item.id);

    if (!product) {
      return sum;
    }

    return sum + product.price * item.quantity;
  }, 0);

  elements.cartTotal.textContent = formatCurrency(total);
}

function updateCartUI() {
  if (!elements.cartCount) {
    return;
  }

  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  elements.cartCount.textContent = count;

  elements.cartCount.setAttribute("aria-label", `${count} items in cart`);

  elements.cartCount.hidden = count === 0;

  updateCartTotal();
}

function openCart() {
  elements.cartDrawer?.classList.add("is-open");

  elements.cartDrawer?.setAttribute("aria-hidden", "false");

  elements.cartTrigger?.setAttribute("aria-expanded", "true");

  elements.body.classList.add("no-scroll");
}

function closeCart() {
  elements.cartDrawer?.classList.remove("is-open");

  elements.cartDrawer?.setAttribute("aria-hidden", "true");

  elements.cartTrigger?.setAttribute("aria-expanded", "false");

  elements.body.classList.remove("no-scroll");
}

function handleCheckout() {
  if (!state.cart.length) {
    showToast("Your cart is empty.", "error");
    return;
  }

  showToast("Demo checkout only — no real order will be placed.");
}
