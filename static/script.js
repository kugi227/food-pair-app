const foodData = {
  tomato: {
    name: "トマト",
    emoji: "🍅",
    excellent: {
      icon: "◎",
      pairTitle: "🍅 トマト × 🫒 オリーブオイル",
      nutritionScore: "120",
      boostRate: "+20%",
      boosts: ["リコピン活用サポート", "抗酸化サポート", "吸収サポート"],
      suggestion: "オリーブオイルと一緒に食べる",
      reason: "トマトのリコピンは、油と一緒にとることで吸収されやすいとされています。",
      improvement: "サラダにする場合は、オイル系ドレッシングを使うと栄養を活かしやすくなります。",
      dressings: ["オリーブオイル系ドレッシング", "レモンオイルドレッシング"]
    },
    good: {
      icon: "○",
      pairTitle: "🍅 トマト × 🥚 卵",
      nutritionScore: "110",
      boostRate: "+10%",
      boosts: ["たんぱく質サポート", "彩りサポート", "食事バランスサポート"],
      suggestion: "トマトと卵を炒める",
      reason: "トマトと卵を合わせることで、たんぱく質と野菜を一緒にとりやすくなります。",
      improvement: "油を少し使って炒めると、トマトの栄養を活かしやすくなります。",
      dressings: ["オーロラソース風", "和風ドレッシング"]
    },
    improve: {
      icon: "△",
      pairTitle: "🍅 トマト単体",
      nutritionScore: "95",
      boostRate: "+0%",
      boosts: ["ちょい足し推奨", "吸収改善余地あり", "油を足すと良い"],
      suggestion: "油を含む食材を少し足す",
      reason: "トマト単体でも良い食材ですが、油と合わせることでリコピンをより活かしやすくなります。",
      improvement: "オリーブオイルやチーズを足すと、食べ合わせの改善につながります。",
      dressings: ["オリーブオイル系ドレッシング", "バジルドレッシング"]
    }
  },

  carrot: {
    name: "にんじん",
    emoji: "🥕",
    excellent: {
      icon: "◎",
      pairTitle: "🥕 にんじん × 🫒 ごま油",
      nutritionScore: "118",
      boostRate: "+18%",
      boosts: ["βカロテン活用", "吸収サポート", "美容サポート"],
      suggestion: "油と一緒に炒める",
      reason: "にんじんのβカロテンは、油と合わせることで吸収されやすくなります。",
      improvement: "炒め物や温野菜にすると、栄養を活かしやすくなります。",
      dressings: ["ごまドレッシング", "フレンチドレッシング"]
    },
    good: {
      icon: "○",
      pairTitle: "🥕 にんじん × 🥚 卵",
      nutritionScore: "108",
      boostRate: "+8%",
      boosts: ["彩りサポート", "たんぱく質サポート", "食事バランス"],
      suggestion: "にんじんしりしり風にする",
      reason: "にんじんと卵を合わせると、彩りとたんぱく質を補いやすくなります。",
      improvement: "少量の油を使うと、にんじんの栄養を活かしやすくなります。",
      dressings: ["和風ドレッシング", "ごまドレッシング"]
    },
    improve: {
      icon: "△",
      pairTitle: "🥕 にんじん単体",
      nutritionScore: "92",
      boostRate: "+0%",
      boosts: ["油を足すと良い", "吸収改善余地あり", "調理法改善"],
      suggestion: "油を含む調理に変える",
      reason: "にんじん単体でも良いですが、油と合わせることでβカロテンを活かしやすくなります。",
      improvement: "炒める、ドレッシングをかける、ナッツを足すなどがおすすめです。",
      dressings: ["フレンチドレッシング", "オイル系ドレッシング"]
    }
  },

  spinach: {
    name: "ほうれん草",
    emoji: "🥬",
    excellent: {
      icon: "◎",
      pairTitle: "🥬 ほうれん草 × 🍋 レモン",
      nutritionScore: "116",
      boostRate: "+16%",
      boosts: ["鉄分活用サポート", "ビタミンCサポート", "抗酸化サポート"],
      suggestion: "レモンや酢を少し足す",
      reason: "ほうれん草の鉄は、ビタミンCを含む食材と合わせると活かしやすくなります。",
      improvement: "おひたしやサラダにレモンを足すと、食べ合わせの改善につながります。",
      dressings: ["レモンドレッシング", "和風ドレッシング"]
    },
    good: {
      icon: "○",
      pairTitle: "🥬 ほうれん草 × ⚪ ごま",
      nutritionScore: "108",
      boostRate: "+8%",
      boosts: ["ミネラルサポート", "風味アップ", "食べやすさサポート"],
      suggestion: "ごま和えにする",
      reason: "ごまと合わせることで風味が増し、ほうれん草を食べやすくできます。",
      improvement: "レモンや酢を少し足すと、さらに栄養面のサポートになります。",
      dressings: ["ごまドレッシング", "和風しょうゆドレッシング"]
    },
    improve: {
      icon: "△",
      pairTitle: "🥬 ほうれん草 × 🥛 乳製品",
      nutritionScore: "90",
      boostRate: "-",
      boosts: ["食べ方見直し", "タイミング調整", "ビタミンC追加推奨"],
      suggestion: "レモンやビタミンC食材を足す",
      reason: "組み合わせによっては、ミネラルの吸収が気になる場合があります。",
      improvement: "食べるタイミングをずらす、またはレモン・酢を足すと改善しやすくなります。",
      dressings: ["レモンドレッシング", "和風ドレッシング"]
    }
  },

  egg: {
    name: "卵",
    emoji: "🥚",
    excellent: {
      icon: "◎",
      pairTitle: "🥚 卵 × 🍅 トマト",
      nutritionScore: "114",
      boostRate: "+14%",
      boosts: ["たんぱく質サポート", "抗酸化サポート", "彩りサポート"],
      suggestion: "トマト卵炒めにする",
      reason: "卵のたんぱく質とトマトの栄養を一緒にとりやすくなります。",
      improvement: "油を少し使うと、トマトの栄養も活かしやすくなります。",
      dressings: ["オーロラソース風", "オイル系ドレッシング"]
    },
    good: {
      icon: "○",
      pairTitle: "🥚 卵 × 🥬 ほうれん草",
      nutritionScore: "108",
      boostRate: "+8%",
      boosts: ["たんぱく質サポート", "野菜追加", "食事バランス"],
      suggestion: "卵とほうれん草の炒め物にする",
      reason: "卵に野菜を合わせることで、食事全体のバランスが整いやすくなります。",
      improvement: "レモンや酢を少し足すと、ほうれん草の栄養も活かしやすくなります。",
      dressings: ["和風ドレッシング", "ごまドレッシング"]
    },
    improve: {
      icon: "△",
      pairTitle: "🥚 卵単体",
      nutritionScore: "94",
      boostRate: "+0%",
      boosts: ["野菜追加推奨", "バランス改善", "彩り改善"],
      suggestion: "野菜を一品足す",
      reason: "卵単体でも栄養はありますが、野菜を加えると食事全体のバランスが良くなります。",
      improvement: "トマト、ほうれん草、きのこなどを足すのがおすすめです。",
      dressings: ["和風ドレッシング", "オーロラソース風"]
    }
  },

  natto: {
    name: "納豆",
    emoji: "🫘",
    excellent: {
      icon: "◎",
      pairTitle: "🫘 納豆 × ⚪ 胡麻",
      nutritionScore: "120",
      boostRate: "+20%",
      boosts: ["抗酸化サポート", "たんぱく質活用サポート", "エイジングケアサポート"],
      suggestion: "納豆にすりごまを加える",
      reason: "納豆のたんぱく質と胡麻のビタミンEが相乗的に働き、抗酸化作用が高まります。",
      improvement: "納豆にすりごまを加えることで、栄養価が向上し、風味も豊かになります。",
      dressings: ["ごまドレッシング", "和風しょうゆドレッシング"]
    },
    good: {
      icon: "○",
      pairTitle: "🫘 納豆 × 🌿 ネギ",
      nutritionScore: "110",
      boostRate: "+10%",
      boosts: ["風味アップ", "食べやすさサポート", "発酵食品サポート"],
      suggestion: "納豆に刻みネギを加える",
      reason: "ネギを加えることで香りが良くなり、納豆を食べやすくできます。",
      improvement: "さらにごまや海苔を足すと、風味と栄養バランスが上がります。",
      dressings: ["和風だれ", "ごま風味だれ"]
    },
    improve: {
      icon: "△",
      pairTitle: "🫘 納豆 × 🍚 ごはんだけ",
      nutritionScore: "96",
      boostRate: "+0%",
      boosts: ["ちょい足し推奨", "食物繊維追加", "ミネラル追加"],
      suggestion: "ごま・ネギ・海苔を足す",
      reason: "納豆ごはんだけでも良いですが、薬味や海藻を足すことで栄養の幅が広がります。",
      improvement: "すりごま、ネギ、海苔を足すと、手軽に改善できます。",
      dressings: ["和風しょうゆだれ", "ごま風味だれ"]
    }
  },

  chicken: {
    name: "鶏肉",
    emoji: "🍗",
    excellent: {
      icon: "◎",
      pairTitle: "🍗 鶏肉 × 🍋 レモン",
      nutritionScore: "114",
      boostRate: "+14%",
      boosts: ["たんぱく質サポート", "さっぱりサポート", "食欲サポート"],
      suggestion: "鶏肉にレモンを合わせる",
      reason: "鶏肉に酸味を合わせると、さっぱり食べやすくなります。",
      improvement: "野菜も一緒に加えると、食事全体のバランスが良くなります。",
      dressings: ["レモン系ドレッシング", "玉ねぎドレッシング"]
    },
    good: {
      icon: "○",
      pairTitle: "🍗 鶏肉 × 🍄 きのこ",
      nutritionScore: "108",
      boostRate: "+8%",
      boosts: ["食物繊維サポート", "うま味アップ", "満足感サポート"],
      suggestion: "鶏肉ときのこを炒める",
      reason: "きのこを加えることで食物繊維やうま味が加わり、満足感が出ます。",
      improvement: "レモンや香味野菜を足すと、さらに食べやすくなります。",
      dressings: ["和風ドレッシング", "玉ねぎドレッシング"]
    },
    improve: {
      icon: "△",
      pairTitle: "🍗 鶏肉単体",
      nutritionScore: "92",
      boostRate: "+0%",
      boosts: ["野菜追加推奨", "食物繊維不足", "バランス改善"],
      suggestion: "野菜や酸味を足す",
      reason: "鶏肉だけだと、食物繊維やビタミンが不足しやすくなります。",
      improvement: "サラダ、レモン、きのこ、玉ねぎなどを足すとバランスが良くなります。",
      dressings: ["レモン系ドレッシング", "玉ねぎドレッシング"]
    }
  }
};

