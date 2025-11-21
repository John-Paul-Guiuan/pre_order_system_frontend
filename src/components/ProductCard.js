import React, { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [showOptions, setShowOptions] = useState(false);
  const [customizations, setCustomizations] = useState({});

  function handleAdd() {
    // For now we just push simple customizations object (extend later)
    addItem(product, qty, Object.keys(customizations).length ? customizations : null);
    setQty(1); // reset
    setShowOptions(false);
    // optional: show a toast/snackbar later
  }

  return (
    <div style={styles.card}>
      <img src={product.image_url || "https://via.placeholder.com/200"} alt={product.name} style={styles.image} />
      <div style={styles.details}>
        <h3 style={styles.name}>{product.name}</h3>
        <p style={styles.price}>₱{Number(product.base_price).toFixed(2)}</p>

        {/* basic quantity */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
          <span>{qty}</span>
          <button onClick={() => setQty(qty + 1)}>+</button>
        </div>

        {/* optional customizations toggle (example) */}
        <div style={{ marginTop: 8 }}>
          <button onClick={() => setShowOptions((s) => !s)} style={styles.smallBtn}>
            {showOptions ? "Hide options" : "Customize"}
          </button>
          {showOptions && (
            <div style={{ marginTop: 8 }}>
              {/* Example customization fields — adapt to your product types */}
              <input
                placeholder="Message on cake"
                value={customizations.message || ""}
                onChange={(e) => setCustomizations((c) => ({ ...c, message: e.target.value }))}
                style={{ width: "100%", marginBottom: 6 }}
              />
              <select
                value={customizations.size || ""}
                onChange={(e) => setCustomizations((c) => ({ ...c, size: e.target.value }))}
                style={{ width: "100%", marginBottom: 6 }}
              >
                <option value="">Select size</option>
                <option value="6-inch">6-inch</option>
                <option value="8-inch">8-inch</option>
                <option value="10-inch">10-inch</option>
              </select>
            </div>
          )}
        </div>

        <button onClick={handleAdd} style={styles.button}>
          Add to Cart 🛒
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: "220px",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "15px",
    margin: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    textAlign: "center",
    transition: "transform 0.2s",
  },
  image: {
    width: "100%",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  details: {},
  name: {
    fontSize: "18px",
    margin: "5px 0",
  },
  price: {
    color: "#d2691e",
    fontWeight: "bold",
  },
  button: {
    marginTop: "10px",
    backgroundColor: "#ffb347",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  smallBtn: {
    background: "#f0f0f0",
    border: "1px solid #ddd",
    padding: "6px 10px",
    cursor: "pointer",
    borderRadius: 6,
  },
};
