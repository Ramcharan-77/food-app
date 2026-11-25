// Key used to store cart items in the browser
const CART_KEY = "food_app_cart";

// Get all items currently in the cart
function getCart() {
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

// Save the updated cart back to browser storage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Person A calls this when a user clicks "Add to Cart" on menu-page
function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === item.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  saveCart(cart);
  alert(`${item.name} added to cart!`);
}

// Person B calls this when a user clicks "Remove" on cart-page
function removeFromCart(itemId) {
  const updatedCart = getCart().filter((item) => item.id !== itemId);
  saveCart(updatedCart);
}

// Format price cleanly in Indian Rupees (e.g., ₹250.00)
function formatPrice(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}
