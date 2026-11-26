const contentBox = document.getElementById("profile-content");
let user = getCurrentUser();

if (!user) {
  window.location.href = "../login-page/index.html";
}

function switchProfileTab(tab, btn) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  if (tab === "details") renderDetails();
  if (tab === "addresses") renderAddresses();
  if (tab === "orders") renderOrders();
  if (tab === "wallet") renderWallet();
}

function renderDetails() {
  const adminPortalCard = isAdminUser()
    ? `
      <div class="card" style="max-width: 540px; margin-top: 16px; border-color: var(--primary); ">
        <span class="badge">Staff Access Granted</span>
        <h3 class="card-title">Admin Command Center</h3>
        <p class="card-desc">Authorized admin account detected. Enter your 6-digit Staff PIN to manage dispatch, vendors, and riders.</p>
        <a href="../admin-panel/index.html" class="btn">Launch Admin Console</a>
      </div>
    `
    : "";

  contentBox.innerHTML = `
    <div class="card" style="max-width: 540px;">
      <span class="badge">2FA Security Enabled</span>
      <h2 class="card-title">Personal Details</h2>
      <label>Full Name</label>
      <input type="text" id="prof-name" class="search-input" value="${sanitizeInput(user.name)}" style="margin: 6px 0 12px;" />
      <label>Email Address</label>
      <input type="email" disabled id="prof-email" class="search-input" value="${sanitizeInput(user.email)}" style="margin: 6px 0 12px;" />
      <label>Phone Number</label>
      <input type="text" id="prof-phone" class="search-input" value="${sanitizeInput(user.phone || "")}" style="margin: 6px 0 16px;" />
      <button class="btn" onclick="updateProfile()">Save Profile Details</button>
    </div>
    ${adminPortalCard}
  `;
}

async function updateProfile() {
  const nameInput = document.getElementById("prof-name");
  const phoneInput = document.getElementById("prof-phone");

  // 1. Ensure DOM elements exist to prevent runtime crashes
  if (!nameInput || !phoneInput) return;

  const rawName = nameInput.value.trim();
  const rawPhone = phoneInput.value.trim();

  // 2. Validate inputs before processing
  // Allows letters, spaces, hyphens, and apostrophes (2 to 50 chars)
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
  // Allows standard international/local phone formats (7 to 15 digits)
  const phoneRegex = /^\+?[0-9\s-]{7,15}$/;

  if (!nameRegex.test(rawName)) {
    showToast("Please enter a valid name (2-50 characters).", "error");
    return;
  }

  if (!phoneRegex.test(rawPhone)) {
    showToast("Please enter a valid phone number.", "error");
    return;
  }

  // 3. Create a shallow copy instead of mutating a global variable directly
  const updatedUser = {
    ...user,
    name: rawName,
    phone: rawPhone
  };

  // 4. Wrap saving in a try/catch block and wait for completion
  try {
    await saveCurrentUser(updatedUser);
    user = updatedUser; // Update local state only after saving succeeds
    showToast("Profile details saved!", "success");
  } catch (error) {
    console.error("Failed to update profile:", error);
    showToast("Could not save profile. Please try again.", "error");
  }
}

function renderAddresses() {
  const listHTML = user.addresses
    .map(
      (addr) => `
      <div class="card" style="flex-direction: row; align-items: center; gap: 12px;">
        <div>
          <span class="badge">${addr.label}</span>
          <p>${addr.text}</p>
        </div>
        <button class="btn btn-danger" onclick="deleteAddress(${addr.id})">Delete</button>
      </div>
    `
    )
    .join("");

  contentBox.innerHTML = `
    <div class="card" style="margin-bottom: 16px;">
      <h3 class="card-title">Add New Delivery Address</h3>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
        <input type="text" id="addr-label" class="search-input" placeholder="Label (Home / Office)" style="flex: 1; min-width: 140px;" />
        <input type="text" id="addr-text" class="search-input" placeholder="Full street address & landmark" style="flex: 3; min-width: 220px;" />
        <button class="btn" onclick="addAddress()">Save Address</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 12px;">${listHTML || "<p>No saved addresses yet.</p>"}</div>
  `;
}