let selectedFood = "natto";
let selectedRating = "excellent";

const foodCatalog = {
  tomato: { label: "トマト", keywords: ["tomato", "とまと"] },
  carrot: { label: "にんじん", keywords: ["carrot", "人参"] },
  spinach: { label: "ほうれん草", keywords: ["spinach", "ほうれんそう"] },
  egg: { label: "卵", keywords: ["egg", "たまご", "玉子"] },
  chicken: { label: "鶏肉", keywords: ["chicken", "とりにく", "鳥肉"] },
  natto: { label: "納豆", keywords: ["natto", "なっとう"] }
};

const foodCategories = [
  { id: "vegetables", name: "野菜", foods: ["tomato", "carrot", "spinach"] },
  { id: "fish", name: "魚", foods: ["mackerel", "salmon"] },
  { id: "meat", name: "肉", foods: ["chicken"] },
  { id: "fruits", name: "果物", foods: ["lemon", "apple", "banana"] },
  { id: "drinks", name: "飲み物", foods: ["milk", "greenTea", "coffee"] },
  { id: "other", name: "その他", foods: ["egg", "natto"] }
];

let foodButtons = document.querySelectorAll(".food-button");
const ratingCards = document.querySelectorAll(".rating-card");
const resultStatusIcon = document.getElementById("resultStatusIcon");
const foodSearchWrapper = document.getElementById("foodSearchWrapper");
const foodSearch = document.getElementById("foodSearch");
const foodCandidatePanel = document.getElementById("foodCandidatePanel");
const foodCategoryTabs = document.getElementById("foodCategoryTabs");
const searchResults = document.getElementById("searchResults");
let activeFoodCategory = foodCategories[0].id;

