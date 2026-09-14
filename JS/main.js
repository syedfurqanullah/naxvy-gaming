"use strict";

/* =========================================================
   NEXVY GAMING
   Main Frontend JavaScript
   ========================================================= */

/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const elements = {
  body: document.body,

  /* Header */
  header: document.querySelector("#site-header"),
  mobileMenuTrigger: document.querySelector("#mobile-menu-trigger"),
  mainNavigation: document.querySelector("#main-navigation"),
  navigationLinks: document.querySelectorAll(".navigation-link"),
  themeToggle: document.querySelector("#theme-toggle"),

  /* Search */
  searchTrigger: document.querySelector("#search-trigger"),
  searchPanel: document.querySelector("#search-panel"),
  searchClose: document.querySelector("#search-close"),
  globalSearchInput: document.querySelector("#global-search-input"),
  globalSearchResults: document.querySelector("#global-search-results"),

  /* Products */
  productSearchInput: document.querySelector("#product-search-input"),
  productGrid: document.querySelector("#product-grid"),
  productEmptyState: document.querySelector("#products-empty-state"),
  filterButtons: document.querySelectorAll(".filter-button"),
  viewAllProducts: document.querySelector("#view-all-products"),
  productSort: document.querySelector("#product-sort"),

  /* Cart */
  cartTrigger: document.querySelector("#cart-trigger"),
  cartDrawer: document.querySelector("#cart-drawer"),
  cartClose: document.querySelector("#cart-close"),
  cartItems: document.querySelector("#cart-items"),
  cartEmptyState: document.querySelector("#cart-empty-state"),
  cartBrowseProducts: document.querySelector("#cart-browse-products"),
  cartCount: document.querySelector("#cart-count"),
  cartTotal: document.querySelector("#cart-total"),
  checkoutButton: document.querySelector("#checkout-button"),

  /* Product Modal */
  productModal: document.querySelector("#product-modal"),
  productModalImage: document.querySelector("#product-modal-image"),
  productModalCategory: document.querySelector("#product-modal-category"),
  productModalTitle: document.querySelector("#product-modal-title"),
  productModalDescription: document.querySelector("#product-modal-description"),
  productModalPrice: document.querySelector("#product-modal-price"),
  productModalSpecifications: document.querySelector(
    "#product-modal-specifications",
  ),
  productModalAddCart: document.querySelector("#product-modal-add-cart"),
  productModalWishlist: document.querySelector("#product-modal-wishlist"),

  /* Newsletter */
  newsletterForm: document.querySelector("#newsletter-form"),
  newsletterEmail: document.querySelector("#newsletter-email"),
  newsletterEmailError: document.querySelector("#newsletter-email-error"),

  /* Featured Product */
  productTabs: document.querySelectorAll(".product-tab"),
  featuredImage: document.querySelector("#featured-product-image"),
  featuredDetails: document.querySelector("#featured-product-details"),
  featuredAddCart: document.querySelector("#featured-add-to-cart"),
  featuredWishlist: document.querySelector("#featured-wishlist-button"),
  featuredThumbnails: document.querySelector("#featured-product-thumbnails"),

  /* Setup Builder */
  setupSelectionGrid: document.querySelector("#setup-selection-grid"),
  selectedSetupList: document.querySelector("#selected-setup-list"),
  setupTotal: document.querySelector("#setup-total"),
  setupScore: document.querySelector("#setup-score"),
  setupScoreProgress: document.querySelector("#setup-score-progress"),
  saveSetupButton: document.querySelector("#save-setup-button"),

  /* Testimonials */
  testimonialsTrack: document.querySelector("#testimonials-track"),
  testimonialPrevious: document.querySelector("#testimonial-previous"),
  testimonialNext: document.querySelector("#testimonial-next"),

  /* Toast */
  toastContainer: document.querySelector("#toast-container"),

  /* Scroll */
  scrollToTop: document.querySelector("#scroll-to-top"),

  /* Footer */
  currentYear: document.querySelector("#current-year"),

  /* FAQ */
  faqItems: document.querySelectorAll(".faq-item"),
};

/* =========================================================
   PRODUCT STATE
   Catalog data and product-view state live in products.js.
   ========================================================= */

let currentModalProduct = null;
let testimonialIndex = 0;

/* =========================================================
   APPLICATION STATE
   ========================================================= */

const state = {
  cart: loadStorage(STORAGE_KEYS.cart, []),
  wishlist: loadStorage(STORAGE_KEYS.wishlist, []),
  setup: loadStorage(STORAGE_KEYS.setup, []),
};

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializeTheme();
  initializeSearch();
  initializeProducts();
  initializeCart();
  initializeProductModal();
  initializeNewsletter();
  initializeFeaturedProducts();
  initializeSetupBuilder();
  initializeTestimonials();
  initializeFAQ();
  initializeScrollToTop();
  initializeGlobalKeyboard();
  initializeImageFallback();

  updateCartUI();
  updateWishlistUI();
  renderCart();
  renderSetup();
  updateCurrentYear();
});

