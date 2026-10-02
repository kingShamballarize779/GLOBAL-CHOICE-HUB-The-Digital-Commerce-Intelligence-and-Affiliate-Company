const productGrid = document.getElementById("product-grid");
const categoryGrid = document.getElementById("category-grid");
const searchInput = document.getElementById("search");

let products = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderProducts(items) {
  if (!items.length) {
    productGrid.innerHTML = `
      <div class="empty">
        No verified discoveries match your search.
      </div>
    `;
    return;
  }

  productGrid.innerHTML = items.map(product => `
    <article class="product-card">
      <p class="eyebrow">VERIFIED DISCOVERY</p>

      <h3>${escapeHtml(product.name)}</h3>

      <p class="product-category">
        ${escapeHtml(product.category)}
      </p>

      <p>
        ${escapeHtml(product.description)}
      </p>

      <p class="verification">
        ✓ Verified by ${escapeHtml(product.verification?.source || "GCH")}
      </p>

      ${
        product.officialUrl
          ? `<a
              href="${escapeHtml(product.officialUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="button"
            >
              Explore Official Site
            </a>`
          : ""
      }
    </article>
  `).join("");
}

function renderCategories(items) {
  const categories = [...new Set(
    items
      .map(product => product.category)
      .filter(Boolean)
  )].sort();

  if (!categories.length) {
    categoryGrid.innerHTML = "";
    return;
  }

  categoryGrid.innerHTML = categories.map(category => `
    <article class="category-card">
      <h3>${escapeHtml(category)}</h3>
      <p>
        Explore verified discoveries in this curated path.
      </p>
    </article>
  `).join("");
}

function filterProducts() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = products.filter(product => {
    const searchableText = [
      product.name,
      product.category,
      product.description,
      product.merchant
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  renderProducts(filtered);
}

async function loadCatalogue() {
  try {
    const response = await fetch("products.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Catalogue request failed: ${response.status}`);
    }

    const catalogue = await response.json();

    products = Array.isArray(catalogue.products)
      ? catalogue.products.filter(
          product => product.verification?.status === "verified"
        )
      : [];

    renderProducts(products);
    renderCategories(products);

  } catch (error) {
    console.error("GCH catalogue error:", error);

    productGrid.innerHTML = `
      <div class="empty">
        The verified catalogue could not be loaded.
        Please try again shortly.
      </div>
    `;
  }
}

if (searchInput) {
  searchInput.addEventListener("input", filterProducts);
}

loadCatalogue();
