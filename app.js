const productGrid = document.getElementById("product-grid");
const categoryGrid = document.getElementById("category-grid");
const searchInput = document.getElementById("search");

const profileSection = document.getElementById("product-profile");
const profileName = document.getElementById("profile-name");
const profileContent = document.getElementById("profile-content");
const backToDiscoveries = document.getElementById("back-to-discoveries");

let products = [];
let activeCategory = "All";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCategories() {
  return [
    "All",
    ...new Set(
      products
        .map(product => product.category)
        .filter(Boolean)
    )
  ];
}

function renderProductStats() {
  const heading = document.querySelector("#discovery-desk .section-heading");

  if (!heading || document.getElementById("gch-catalogue-stats")) {
    return;
  }

  const stats = document.createElement("div");
  stats.id = "gch-catalogue-stats";

  stats.innerHTML = `
    <p>
      <strong>${products.length}</strong>
      verified ${products.length === 1 ? "discovery" : "discoveries"}
      across
      <strong>${getCategories().length - 1}</strong>
      ${getCategories().length - 1 === 1 ? "category" : "categories"}.
    </p>
  `;

  heading.appendChild(stats);
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
        ✓ Verified by
        ${escapeHtml(product.verification?.source || "GCH")}
      </p>

      <div class="product-actions">

        <button
          type="button"
          class="button"
          data-profile-id="${escapeHtml(product.id)}"
        >
          View GCH Discovery
        </button>

        ${
          product.officialUrl
            ? `
              <a
                href="${escapeHtml(product.officialUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                class="button"
              >
                Explore Official Site
              </a>
            `
            : ""
        }

      </div>
    </article>
  `).join("");
}

function renderCategories() {
  const categories = getCategories();

  categoryGrid.innerHTML = categories.map(category => {
    const count = category === "All"
      ? products.length
      : products.filter(product => product.category === category).length;

    const selected = activeCategory === category;

    return `
      <button
        type="button"
        class="category-card"
        data-category="${escapeHtml(category)}"
        aria-pressed="${selected}"
      >
        <h3>${escapeHtml(category)}</h3>

        <p>
          ${count} verified ${count === 1 ? "discovery" : "discoveries"}
        </p>
      </button>
    `;
  }).join("");

  categoryGrid
    .querySelectorAll("[data-category]")
    .forEach(button => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        renderCategories();
        applyFilters();
      });
    });
}

function applyFilters() {
  const query = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  const filtered = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const searchableText = [
      product.name,
      product.category,
      product.description,
      product.merchant
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !query || searchableText.includes(query);

    return matchesCategory && matchesSearch;
  });

  renderProducts(filtered);

  const existingCount =
    document.getElementById("gch-result-count");

  if (existingCount) {
    existingCount.textContent =
      `${filtered.length} verified ${
        filtered.length === 1 ? "discovery" : "discoveries"
      } shown`;
  }
}

function openProductProfile(productId) {
  const product = products.find(
    item => String(item.id) === String(productId)
  );

  if (!product || !profileSection || !profileName || !profileContent) {
    return;
  }

  profileName.textContent = product.name;

  profileContent.innerHTML = `
    <article class="product-profile-card">

      <p class="eyebrow">VERIFIED DISCOVERY</p>

      <h3>${escapeHtml(product.name)}</h3>

      <p class="product-category">
        ${escapeHtml(product.category)}
      </p>

      <p>
        ${escapeHtml(product.description)}
      </p>

      <div class="verification">
        <strong>Verification</strong>

        <p>
          ✓ Verified by
          ${escapeHtml(product.verification?.source || "GCH")}
        </p>

        ${
          product.verification?.verifiedAt
            ? `
              <p>
                Verified:
                ${escapeHtml(product.verification.verifiedAt)}
              </p>
            `
            : ""
        }
      </div>

      ${
        product.merchant
          ? `
            <p>
              <strong>Merchant:</strong>
              ${escapeHtml(product.merchant)}
            </p>
          `
          : ""
      }

      ${
        product.officialUrl
          ? `
            <p>
              <a
                href="${escapeHtml(product.officialUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                class="button"
              >
                Explore Official Site
              </a>
            </p>
          `
          : ""
      }

    </article>
  `;

  profileSection.hidden = false;

  profileSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function closeProductProfile() {
  if (!profileSection) {
    return;
  }

  profileSection.hidden = true;

  const discoveryDesk =
    document.getElementById("discovery-desk");

  if (discoveryDesk) {
    discoveryDesk.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

async function loadCatalogue() {
  try {
    const response = await fetch("products.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Catalogue request failed: ${response.status}`
      );
    }

    const catalogue = await response.json();

    products = Array.isArray(catalogue.products)
      ? catalogue.products.filter(
          product =>
            product.verification?.status === "verified"
        )
      : [];

    renderProductStats();
    renderCategories();

    const resultCount = document.createElement("p");

    resultCount.id = "gch-result-count";

    resultCount.textContent =
      `${products.length} verified ${
        products.length === 1 ? "discovery" : "discoveries"
      } shown`;

    productGrid.parentNode.insertBefore(
      resultCount,
      productGrid
    );

    applyFilters();

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

if (productGrid) {
  productGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-profile-id]");

    if (!button || !productGrid.contains(button)) {
      return;
    }

    event.preventDefault();

    openProductProfile(button.dataset.profileId);
  });
}

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

if (backToDiscoveries) {
  backToDiscoveries.addEventListener(
    "click",
    closeProductProfile
  );
}

loadCatalogue();