function addAddress() {
  const label = document.getElementById("addr-label").value.trim() || "Other";
  const text = document.getElementById("addr-text").value.trim();
  if (!text) return showToast("Please enter an address", "danger");

  user.addresses.push({ id: Date.now(), label, text });
  saveCurrentUser(user);
  showToast("Address saved!");
  renderAddresses();
}

function deleteAddress(id) {
  user.addresses = user.addresses.filter((a) => a.id !== id);
  saveCurrentUser(user);
  showToast("Address deleted", "danger");
  renderAddresses();
}

function renderOrders() {
  const orders = getOrders();
  if (orders.length === 0) {
    contentBox.innerHTML = `<div class="card"><p>No past orders yet. Place your first order from the Menu!</p></div>`;
    return;
  }

  contentBox.innerHTML = orders
    .map(
      (ord) => `
      <div class="card" style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <strong>Order #${ord.id} • ${ord.date}</strong>
          <span class="status-pill ${ord.status === "Delivered" ? "success" : "warning"}">${ord.status}</span>
        </div>
        <p class="card-desc" style="margin: 8px 0;">
          Dishes: ${ord.items.map((i) => `${i.name} (x${i.qty})`).join(", ")}<br>
          Delivery To: ${ord.address} ${ord.rider ? `• Rider: <strong>${ord.rider}</strong>` : ""}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>Total: ${formatPrice(ord.total)} (${ord.paymentMethod || "Online"})</strong>
          <button class="btn" onclick='reorderItems(${JSON.stringify(ord.items)})'>Reorder</button>
        </div>
      </div>
    `
    )
    .join("");
}

function reorderItems(items) {
  items.forEach((item) => addToCart(item));
  window.location.href = "../cart-page/index.html";
}

function renderWallet() {
  contentBox.innerHTML = `
    <div class="card" style="max-width: 480px;">
      <span class="badge">Instant Checkout & Refunds</span>
      <h2 style="font-size: 2.2rem; color: var(--primary); margin: 8px 0;">${formatPrice(user.wallet)}</h2>
      <p class="card-desc">Available FoodApp Wallet Balance</p>
      <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
        <button class="btn" onclick="topUpWallet(200)">+ ₹200</button>
        <button class="btn" onclick="topUpWallet(500)">+ ₹500</button>
        <button class="btn" onclick="topUpWallet(1000)">+ ₹1000</button>
      </div>
    </div>
  `;
}

function topUpWallet(amount) {
  const max_amt = 10000;
  const numAmount = Number(amount);

  if (!numAmount || numAmount <= 0 || numAmount > max_amt) {
    showToast(`Please enter an amount between ${formatPrice(1)} and ${formatPrice(max_amt)}.`);
    return;
  }

  openDemoPaymentModal(numAmount);
}

function openDemoPaymentModal(amount) {
  const modal = document.getElementById("paymentModal");
  const text = document.getElementById("paymentText");
  const confirmBtn = document.getElementById("confirmPayBtn");
  const cancelBtn = document.getElementById("cancelPayBtn");

  text.innerHTML = `Pay <strong>${formatPrice(amount)}</strong> to top up your wallet?`;
  modal.classList.add("active");

  confirmBtn.onclick = () => {
    modal.classList.remove("active");
    user.wallet = (user.wallet || 0) + amount;
    saveCurrentUser(user);
    showToast(`Payment successful! Added ${formatPrice(amount)} to your wallet.`);
    renderWallet();
  };

  cancelBtn.onclick = () => {
    modal.classList.remove("active");
    showToast("Payment cancelled. No funds were added.");
  };
}

renderDetails();
