const POSTS_PER_LOAD = 5;
let currentIndex = 0;
let allPosts = [];
let isLoading = false;

const container = document.getElementById("cards-container");
const loadingEl = document.getElementById("loading");

// Colors for the little squares (cycle through them)
const colors = ["#ef4444", "#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#06b6d4"];

async function loadPostsList() {
  try {
    // Prefer a JSON file (easy to maintain)
    const res = await fetch("./posts.json");
    if (!res.ok) throw new Error("No posts.json");
    allPosts = await res.json();
  } catch (err) {
    // Fallback: hard-coded list (useful while testing)
    console.warn("Using fallback list");
    allPosts = [
      {
        title: "Game 1: The first win ($100/month, Year 1)",
        excerpt: "This is not a success story. Two years ago I started with a simple goal…",
        url: "posts/game-1.html",
        color: colors[0]
      },
      {
        title: "Game 2: Breaking through the ceiling ($2k/month)",
        excerpt: "After more than 2 years of launching failure after failure…",
        url: "posts/game-2.html",
        color: colors[1]
      },
      {
        title: "Game 3: Learning through scars ($3k/month)",
        excerpt: "It’s late at night. I’m on my laptop. Over the past few months…",
        url: "posts/game-3.html",
        color: colors[2]
      }
      // Add more here if you prefer not to use posts.json
    ];
  }

  renderNextBatch();
}

function createCard(post, index) {
  const color = post.color || colors[index % colors.length];

  const a = document.createElement("a");
  a.href = post.url;
  a.className = "card";

  a.innerHTML = `
    <div class="card-header">
      <div class="color-dot" style="background:${color}"></div>
      <h3>${post.title}</h3>
    </div>
    <p>${post.excerpt}</p>
  `;

  return a;
}

function renderNextBatch() {
  if (isLoading || currentIndex >= allPosts.length) return;

  isLoading = true;
  loadingEl.classList.remove("hidden");

  // Small delay so the loading indicator is visible
  setTimeout(() => {
    const next = allPosts.slice(currentIndex, currentIndex + POSTS_PER_LOAD);

    next.forEach((post, i) => {
      container.appendChild(createCard(post, currentIndex + i));
    });

    currentIndex += next.length;
    isLoading = false;
    loadingEl.classList.add("hidden");

    // If nothing left, stop observing
    if (currentIndex >= allPosts.length) {
      observer.disconnect();
    }
  }, 250);
}

// Infinite scroll
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      renderNextBatch();
    }
  },
  { rootMargin: "200px" }
);

observer.observe(loadingEl);

// Start
loadPostsList();
