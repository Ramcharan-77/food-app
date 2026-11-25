const cartContainer = document.getElementById("cart-list");
const totalElement = document.getElementById("total-price");

function renderCart() {
  const cart = getCart();
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty. Go to Menu to add items!</p>";
    totalElement.textContent = "Total: ₹0.00";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.name} (x${item.qty})</h3>
      <p style="margin: 8px 0;">Subtotal: ${formatPrice(itemTotal)}</p>
      <button onclick="handleRemove(${item.id})">Remove</button>
    `;
    cartContainer.appendChild(card);
  });

  totalElement.textContent = `Total: ${formatPrice(total)}`;
}

function handleRemove(id) {
  removeFromCart(id);
  renderCart();
}

// Render cart items as soon as the page loads
renderCart();
