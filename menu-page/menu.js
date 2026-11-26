const allMenuItems = [
  {
    id: 1,
    name: "Hyderabadi Chicken Dum Biryani",
    category: "Biryani",
    veg: false,
    price: 260,
    desc: "Aromatic basmati rice layered with spiced tender chicken.", // <-- Comma added
    image: "https://pexels.com" // <-- Quotes added
  },

  {
    id: 2, // keep your original id
    name: "Paneer Butter Masala",
    category: "North Indian",
    veg: true,
    price: 240, // keep your original price
    desc: "Cottage cheese cubes simmered in rich creamy tomato gravy.",
    image: "https://pexels.com"
  },

  {
    id: 3,
    name: "Ghee Roast Masala Dosa",
    category: "South Indian",
    veg: true,
    price: 110,
    desc: "Crispy golden dosa stuffed with spiced potato masala.",
    image: "https://wikimedia.org"
  },
  {
    id: 4,
    name: "Mutton Haleem",
    category: "Biryani",
    veg: false,
    price: 290,
    desc: "Slow-cooked wheat, lentils, and tender mutton with fried onions."
  },
  {
    id: 5,
    name: "Butter Naan (2 Pcs)",
    category: "North Indian",
    veg: true,
    price: 75,
    desc: "Soft tandoori flatbread brushed with melted butter."
  },
  {
    id: 6,
    name: "Double Ka Meetha",
    category: "Dessert",
    veg: true,
    price: 120,
    desc: "Traditional Hyderabadi bread pudding soaked in saffron milk."
  },
  {
    id: 7,
    name: "Chicken 65",
    category: "Starters",
    veg: false,
    price: 210,
    desc: "Crispy spicy deep-fried chicken bites tossed with curry leaves."
  },
  {
    id: 8,
    name: "Veg Manchurian",
    category: "Starters",
    veg: true,
    price: 160,
    desc: "Crispy vegetable dumplings tossed in tangy garlic soy sauce."
  },
  {
    id: 9,
    name: "Idli Sambar (3 Pcs)",
    category: "South Indian",
    veg: true,
    price: 70,
    desc: "Steamed fluffy rice cakes served with hot lentil sambar."
  },
  {
    id: 10,
    name: "Tandoori Chicken (Half)",
    category: "Starters",
    veg: false,
    price: 280,
    desc: "Char-grilled chicken marinated in yogurt and smoky spices."
  },
  {
    id: 11,
    name: "Jeera Rice & Dal Tadka",
    category: "North Indian",
    veg: true,
    price: 170,
    desc: "Cumin-tempered rice paired with yellow lentils."
  },
  {
    id: 12,
    name: "Irani Chai & Osmania Biscuits",
    category: "Beverages",
    veg: true,
    price: 60,
    desc: "Creamy Hyderabadi tea served with sweet-and-salty biscuits."
  },
  {
    id: 13,
    name: "Gulab Jamun (2 Pcs)",
    category: "Dessert",
    veg: true,
    price: 90,
    desc: "Warm milk-solid dumplings soaked in cardamom sugar syrup."
  },
  {
    id: 14,
    name: "Mango Lassi",
    category: "Beverages",
    veg: true,
    price: 95,
    desc: "Chilled thick yogurt smoothie blended with sweet mango."
  }
];

const menuContainer = document.getElementById("menu-list");
const sentinel = document.getElementById("scroll-sentinel");
const searchInput = document.getElementById("search-input");
const pillsContainer = document.getElementById("category-pills");

let activeCategory = "All";
let searchQuery = "";
let filteredItems = [...allMenuItems];
let currentIndex = 0;
const ITEMS_PER_LOAD = 6;

// 1. Build Category Filter Pills
const categories = ["All", ...new Set(allMenuItems.map((i) => i.category))];
categories.forEach((cat) => {
  const btn = document.createElement("button");
  btn.className = `pill ${cat === "All" ? "active" : ""}`;
  btn.textContent = cat;
  btn.onclick = () => {
    document.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = cat;
    resetAndFilter();
  };
  pillsContainer.appendChild(btn);
});

// 2. Search Input Listener
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  resetAndFilter();
});

function resetAndFilter() {
  filteredItems = allMenuItems.filter((item) => {
    const matchesCat = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery) ||
      item.desc.toLowerCase().includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  menuContainer.innerHTML = "";
  currentIndex = 0;
  observer.observe(sentinel);
  loadNextBatch();
}

// 3. Infinite Scroll Batch Loader
function loadNextBatch() {
  if (filteredItems.length === 0) {
    menuContainer.innerHTML = "<p>No dishes match your search.</p>";
    sentinel.textContent = "";
    observer.disconnect();
    return;
  }

  const nextItems = filteredItems.slice(currentIndex, currentIndex + ITEMS_PER_LOAD);

  nextItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
    <div style="cursor: pointer;" onclick='openDishPreview(${JSON.stringify(item)})'>
      <div class="diet-badge">
        <span class="diet-dot ${item.veg ? "diet-veg" : "diet-nonveg"}"></span>
        <span>${item.veg ? "VEG" : "NON-VEG"} • ${item.category}</span>
      </div>
      <h3 class="card-title">${item.name}</h3>
      <p class="card-desc">${item.desc}</p>
    </div>
    <div>
      <p class="price-tag">${formatPrice(item.price)}</p>
      <button class="btn btn-full" onclick="handleAdd(${item.id})">Add to Cart</button>
    </div>
  `;

    const imgEl = card.querySelector(".dish-img");
    if (imgEl) {
      imgEl.addEventListener(
        "error",
        () => {
          imgEl.outerHTML = `<div class="dish-fallback">${item.category}</div>`;
        },
        { once: true }
      );
    }

    menuContainer.appendChild(card);
  });

  currentIndex += ITEMS_PER_LOAD;

  if (currentIndex >= filteredItems.length) {
    sentinel.textContent = "You've seen all matching dishes!";
    observer.disconnect();
  } else {
    sentinel.textContent = "Loading more dishes...";
  }
}

function handleAdd(id) {
  const selected = allMenuItems.find((item) => item.id === id);
  if (selected) addToCart(selected);
}

const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) setTimeout(loadNextBatch, 200);
  },
  { rootMargin: "100px" }
);

// Auto-select category if user clicked a shortcut on the Home page
const urlCategory = new URLSearchParams(window.location.search).get("cat");
if (urlCategory && categories.includes(urlCategory)) {
  activeCategory = urlCategory;
  document.querySelectorAll(".pill").forEach((p) => {
    p.classList.toggle("active", p.textContent === urlCategory);
  });
}
resetAndFilter();

observer.observe(sentinel);
