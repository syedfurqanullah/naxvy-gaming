"use strict";

/* =========================================================
   BROWSER STORAGE
   Shared localStorage keys and safe JSON read/write helpers.
   ========================================================= */

const STORAGE_KEYS = {
  cart: "nexvy-cart",
  wishlist: "nexvy-wishlist",
  setup: "nexvy-setup",
  theme: "nexvy-theme",
};

function loadStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Storage error for ${key}:`, error);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save ${key}:`, error);
  }
}
