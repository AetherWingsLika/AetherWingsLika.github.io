const POSTS_PER_LOAD = 5;
let currentIndex = 0;
let allPosts = [];
let filteredPosts = [];
let isLoading = false;
let currentFilter = "all";

const container = document.getElementById("cards-container");
const loadingEl = document.getElementById("loading");

const colors = ["#ef4444", "#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#06b6d4"];

async function loadPostsList() {
  try {
    const res = await fetch("./posts.json");
    if (!res.ok) throw new Error("No posts.json");
    allPosts = await res.json();
  } catch (err) {
    console.warn("Using fallback list");
    allPosts = [
      {
        title: "Game 1: Anderlecht vs Club Brugge",
        excerpt: "A classic Belgian derby full of tension and late drama…",
        url: "posts/game-1.html",
        category: "jupiler",
        color: colors[0]
      },
      {
        title: "Game 2: Inter vs Milan",
        excerpt: "The Derby della Madonnina never disappoints…",
        url: "posts/game-2.html",
        category: "serie-a",
        color: colors[1]
      },
      {
        title: "Game 3: Random Champions League night",
        excerpt: "Not everything has to be a big league…",
        url: "posts/game-3.html",
        category: "autres",
        color: colors[2]
      }
    ];
  }

  applyFilter("all");
}

function applyFilter(filter) {
  currentFilter = filter;
  currentIndex = 0;
  container.innerHTML = ""; // clear previous cards

  if (filter === "all") {
    filteredPosts = [...allPosts];
  } else {
    filteredPosts = allPosts.filter(post => post.category === filter);
  }

  // Update active button
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  renderNextBatch();
}

function createCard(post, index) {
  const color = post.color || colors[index % colors.length];
  const rating = post.rating || 0;

  // Generate stars (rating out of 10 → stars out of 5)
  let starsHTML = "";
  const fullStars = Math.floor(rating / 2);
  const hasHalf = rating % 2 === 1;

  for (let i = 0; i < fullStars; i++) {
    starsHTML += `<span class="star full">★</span>`;
  }
  if (hasHalf) {
    starsHTML += `<span class="star half">★</span>`;
  }

  const a = document.createElement("a");
  a.href = post.url;
  a.className = "card";

  a.innerHTML = `
    <div class="card-header">
      <div class="color-dot" style="background:${color}"></div>
      <h3>${post.title}</h3>
      <div class="stars">${starsHTML}</div>
    </div>
    <p>${post.excerpt}</p>
  `;

  return a;
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
    const next = filteredPosts.slice(currentIndex, currentIndex + POSTS_PER_LOAD);

    next.forEach((post, i) => {
      container.appendChild(createCard(post, currentIndex + i));
    });

    currentIndex += next.length;
    isLoading = false;

    if (currentIndex >= filteredPosts.length) {
      loadingEl.classList.add("hidden");
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

// Start
loadPostsList();