function getFoodLabel(foodKey) {
  return foodCatalog[foodKey]?.label || foodData[foodKey]?.name || foodKey;
}

function isSelectableFood(foodKey) {
  return Boolean(foodData[foodKey]);
}

function createFoodButton(foodKey) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "food-button";
  button.dataset.food = foodKey;
  button.textContent = `${foodData[foodKey].emoji} ${getFoodLabel(foodKey)}`;
  return button;
}

function selectFood(foodKey) {
  if (!isSelectableFood(foodKey)) {
    return;
  }

  selectedFood = foodKey;
  if (foodSearch) {
    foodSearch.value = getFoodLabel(foodKey);
  }
  updateDisplay();
  closeCandidatePanel();
}

function openCandidatePanel() {
  if (!foodCandidatePanel) {
    return;
  }

  foodCandidatePanel.classList.add("open");
  foodCandidatePanel.setAttribute("aria-hidden", "false");
}

function closeCandidatePanel() {
  if (!foodCandidatePanel) {
    return;
  }

  foodCandidatePanel.classList.remove("open");
  foodCandidatePanel.setAttribute("aria-hidden", "true");
}

function renderCategoryTabs() {
  if (!foodCategoryTabs) {
    return;
  }

  foodCategoryTabs.innerHTML = "";

  foodCategories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "food-category-tab";
    button.dataset.category = category.id;
    button.textContent = category.name;

    if (category.id === activeFoodCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      activeFoodCategory = category.id;
      if (foodSearch) {
        foodSearch.value = "";
      }
      renderCategoryTabs();
      renderSearchResults();
      openCandidatePanel();
    });

    foodCategoryTabs.appendChild(button);
  });
}

