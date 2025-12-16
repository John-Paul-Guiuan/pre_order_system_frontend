// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Error loading cart from localStorage:", err);
      return [];
    }
  });

  // 🧠 Save cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // 🛒 Add item to cart (with quantity)
  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.product.id === product.id);
      if (existing) {
        return prev.map((it) =>
          it.product.id === product.id
            ? { ...it, quantity: it.quantity + quantity }
            : it
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  // 🧾 Remove an item completely
  const removeItem = (productId) => {
    setItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  // 🔢 Update item quantity (remove if 0)
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeItem(productId);
    setItems((prev) =>
      prev.map((it) =>
        it.product.id === productId ? { ...it, quantity } : it
      )
    );
  };

  // 🧹 Clear cart entirely (used after checkout)
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cart");
  };

  // 💰 Calculate subtotal
  const subtotal = () =>
    items.reduce(
      (sum, it) => sum + Number(it.product.base_price) * it.quantity,
      0
    );

  // 🔢 Get total item count (for Navbar checkout badge)
  const cartCount = () =>
    items.reduce((sum, it) => sum + (it.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ✅ Hook to use cart anywhere
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
