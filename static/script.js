let selectedFood = "natto";
let selectedRating = "excellent";

const searchableFoods = [
  { key: "tomato", name: "トマト", emoji: "🍅" },
  { key: "carrot", name: "にんじん", emoji: "🥕" },
  { key: "spinach", name: "ほうれん草", emoji: "🥬" },
  { key: "egg", name: "卵", emoji: "🥚" },
  { key: "natto", name: "納豆", emoji: "🫘" },
  { key: "chicken", name: "鶏肉", emoji: "🍗" }
];

const foodSearch = document.getElementById("foodSearch");
const searchOkButton = document.getElementById("searchOkButton");
const searchResults = document.getElementById("searchResults");

const ratingCards = document.querySelectorAll(".rating-card");
const resultStatusIcon = document.getElementById("resultStatusIcon");

function updateRatingCards() {
  ratingCards.forEach((card) => {
    card.classList.remove("active");

    if (card.dataset.rating === selectedRating) {
      card.classList.add("active");
    }
  });
}

function updateStatusColor() {
  if (!resultStatusIcon) return;

  resultStatusIcon.classList.remove("excellent", "good", "improve");
  resultStatusIcon.classList.add(selectedRating);
}

async function updateDisplay() {
  try {
    const response = await fetch(`/api/pair/${selectedFood}/${selectedRating}`);

    if (!response.ok) {
      throw new Error("データが見つかりません");
    }

    const data = await response.json();

    document.getElementById("selectedFood").textContent =
      `選んだ食材：${data.emoji || ""} ${data.name || ""}`;

    document.getElementById("resultStatusIcon").textContent = data.icon || "";
    document.getElementById("pairTitle").textContent = data.pairTitle || "";
    document.getElementById("nutritionScore").textContent = data.nutritionScore || "-";
    document.getElementById("boostRate").textContent = data.boostRate || "-";
    document.getElementById("suggestion").textContent = data.suggestion || "";
    document.getElementById("reason").textContent = data.reason || "";
    document.getElementById("improvement").textContent = data.improvement || "";

    const boostTags = document.getElementById("boostTags");
    boostTags.innerHTML = "";

    if (Array.isArray(data.boosts)) {
      data.boosts.forEach((boost) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = boost;
        boostTags.appendChild(span);
      });
    }

    const dressingList = document.getElementById("dressingList");
    dressingList.innerHTML = "";

    if (Array.isArray(data.dressings)) {
      data.dressings.forEach((dressing) => {
        const li = document.createElement("li");
        li.textContent = dressing;
        dressingList.appendChild(li);
      });
    }

    updateRatingCards();
    updateStatusColor();

  } catch (error) {
    console.error(error);

    document.getElementById("selectedFood").textContent = "選んだ食材：データなし";
    document.getElementById("resultStatusIcon").textContent = "？";
    document.getElementById("pairTitle").textContent = "データが見つかりません";
    document.getElementById("nutritionScore").textContent = "-";
    document.getElementById("boostRate").textContent = "-";
    document.getElementById("suggestion").textContent = "別の食材を選んでください。";
    document.getElementById("reason").textContent = "登録されていない食材、または評価データです。";
    document.getElementById("improvement").textContent = "食品データの追加が必要です。";
  }
}

function renderSearchResults(keyword) {
  if (!searchResults) return;

  searchResults.innerHTML = "";

  if (keyword === "") {
    searchResults.innerHTML = `<p class="search-message">食材名を入力してください</p>`;
    return;
  }

  const filteredFoods = searchableFoods.filter((food) => {
    return food.name.includes(keyword);
  });

  if (filteredFoods.length === 0) {
    searchResults.innerHTML = `<p class="search-message">該当する食材が見つかりません</p>`;
    return;
  }

  filteredFoods.forEach((food) => {
    const button = document.createElement("button");
    button.className = "search-result-button";
    button.textContent = `${food.emoji} ${food.name}`;

    if (food.key === selectedFood) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      selectedFood = food.key;
      foodSearch.value = food.name;
      renderSearchResults(food.name);
      updateDisplay();
    });

    searchResults.appendChild(button);
  });
}

function selectFoodFromSearch() {
  const keyword = foodSearch.value.trim();

  if (keyword === "") {
    searchResults.innerHTML = `<p class="search-message">食材名を入力してください</p>`;
    return;
  }

  const foundFood = searchableFoods.find((food) => {
    return food.name === keyword;
  });

  if (!foundFood) {
    searchResults.innerHTML = `<p class="search-message">登録されている食材名を選んでください</p>`;
    return;
  }

  selectedFood = foundFood.key;
  renderSearchResults(foundFood.name);
  updateDisplay();
}

if (foodSearch) {
  foodSearch.addEventListener("input", () => {
    const keyword = foodSearch.value.trim();
    renderSearchResults(keyword);
  });

  foodSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      selectFoodFromSearch();
    }
  });
}

if (searchOkButton) {
  searchOkButton.addEventListener("click", () => {
    selectFoodFromSearch();
  });
}

ratingCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedRating = card.dataset.rating;
    updateDisplay();
  });
});

if (foodSearch) {
  foodSearch.value = "納豆";
  renderSearchResults("納豆");
}

updateDisplay();