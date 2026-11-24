// 1. Store the items added to the cart
let cartItems = [];

// 2. Function to display the cart on the webpage
export function loadCart(containerId) {
  const container = document.getElementById(containerId);

  // Helper function to redraw the cart whenever items change
  function renderCart() {
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    container.innerHTML = `
      <div style="border: 2px solid #333; padding: 16px; margin-top: 20px; border-radius: 8px; background: #f9f9f9;">
        <h2>Your Cart (${cartItems.reduce((sum, item) => sum + item.qty, 0)} items)</h2>
        
        ${cartItems.length === 0 
          ? "<p>Your cart is empty. Click 'Add to Cart' on any dish!</p>" 
          : `
            <ul style="list-style: none; padding: 0;">
              ${cartItems.map(item => `
                <li style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>${item.name} (x${item.qty})</span>
                  <span>
                    ₹${item.price * item.qty} 
                    <button class="remove-btn" data-id="${item.id}" style="margin-left: 8px;">Remove</button>
                  </span>
                </li>
              `).join("")}
            </ul>
            <hr>
            <h3>Total: ₹${totalAmount}</h3>
            <button id="checkout-btn" style="padding: 8px 16px; background: green; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Place Order
            </button>
          `
        }
      </div>
    `;
  }

  // 3. Listen for the signal sent by Person A's menu.js!
  window.addEventListener("itemAddedToCart", (event) => {
    const newItem = event.detail;
    const existingItem = cartItems.find(item => item.id === newItem.id);

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cartItems.push({ ...newItem, qty: 1 });
    }

    renderCart();
  });

  // 4. Handle "Remove" and "Place Order" clicks inside the cart
  container.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-btn")) {
      const itemId = Number(event.target.dataset.id);
      cartItems = cartItems.filter(item => item.id !== itemId);
      renderCart();
    }

    if (event.target.id === "checkout-btn") {
      alert("Order placed successfully! Thank you.");
      cartItems = [];
      renderCart();
    }
  });

  // Draw the empty cart when the page first loads
  renderCart();
}
