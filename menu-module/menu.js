// 1. Sample food data (Person A can add more items here anytime)
const menuItems = [
  { id: 1, name: "Hyderabadi Chicken Biryani", price: 250, category: "Main Course" },
  { id: 2, name: "Paneer Butter Masala", price: 210, category: "Main Course" },
  { id: 3, name: "Masala Dosa", price: 90, category: "South Indian" },
  { id: 4, name: "Mango Lassi", price: 70, category: "Drinks" }
];

// 2. Function to display the menu on the webpage
export function loadMenu(containerId) {
  const container = document.getElementById(containerId);

  // Create HTML cards for each food item
  container.innerHTML = `
    <h2>Our Menu</h2>
    <div class="menu-grid">
      ${menuItems.map(item => `
        <div class="menu-card" style="border: 1px solid #ccc; padding: 12px; margin: 10px 0; border-radius: 8px;">
          <h3>${item.name}</h3>
          <p>Category: ${item.category}</p>
          <p><strong>₹${item.price}</strong></p>
          <button class="add-btn" data-id="${item.id}">Add to Cart</button>
        </div>
      `).join("")}
    </div>
  `;

  // 3. Listen for clicks on any "Add to Cart" button
  container.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-btn")) {
      const itemId = Number(event.target.dataset.id);
      const selectedItem = menuItems.find(item => item.id === itemId);

      // Send a signal to Person B's cart module!
      const cartEvent = new CustomEvent("itemAddedToCart", {
        detail: selectedItem
      });
      window.dispatchEvent(cartEvent);
    }
  });
}
