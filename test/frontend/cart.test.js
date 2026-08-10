// Minimal browser shims for lib/cart.js (which touches window + localStorage).
const store = new Map();
const listeners = {};

globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  clear: () => store.clear(),
};

globalThis.window = {
  addEventListener: (type, fn) => {
    (listeners[type] ||= []).push(fn);
  },
  removeEventListener: (type, fn) => {
    listeners[type] = (listeners[type] || []).filter((f) => f !== fn);
  },
  dispatchEvent: (event) => {
    (listeners[event.type] || []).forEach((fn) => fn(event));
  },
};

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  addToCart,
  clearCart,
  getCartCount,
  onCartChange,
  readCart,
  updateCartQuantity,
} from "../../lib/cart.js";

beforeEach(() => {
  store.clear();
  for (const k of Object.keys(listeners)) delete listeners[k];
});

test("readCart returns an empty array when nothing is stored", () => {
  assert.deepEqual(readCart(), []);
});

test("readCart tolerates corrupt JSON", () => {
  store.set("mctaba-cart", "{not json");
  assert.deepEqual(readCart(), []);
});

test("addToCart adds a new item", () => {
  const items = addToCart("p1", 2);
  assert.deepEqual(items, [{ productId: "p1", quantity: 2 }]);
  assert.equal(getCartCount(), 2);
});

test("addToCart merges quantities for an existing item", () => {
  addToCart("p1", 1);
  const items = addToCart("p1", 3);
  assert.deepEqual(items, [{ productId: "p1", quantity: 4 }]);
  assert.equal(getCartCount(), 4);
});

test("updateCartQuantity changes the quantity", () => {
  addToCart("p1", 2);
  const items = updateCartQuantity("p1", 5);
  assert.equal(items[0].quantity, 5);
});

test("updateCartQuantity with 0 removes the item", () => {
  addToCart("p1", 2);
  addToCart("p2", 1);
  const items = updateCartQuantity("p1", 0);
  assert.deepEqual(items, [{ productId: "p2", quantity: 1 }]);
});

test("clearCart empties the cart", () => {
  addToCart("p1", 1);
  clearCart();
  assert.deepEqual(readCart(), []);
  assert.equal(getCartCount(), 0);
});

test("getCartCount sums quantities", () => {
  addToCart("p1", 2);
  addToCart("p2", 3);
  assert.equal(getCartCount(), 5);
});

test("onCartChange fires on cart writes", () => {
  let fired = 0;
  const off = onCartChange(() => fired++);
  addToCart("p1", 1);
  updateCartQuantity("p1", 2);
  assert.equal(fired, 2);
  off();
  addToCart("p2", 1);
  assert.equal(fired, 2, "unsubscribe stops notifications");
});
