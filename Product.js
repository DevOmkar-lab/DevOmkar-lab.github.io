const products = [
  {
    name: "Sony Headphones",
    description: "Noise-canceling, comfortable and wireless.",
    price: 330,
    type: "electronics",
    condition: "new",
    rating: 5,
    image: "https://source.unsplash.com/200x200/?headphones"
  },
  {
    name: "Smart Watch",
    description: "Track your health and notifications.",
    price: 199,
    type: "electronics",
    condition: "new",
    rating: 4,
    image: "https://source.unsplash.com/200x200/?smartwatch"
  },
  {
    name: "Gaming Controller",
    description: "Wireless controller for ultimate gaming.",
    price: 120,
    type: "accessory",
    condition: "used",
    rating: 3,
    image: "https://source.unsplash.com/200x200/?controller"
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable sound for any occasion.",
    price: 80,
    type: "accessory",
    condition: "new",
    rating: 5,
    image: "https://source.unsplash.com/200x200/?speaker"
  },
  {
    name: "Keyboard",
    description: "Mechanical RGB keyboard.",
    price: 89,
    type: "electronics",
    condition: "used",
    rating: 4,
    image: "https://source.unsplash.com/200x200/?keyboard"
  }
];

const productList = document.getElementById('productList');
const searchInput = document.getElementById('searchInput');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');
const minPriceValue = document.getElementById('minPriceValue');
const maxPriceValue = document.getElementById('maxPriceValue');
const clearFilters = document.getElementById('clear-filters');

function renderProducts(items) {
  productList.innerHTML = "";
  if (items.length === 0) {
    productList.innerHTML = "<p>No products found.</p>";
    return;
  }

  items.forEach(product => {
    const div = document.createElement('div');
    div.classList.add('product-card');
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h4>${product.name}</h4>
      <p>${product.description}</p>
      <div class="price">$${product.price}</div>
    `;
    productList.appendChild(div);
  });
}

function filterProducts() {
  const query = searchInput.value.toLowerCase();
  const selectedConditions = Array.from(document.querySelectorAll('.condition:checked')).map(i => i.value);
  const selectedTypes = Array.from(document.querySelectorAll('.type:checked')).map(i => i.value);
  const selectedRatings = Array.from(document.querySelectorAll('.rating:checked')).map(i => parseInt(i.value));
  const min = parseInt(minPrice.value);
  const max = parseInt(maxPrice.value);

  const filtered = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(query);
    const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(product.condition);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(product.type);
    const matchesRating = selectedRatings.length === 0 || selectedRatings.includes(product.rating);
    const matchesPrice = product.price >= min && product.price <= max;

    return matchesSearch && matchesCondition && matchesType && matchesRating && matchesPrice;
  });

  renderProducts(filtered);
}

[minPrice, maxPrice, searchInput].forEach(el => el.addEventListener('input', () => {
  minPriceValue.textContent = minPrice.value;
  maxPriceValue.textContent = maxPrice.value;
  filterProducts();
}));

document.querySelectorAll('.condition, .type, .rating').forEach(input => {
  input.addEventListener('change', filterProducts);
});

clearFilters.addEventListener('click', () => {
  document.querySelectorAll('.condition, .type, .rating').forEach(i => i.checked = false);
  minPrice.value = 0;
  maxPrice.value = 600;
  searchInput.value = '';
  minPriceValue.textContent = "0";
  maxPriceValue.textContent = "600";
  filterProducts();
});

// Initial render
renderProducts(products);