function getSearchableFoods() {
  return Object.keys(foodData).map((foodKey) => ({
    key: foodKey,
    label: getFoodLabel(foodKey),
    name: foodData[foodKey].name || "",
    keywords: foodCatalog[foodKey]?.keywords || []
  }));
}

function findMatchingFoods(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return getSearchableFoods().filter((food) => {
    const targets = [food.key, food.label, food.name, ...food.keywords];
    return targets.some((target) => String(target).toLowerCase().includes(normalizedQuery));
  });
}

function renderSearchResults() {
  if (!searchResults || !foodSearch) {
    return;
  }

  const query = foodSearch.value.trim();
  const activeCategory = foodCategories.find((category) => category.id === activeFoodCategory);
  const categoryFoods = activeCategory ? activeCategory.foods.filter(isSelectableFood) : [];
  const matches = query
    ? findMatchingFoods(query).map((food) => food.key)
    : categoryFoods;

  searchResults.innerHTML = "";

  if (matches.length === 0) {
    const noResult = document.createElement("div");
    noResult.className = "no-result";
    noResult.textContent = "一致する食材がありません";
    searchResults.appendChild(noResult);
    return;
  }

  matches.forEach((foodKey) => {
    const button = createFoodButton(foodKey);
    button.classList.add("search-result-button");
    searchResults.appendChild(button);
  });

  foodButtons = document.querySelectorAll(".food-button");
  updateFoodButtons();
}

