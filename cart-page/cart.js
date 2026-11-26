const cartContainer = document.getElementById("cart-list");
const billBox = document.getElementById("bill-box");
const banner = document.getElementById("free-delivery-banner");

function renderCart() {
  const cart = getCart();
  const user = getCurrentUser();
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

  // Load saved addresses & wallet balance if user is signed in
  const picker = document.getElementById("saved-addr-picker");
  const walletLabel = document.getElementById("wallet-label");
  if (user) {
    walletLabel.textContent = `Pay using FoodApp Wallet (Available: ${formatPrice(user.wallet || 0)})`;
    if (user.addresses && user.addresses.length > 0) {
      picker.innerHTML = `
        <select class="search-input" onchange="document.getElementById('address-input').value = this.value">
          <option value="">-- Choose a Saved Address --</option>
          ${user.addresses.map((a) => `<option value="${a.text}">${a.label}: ${a.text}</option>`).join("")}
        </select>
      `;
    }
  } else {
    walletLabel.textContent = "Pay using FoodApp Wallet (Login required)";
  }
}

function changeQty(id, delta) {
  updateItemQty(id, delta);
  renderCart();
}

function handleCheckout() {
  const address = document.getElementById("address-input").value.trim();
  if (!address) {
    showToast("Please enter or select a delivery address!", "danger");
    return;
  }

  const cart = getCart();
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryFee = subtotal >= 300 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee + subtotal * 0.05;
  const useWallet = document.getElementById("use-wallet-checkbox").checked;
  const user = getCurrentUser();

  let paymentMethod = "Cash / UPI on Delivery";

  if (useWallet) {
    if (!user) {
      showToast("Please login first to use FoodApp Wallet", "danger");
      return;
    }
    if ((user.wallet || 0) < grandTotal) {
      showToast("Insufficient wallet balance! Top up in your Profile.", "danger");
      return;
    }
    user.wallet -= grandTotal;
    saveCurrentUser(user);
    paymentMethod = "FoodApp Wallet";
  }

  const orderId = Math.floor(100000 + Math.random() * 900000);

  saveOrder({
    id: orderId,
    date: new Date().toLocaleDateString("en-IN"),
    items: cart,
    total: grandTotal,
    address,
    paymentMethod,
    status: "Preparing",
    rider: ""
  });

  clearCart();
  banner.style.display = "none";
  billBox.style.display = "none";

  cartContainer.innerHTML = `
  <div class="card" style="text-align: center; padding: 32px; border-color: #16a34a;">
    <span class="badge" style="margin: 0 auto 12px;">Order Confirmed (${paymentMethod})</span>
    <h2>Thank you! Order #${orderId}</h2>
    <p class="card-desc" style="margin-top: 8px;">Monitor live delivery status in your Profile.</p>
    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 12px;">
      <a href="../profile-page/index.html" class="btn">Track in Profile</a>
    </div>
  </div>
`;

  showToast(`Order #${orderId} placed successfully!`);
}

renderCart();