function initializeTheme() {
  const savedTheme = loadStorage(STORAGE_KEYS.theme, "violet");
  const isCyanTheme = savedTheme === "cyan";

  elements.body.classList.toggle("theme-cyan", isCyanTheme);
  elements.themeToggle?.setAttribute("aria-pressed", String(isCyanTheme));

  elements.themeToggle?.addEventListener("click", () => {
    const nextTheme = elements.body.classList.toggle("theme-cyan")
      ? "cyan"
      : "violet";

    saveStorage(STORAGE_KEYS.theme, nextTheme);
    elements.themeToggle.setAttribute(
      "aria-pressed",
      String(nextTheme === "cyan"),
    );

    showToast(
      `${nextTheme === "cyan" ? "Cyan" : "Violet"} accent theme active.`,
    );
  });
}

/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initializeNavigation() {
  if (!elements.mobileMenuTrigger || !elements.mainNavigation) {
    return;
  }

  elements.mobileMenuTrigger.addEventListener("click", () => {
    const isOpen = elements.mainNavigation.classList.toggle("is-open");

    elements.mobileMenuTrigger.classList.toggle("is-active", isOpen);

    elements.mobileMenuTrigger.setAttribute("aria-expanded", String(isOpen));

    elements.body.classList.toggle("no-scroll", isOpen);
  });

  elements.navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileNavigation();
    });
  });
}

function closeMobileNavigation() {
  elements.mainNavigation?.classList.remove("is-open");
  elements.mobileMenuTrigger?.classList.remove("is-active");

  elements.mobileMenuTrigger?.setAttribute("aria-expanded", "false");

  elements.body.classList.remove("no-scroll");
}

/* =========================================================
   NEWSLETTER
   ========================================================= */

function initializeNewsletter() {
  elements.newsletterForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = elements.newsletterEmail?.value.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      if (elements.newsletterEmailError) {
        elements.newsletterEmailError.textContent =
          "Please enter a valid email address.";
      }

      return;
    }

    if (elements.newsletterEmailError) {
      elements.newsletterEmailError.textContent = "";
    }

    elements.newsletterForm.reset();

    showToast("You're subscribed to NEXVY updates.");
  });
}

/* =========================================================
   TESTIMONIAL SLIDER
   ========================================================= */

function initializeTestimonials() {
  if (!elements.testimonialsTrack) {
    return;
  }

  elements.testimonialPrevious?.addEventListener("click", () => {
    moveTestimonial(-1);
  });

  elements.testimonialNext?.addEventListener("click", () => {
    moveTestimonial(1);
  });
}

function moveTestimonial(direction) {
  const cards =
    elements.testimonialsTrack.querySelectorAll(".testimonial-card");

  if (!cards.length) {
    return;
  }

  testimonialIndex += direction;

  if (testimonialIndex < 0) {
    testimonialIndex = cards.length - 1;
  }

  if (testimonialIndex >= cards.length) {
    testimonialIndex = 0;
  }

  const cardWidth = cards[0].getBoundingClientRect().width;

  const gap = parseFloat(getComputedStyle(elements.testimonialsTrack).gap) || 0;

  elements.testimonialsTrack.style.transform = `translateX(-${
    testimonialIndex * (cardWidth + gap)
  }px)`;
}

/* =========================================================
   FAQ
   ========================================================= */

function initializeFAQ() {
  elements.faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) {
        return;
      }

      elements.faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });
}

/* =========================================================
   SCROLL TO TOP
   ========================================================= */

function initializeScrollToTop() {
  if (!elements.scrollToTop) {
    return;
  }

  window.addEventListener("scroll", () => {
    elements.scrollToTop.classList.toggle("is-visible", window.scrollY > 600);
  });

  elements.scrollToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* =========================================================
   GLOBAL KEYBOARD EVENTS
   ========================================================= */

function initializeGlobalKeyboard() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSearch();
      closeCart();
      closeProductModal();
      closeMobileNavigation();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      elements.searchPanel &&
      elements.searchPanel.classList.contains("is-open")
    ) {
      const clickedInside = elements.searchPanel.contains(event.target);

      const clickedTrigger = elements.searchTrigger?.contains(event.target);

      if (!clickedInside && !clickedTrigger) {
        closeSearch();
      }
    }
  });
}

/* =========================================================
   IMAGE FALLBACK
   ========================================================= */

function initializeImageFallback() {
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        image.classList.add("image-load-error");
      },
      { once: true },
    );
  });
}

/* =========================================================
   TOAST NOTIFICATIONS
   ========================================================= */

function showToast(message, type = "success") {
  if (!elements.toastContainer) {
    return;
  }

  const toast = document.createElement("div");

  toast.className = `toast toast-${type}`;

  toast.innerHTML = `
    <div class="toast-content">
      <strong>
        ${type === "error" ? "Error" : "NEXVY"}
      </strong>

      <p>${escapeHTML(message)}</p>
    </div>

    <button
      type="button"
      class="toast-close"
      aria-label="Close notification"
    >
      &times;
    </button>
  `;

  elements.toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  const removeToast = () => {
    toast.classList.remove("is-visible");

    setTimeout(() => {
      toast.remove();
    }, 250);
  };

  toast.querySelector(".toast-close")?.addEventListener("click", removeToast);

  setTimeout(removeToast, 4000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

function findProduct(productId) {
  return products.find((product) => product.id === productId);
}

function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   CURRENT YEAR
   ========================================================= */

function updateCurrentYear() {
  if (elements.currentYear) {
    elements.currentYear.textContent = new Date().getFullYear();
  }
}
