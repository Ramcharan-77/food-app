const menuItems = [
  { id: 1, name: "Hyderabadi Chicken Biryani", price: 260 },
  { id: 2, name: "Paneer Butter Masala", price: 220 },
  { id: 3, name: "Masala Dosa", price: 90 },
  { id: 4, name: "Double Ka Meetha", price: 110 }
];

const menuContainer = document.getElementById("menu-list");

menuItems.forEach((item) => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h3>${item.name}</h3>
    <p style="margin: 8px 0;">Price: ${formatPrice(item.price)}</p>
    <button onclick="handleAdd(${item.id})">Add to Cart</button>
  `;
  menuContainer.appendChild(card);
});

function handleAdd(id) {
  const selectedItem = menuItems.find((item) => item.id === id);
  if (selectedItem) {
    addToCart(selectedItem);
  }
}
