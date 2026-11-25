const cartContainer = document.getElementById("cart-list");
const billBox = document.getElementById("bill-box");
const banner = document.getElementById("free-delivery-banner");

function renderCart() {
  const cart = getCart();
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    banner.style.display = "none";
    billBox.style.display = "none";
    cartContainer.innerHTML = `
      <div class="card" style="text-align: center; padding: 32px;">
        <h3>Your cart is empty</h3>
        <p class="card-desc">Add some delicious dishes from the menu to get started.</p>
        <a href="../menu-page/index.html" class="btn">Browse Menu</a>
      </div>
    `;
    return;
  }

  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    const card = document.createElement("div");
    card.className = "card";
    card.style.flexDirection = "row";
    card.style.alignItems = "center";
    card.innerHTML = `
      <div>
        <h3 class="card-title">${item.name}</h3>
        <p class="price-tag" style="margin: 0;">${formatPrice(itemTotal)}</p>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <strong>${item.qty}</strong>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    `;
    cartContainer.appendChild(card);
  });

  // Free delivery over ₹300
  const freeThreshold = 300;
  const deliveryFee = subtotal >= freeThreshold ? 0 : 40;
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + deliveryFee + gst;

  banner.style.display = "block";
  banner.innerHTML =
    subtotal >= freeThreshold
      ? "<strong>Free Delivery unlocked!</strong> You saved ₹40 on this order."
      : `Add <strong>${formatPrice(freeThreshold - subtotal)}</strong> more to unlock <strong>FREE Delivery</strong>!`;

  billBox.style.display = "block";
  document.getElementById("sub-total").textContent = formatPrice(subtotal);
  document.getElementById("delivery-fee").textContent =
    deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee);
  document.getElementById("tax-amount").textContent = formatPrice(gst);
  document.getElementById("grand-total").textContent = formatPrice(grandTotal);
}

function changeQty(id, delta) {
  updateItemQty(id, delta);
  renderCart();
}

function handleCheckout() {
  const address = document.getElementById("address-input").value.trim();
  if (!address) {
    showToast("Please enter your delivery address first!", "danger");
    return;
  }

  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  clearCart();
  banner.style.display = "none";
  billBox.style.display = "none";

  cartContainer.innerHTML = `
    <div class="card" style="text-align: center; padding: 32px; border-color: #16a34a;">
      <span class="badge" style="margin: 0 auto 12px;">Order Confirmed</span>
      <h2>Thank you! Order #${orderId}</h2>
      <p class="card-desc" style="margin-top: 8px;">Your hot meal is being prepared and will arrive at <strong>${address}</strong> in ~30 mins.</p>
      <a href="../menu-page/index.html" class="btn" style="margin-top: 12px;">Order More Food</a>
    </div>
  `;
  showToast(`Order #${orderId} placed successfully!`);
}

renderCart();
