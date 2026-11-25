const CART_KEY = "food_app_cart";

/* =========================================================
   1. SHARED CART FUNCTIONS
   ========================================================= */
function getCart() {
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
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

function removeFromCart(itemId) {
  const updatedCart = getCart().filter((item) => item.id !== itemId);
  saveCart(updatedCart);
  showToast("Item removed from Cart", "danger");
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

function formatPrice(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

/* =========================================================
   2. AUTOMATIC NAVBAR INJECTOR (Single Source of Truth)
   ========================================================= */
function injectNavbar() {
  // Reads data-root="." (root folder) or data-root=".." (subfolders)
  const root = document.body.getAttribute("data-root") || "..";
  const currentUrl = window.location.pathname;

  // Add any future pages here once, and all HTML files get them!
  const pages = [
    { name: "Home", path: `${root}/index.html`, key: "home" },
    { name: "Menu", path: `${root}/menu-page/index.html`, key: "menu" },
    { name: "Cart", path: `${root}/cart-page/index.html`, key: "cart", badge: true },
  ];

  const linksHTML = pages
    .map((page) => {
      const isHome =
        page.key === "home" && !currentUrl.includes("menu") && !currentUrl.includes("cart");
      const isCurrent = isHome || currentUrl.includes(page.key);

      const badgeHTML = page.badge
        ? ` <span id="global-cart-count" class="cart-badge">0</span>`
        : "";

      return `<a href="${page.path}" class="${isCurrent ? "active" : ""}">${page.name}${badgeHTML}</a>`;
    })
    .join("");

  const navbarHTML = `
    <header class="navbar">
      <div class="navbar-inner">
        <a href="${root}/index.html" class="brand">FoodApp</a>
        <nav class="nav-links">
          ${linksHTML}
        </nav>
      </div>
    </header>
  `;

  // Inject at the very top of <body>
  document.body.insertAdjacentHTML("afterbegin", navbarHTML);
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById("global-cart-count");
  if (!badge) return;
  const totalItems = getCart().reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalItems;
}

// Automatically run on every page load
document.addEventListener("DOMContentLoaded", injectNavbar);
/* =========================================================
   3. MOBILE-FRIENDLY TOAST NOTIFICATION
   ========================================================= */
let toastTimer;

function showToast(message, type = "success") {
  let toast = document.getElementById("global-toast");

  // Create the toast element once if it doesn't exist yet
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "global-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast-notification ${type === "danger" ? "danger" : ""}`;

  // Trigger slide-in animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Hide automatically after 2.5 seconds
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