function submitSearchFood() {
  if (!foodSearch) {
    return;
  }

  const [firstMatch] = findMatchingFoods(foodSearch.value);

  if (firstMatch) {
    selectFood(firstMatch.key);
  }
}

function updateFoodButtons() {
  foodButtons = document.querySelectorAll(".food-button");

  foodButtons.forEach((button) => {
    button.classList.remove("active");
    if (button.dataset.food === selectedFood) {
      button.classList.add("active");
    }
  });
}

function updateRatingCards() {
  ratingCards.forEach((card) => {
    card.classList.remove("active");
    if (card.dataset.rating === selectedRating) {
      card.classList.add("active");
    }
  });
}

function updateStatusColor() {
  resultStatusIcon.classList.remove("excellent", "good", "improve");
  resultStatusIcon.classList.add(selectedRating);
}

function parseBoostRate(boostRate) {
  const parsedValue = parseFloat(String(boostRate || "").replace("%", ""));

  if (Number.isNaN(parsedValue)) {
    return 0;
  }

  return Math.max(-20, Math.min(20, parsedValue));
}

function updateBoostMeter(boostRate) {
  const positiveBar = document.getElementById("boostMeterPositive");
  const negativeBar = document.getElementById("boostMeterNegative");

  if (!positiveBar || !negativeBar) {
    return;
  }

  const boostValue = parseBoostRate(boostRate);
  const widthPercent = `${Math.abs(boostValue) / 20 * 50}%`;

  positiveBar.style.width = "0";
  negativeBar.style.width = "0";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (boostValue > 0) {
        positiveBar.style.width = widthPercent;
      } else if (boostValue < 0) {
        negativeBar.style.width = widthPercent;
      }
    });
  });
}

function updateDisplay() {
  const food = foodData[selectedFood];
  if (!food) {
    return;
  }

  const data = food[selectedRating];

  document.getElementById("selectedFood").textContent = `選んだ食材：${food.emoji} ${food.name}`;
  document.getElementById("resultStatusIcon").textContent = data.icon;
  document.getElementById("pairTitle").textContent = data.pairTitle;
  document.getElementById("nutritionScore").textContent = data.nutritionScore;
  document.getElementById("boostRate").textContent = data.boostRate;
  updateBoostMeter(data.boostRate);
  document.getElementById("suggestion").textContent = data.suggestion;
  document.getElementById("reason").textContent = data.reason;
  document.getElementById("improvement").textContent = data.improvement;

  const boostTags = document.getElementById("boostTags");
  boostTags.innerHTML = "";
  data.boosts.forEach((boost) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = boost;
    boostTags.appendChild(span);
  });

  const dressingList = document.getElementById("dressingList");
  dressingList.innerHTML = "";
  data.dressings.forEach((dressing) => {
    const li = document.createElement("li");
    li.textContent = dressing;
    dressingList.appendChild(li);
  });

  updateFoodButtons();
  updateRatingCards();
  updateStatusColor();
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const foodButton = event.target.closest(".food-button");

  if (!foodButton) {
    return;
  }

  selectFood(foodButton.dataset.food);
});

if (foodSearch) {
  foodSearch.addEventListener("focus", () => {
    renderSearchResults();
    openCandidatePanel();
  });

  foodSearch.addEventListener("click", () => {
    renderSearchResults();
    openCandidatePanel();
  });

  foodSearch.addEventListener("input", () => {
    renderSearchResults();
    openCandidatePanel();
  });

  foodSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearchFood();
    }
  });
}

document.addEventListener("mousedown", (event) => {
  if (!(event.target instanceof Element) || !foodSearchWrapper) {
    return;
  }

  if (!foodSearchWrapper.contains(event.target)) {
    closeCandidatePanel();
  }
});

ratingCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedRating = card.dataset.rating;
    updateDisplay();
  });
});

renderCategoryTabs();
renderSearchResults();
updateDisplay();
