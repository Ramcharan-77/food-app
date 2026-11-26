const DB_KEYS = {
  CART: "food_app_cart",
  USER: "food_app_user",
  ORDERS: "food_app_orders",
  VENDORS: "food_app_vendors",
  RIDERS: "food_app_riders",
  TICKETS: "food_app_tickets"
};

/* =========================================================
   1. SECURITY MODULE (XSS Sanitization, SHA-256 & RBAC)
   ========================================================= */
const ADMIN_EMAILS = ["demo@foodapp.com", "admin@foodapp.com"];
const ADMIN_PIN_SALT = "4396196f15c577044b0fd0c1abbd0d43";
let ADMIN_PIN_HASH = "49b5a84f4b6292fdc0052755c68dffa5afee8e4fb8bcd6deb5afd0fce448248b";

function sanitizeInput(str) {
  if (str === null || str === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

async function hashText(plainText, saltHex = ADMIN_PIN_SALT) {
  const encoder = new TextEncoder();
  const saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(plainText),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 600000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );

  return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isAdminUser() {
  const user = getCurrentUser();
  if (!user || !user.email) return false;
  const cleanEmail = user.email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(cleanEmail);
}

/* =========================================================
   2. INITIALIZE DEMO ECOSYSTEM DATA
   ========================================================= */
function initDatabase() {
  if (!localStorage.getItem(DB_KEYS.VENDORS)) {
    localStorage.setItem(
      DB_KEYS.VENDORS,
      JSON.stringify([
        {
          id: "V-101",
          name: "Paradise Biryani House",
          area: "Secunderabad",
          rating: 4.6,
          status: "Open"
        },
        {
          id: "V-102",
          name: "Chutneys South Kitchen",
          area: "Banjara Hills",
          rating: 4.8,
          status: "Open"
        },
        {
          id: "V-103",
          name: "Shah Ghouse Special",
          area: "Tolichowki",
          rating: 4.5,
          status: "Paused"
        }
      ])
    );
  }

  if (!localStorage.getItem(DB_KEYS.RIDERS)) {
    localStorage.setItem(
      DB_KEYS.RIDERS,
      JSON.stringify([
        {
          id: "R-01",
          name: "Ravi Kumar",
          phone: "9848011223",
          zone: "Madhapur",
          status: "Available",
          deliveries: 142
        },
        {
          id: "R-02",
          name: "Suresh Reddy",
          phone: "9848044556",
          zone: "Gachibowli",
          status: "On Delivery",
          deliveries: 98
        },
        {
          id: "R-03",
          name: "Imran Khan",
          phone: "9848077889",
          zone: "Kukatpally",
          status: "Offline",
          deliveries: 210
        }
      ])
    );
  }

  if (!localStorage.getItem(DB_KEYS.TICKETS)) {
    localStorage.setItem(
      DB_KEYS.TICKETS,
      JSON.stringify([
        {
          id: "TKT-901",
          customer: "Ananya Sharma",
          issue: "Missing raita with Biryani",
          refundAmt: 40,
          status: "Open"
        },
        {
          id: "TKT-902",
          customer: "Karthik Rao",
          issue: "Late delivery compensation",
          refundAmt: 50,
          status: "Resolved"
        }
      ])
    );
  }
}

/* =========================================================
   3. USER AUTH & PROFILE HELPERS
   ========================================================= */
function getCurrentUser() {
  const data = localStorage.getItem(DB_KEYS.USER);
  return data ? JSON.parse(data) : null;
}

function saveCurrentUser(user) {
  localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem(DB_KEYS.USER);
  sessionStorage.removeItem("admin_session_exp");
  showToast("Logged out securely");
  setTimeout(() => {
    const root = document.body.getAttribute("data-root") || "..";
    window.location.href = `${root}/login-page/index.html`;
  }, 600);
}

/* =========================================================
   4. CART & ORDER HELPERS
   ========================================================= */
function getCart() {
  const data = localStorage.getItem(DB_KEYS.CART);
  return data ? JSON.parse(data) : [];
}

function saveCart(cart) {
  localStorage.setItem(DB_KEYS.CART, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
  showToast(`${item.name} added to cart!`);
}

function updateItemQty(itemId, change) {
  let cart = getCart();
  const item = cart.find((i) => i.id === itemId);
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== itemId);
    showToast("Item removed from cart", "danger");
  }
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(DB_KEYS.CART);
  updateCartBadge();
}

function getOrders() {
  const data = localStorage.getItem(DB_KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
}

function saveOrder(orderObj) {
  const orders = getOrders();
  orders.unshift(orderObj);
  localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
}

function formatPrice(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

/* =========================================================
   5. AUTOMATIC NAVBAR (Admin Link Hidden) & TOAST
   ========================================================= */
let toastTimer;
function showToast(message, type = "success") {
  let toast = document.getElementById("global-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "global-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast-notification ${type === "danger" ? "danger" : ""}`;
  requestAnimationFrame(() => toast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function updateCartBadge() {
  const badge = document.getElementById("global-cart-count");
  if (!badge) return;
  badge.textContent = getCart().reduce((sum, item) => sum + item.qty, 0);
}

function injectNavbar() {
  initDatabase();
  const root = document.body.getAttribute("data-root") || "..";
  const path = window.location.pathname;
  const user = getCurrentUser();

  const safeFirstName = user ? sanitizeInput(user.name.split(" ")) : "";
  const authLink = user
    ? `<a href="${root}/profile-page/index.html" class="${path.includes("profile-page") ? "active" : ""}">Profile (${safeFirstName})</a>`
    : `<a href="${root}/login-page/index.html" class="${path.includes("login-page") ? "active" : ""}">Login</a>`;

  const navbarHTML = `
    <header class="navbar">
      <div class="navbar-inner">
        <a href="${root}/index.html" class="brand">FoodApp</a>
        <nav class="nav-links">
          <a href="${root}/index.html" class="${!path.includes("-page") && !path.includes("admin-panel") ? "active" : ""}">Home</a>
          <a href="${root}/menu-page/index.html" class="${path.includes("menu-page") ? "active" : ""}">Menu</a>
          <a href="${root}/cart-page/index.html" class="${path.includes("cart-page") ? "active" : ""}">
            Cart <span id="global-cart-count" class="cart-badge">0</span>
          </a>
          ${authLink}
        </nav>
      </div>
    </header>
  `;

  document.body.insertAdjacentHTML("afterbegin", navbarHTML);
  updateCartBadge();
}

document.addEventListener("DOMContentLoaded", injectNavbar);

/* =========================================================
   LIGHT / DARK MODE SWITCHER (Saved Across All Pages)
   ========================================================= */
function applySavedTheme() {
  const savedTheme = localStorage.getItem("food_app_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  const btn = document.getElementById("theme-toggle-btn");
  if (btn) {
    btn.textContent = savedTheme === "dark" ? "☀️ Light" : "🌙 Dark";
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("food_app_theme", next);
  applySavedTheme();
}

// Apply theme immediately so there is no white flash on page load
applySavedTheme();
/* =========================================================
   STANDALONE LIGHT / DARK MODE SWITCHER
   ========================================================= */
function applySavedTheme() {
  const savedTheme = localStorage.getItem("food_app_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  const btn = document.getElementById("theme-toggle-btn");
  if (btn) {
    btn.textContent = savedTheme === "dark" ? "Light Mode" : "Dark Mode";
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("food_app_theme", next);
  applySavedTheme();
}

// Apply theme immediately on page load
applySavedTheme();

// Automatically append the toggle button to your existing navbar
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelector(".nav-links");
  if (navLinks && !document.getElementById("theme-toggle-btn")) {
    const btn = document.createElement("button");
    btn.id = "theme-toggle-btn";
    btn.className = "theme-btn";
    btn.type = "button";
    btn.onclick = toggleTheme;
    navLinks.appendChild(btn);
    applySavedTheme();
  }
});
/* =========================================================
   MOBILE BOTTOM NAV, FLOATING CART BAR & FULL DISH PREVIEW
   ========================================================= */
function updateFloatingCart() {
  const bar = document.getElementById("floating-cart-bar");
  const mobileBadge = document.getElementById("mobile-cart-badge");
  const cart = getCart();
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (mobileBadge) mobileBadge.textContent = totalQty > 0 ? `(${totalQty})` : "";

  if (!bar) return;
  const isCartPage = window.location.pathname.includes("cart-page");

  if (totalQty > 0 && !isCartPage) {
    bar.innerHTML = `
      <span>${totalQty} ${totalQty === 1 ? "Item" : "Items"} • ${formatPrice(totalPrice)}</span>
      <span>View Cart &rarr;</span>
    `;
    bar.classList.add("visible");
  } else {
    bar.classList.remove("visible");
  }
}

// Wrap saveCart so the floating bar updates live whenever items are added/changed
const _originalSaveCart = saveCart;
saveCart = function (cart) {
  _originalSaveCart(cart);
  updateFloatingCart();
};

function openDishPreview(item) {
  let modal = document.getElementById("global-dish-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "global-dish-modal";
    modal.className = "dish-modal-overlay";
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove("active");
    };
    document.body.appendChild(modal);
  }

  const fallbackImg = "https://unsplash.com";
  const imgSrc = item.image || fallbackImg;

  modal.innerHTML = `
    <div class="dish-modal-card">
      <button class="dish-modal-close" onclick="document.getElementById('global-dish-modal').classList.remove('active')">&times;</button>
      <img src="${imgSrc}" alt="${sanitizeInput(item.name)}" class="dish-modal-img" onerror="this.src='${fallbackImg}'" />
      <div class="dish-modal-body">
        <div class="diet-badge">
          <span class="diet-dot ${item.veg ? "diet-veg" : "diet-nonveg"}"></span>
          <span>${item.veg ? "PURE VEG" : "NON-VEG"} • ${sanitizeInput(item.category || "Special")} • 25-30 MINS</span>
        </div>
        <h2 style="margin-bottom: 8px;">${sanitizeInput(item.name)}</h2>
        <p class="card-desc">${sanitizeInput(item.desc || "Freshly prepared with authentic spices and quality ingredients.")}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px; gap: 12px;">
          <span class="price-tag" style="margin: 0; font-size: 1.4rem;">${formatPrice(item.price)}</span>
          <button class="btn" style="flex: 1;" id="modal-add-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("modal-add-btn").onclick = () => {
    addToCart(item);
    modal.classList.remove("active");
  };

  modal.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.body.getAttribute("data-root") || "..";
  const path = window.location.pathname;
  const user = getCurrentUser();

  // 1. Inject Floating View Cart Bar
  const floatingBar = document.createElement("a");
  floatingBar.id = "floating-cart-bar";
  floatingBar.className = "floating-cart-bar";
  floatingBar.href = `${root}/cart-page/index.html`;
  document.body.appendChild(floatingBar);

  // 2. Inject Mobile Bottom Navigation Dock (Clean SVG Icons, Zero Emojis)
  const bottomNav = document.createElement("nav");
  bottomNav.className = "mobile-bottom-nav";
  bottomNav.innerHTML = `
    <a href="${root}/index.html" class="${!path.includes("-page") ? "active" : ""}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>Home</span>
    </a>
    <a href="${root}/menu-page/index.html" class="${path.includes("menu-page") ? "active" : ""}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
      <span>Menu</span>
    </a>
    <a href="${root}/cart-page/index.html" class="${path.includes("cart-page") ? "active" : ""}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <span>Cart <strong id="mobile-cart-badge"></strong></span>
    </a>
    <a href="${root}/${user ? "profile-page" : "login-page"}/index.html" class="${path.includes("profile-page") || path.includes("login-page") ? "active" : ""}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>${user ? "Profile" : "Login"}</span>
    </a>
  `;
  document.body.appendChild(bottomNav);
});
