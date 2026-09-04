const POSTS_PER_LOAD = 5;
let currentIndex = 0;
let allPosts = [];
let filteredPosts = [];
let isLoading = false;
let currentFilter = "all";
let searchTerm = "";

const container = document.getElementById("cards-container");
const loadingEl = document.getElementById("loading");

if (container && loadingEl) {
async function loadPostsList() {
  try {
    const res = await fetch("./posts.json");

    if (!res.ok) {
      throw new Error("Could not load posts.json");
    }

    allPosts = await res.json();

    const params = new URLSearchParams(window.location.search);
    const filter = params.get("filter") || "all";

    applyFilter(filter);

  } catch (err) {
    console.error("Failed to load posts.json:", err);
  }
}

function applyFilter(filter) {
  currentFilter = filter;
  currentIndex = 0;
  container.innerHTML = "";

if (filter === "all") {
  filteredPosts = allPosts.filter(post => post.category !== "players");
} else if (filter === "top") {
  filteredPosts = [...allPosts]
    .filter(post => post.category !== "players")
    .sort((a, b) => b.rating - a.rating);
} else if (filter === "players") {
  filteredPosts = [...allPosts]
    .filter(post => post.category === "players")
    .sort((a, b) => b.rating - a.rating);
} else {
  filteredPosts = allPosts.filter(post => post.category === filter);
}

if (searchTerm) {
    const search = searchTerm.toLowerCase();

    filteredPosts = filteredPosts.filter(post =>
      `${post.title} ${post.excerpt}`.toLowerCase().includes(search)
    );
  }

  // Update active button
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  if (filteredPosts.length === 0) {
    container.innerHTML = `
      <p class="empty-message">
        Rien ici pour le moment. Les prochains matchs/joueurs arrivent bientôt.
      </p>
    `;
    return;
  }

  renderNextBatch();
}

function createCard(post) {
  const color = post.color;
  const rating = Math.min(Math.max(Number(post.rating) || 0, 0), 5);

  let starsHTML = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHTML += `<span class="star full">★</span>`;
    } else {
      starsHTML += `<span class="star empty">☆</span>`;
    }
  }

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="card-header">
      <div class="color-dot" style="background:${color}"></div>
      <h3>${post.title}</h3>
      <div class="stars" style="color:${color}">${starsHTML}</div>
    </div>
    <p>${post.excerpt}</p>
  `;

  return card;
}

function renderNextBatch() {
  if (isLoading || currentIndex >= filteredPosts.length) {
    if (currentIndex >= filteredPosts.length) {
      loadingEl.classList.add("hidden");
    }
    return;
  }

  isLoading = true;
  loadingEl.classList.remove("hidden");

  setTimeout(() => {
    const next = filteredPosts.slice(
      currentIndex,
      currentIndex + POSTS_PER_LOAD
    );

     next.forEach(post => {
      container.appendChild(createCard(post));
    });

    currentIndex += next.length;
    isLoading = false;

    if (currentIndex >= filteredPosts.length) {
      loadingEl.classList.add("hidden");
    } else {
      // Re-trigger the observer for the next batch
      observer.unobserve(loadingEl);
      observer.observe(loadingEl);
    }
  }, 200);
}

// Infinite scroll
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !isLoading) {
      renderNextBatch();
    }
  },
  { rootMargin: "250px" }
);

observer.observe(loadingEl);

// Filter button clicks
// → Clicking an already active filter turns it off and goes back to "All"
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    if (btn.classList.contains("active") && filter !== "all") {
      applyFilter("all");
    } else {
      applyFilter(filter);
    }
  });
});

// Search
const searchInput = document.getElementById("search");

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  applyFilter(currentFilter);
});

// Start
loadPostsList();

}
  
// Image zoom
document.querySelectorAll(".zoomable").forEach(img => {
  img.addEventListener("click", () => {
    img.classList.toggle("zoomed");
  });
});
