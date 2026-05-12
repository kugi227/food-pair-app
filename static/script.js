let foodCatalog = {};
let foodData = {};
let selectedFood = "natto"; 
let selectedRating = "excellent";

// カテゴリーの初期設定
let foodCategories = [
  { id: "vegetables", name: "野菜", foods: ["トマト", "にんじん", "ブロッコリー", "ほうれん草", "玉ねぎ"] },
  { id: "meat", name: "肉", foods: ["鶏肉", "豚肉", "牛肉"] },
  { id: "fish", name: "魚", foods: ["鮭", "さば", "まぐろ"] },
  { id: "egg-dairy", name: "卵・乳製品", foods: ["卵", "牛乳", "チーズ", "ヨーグルト"] },
  { id: "soy-fermented", name: "大豆・発酵食品", foods: ["納豆", "豆腐", "味噌"] },
  { id: "mushroom", name: "きのこ", foods: ["しめじ", "えのき", "しいたけ"] },
  { id: "seaweed", name: "海藻", foods: ["わかめ", "昆布", "のり"] },
  { id: "nuts", name: "ナッツ", foods: ["アーモンド", "くるみ", "ごま"] },
  { id: "fruit", name: "フルーツ", foods: ["バナナ", "りんご", "みかん", "キウイ"] },
  { id: "drink", name: "飲み物", foods: ["緑茶", "コーヒー", "豆乳"] },
];
let purposeNutrientTags = [
  { id: "vitamin-c", name: "ビタミンC", foods: ["ブロッコリー", "キウイ", "みかん", "キャベツ"] },
  { id: "iron", name: "鉄", foods: ["ほうれん草", "納豆", "豆腐", "牛肉"] },
  { id: "protein", name: "たんぱく質", foods: ["鶏肉", "卵", "豆腐", "納豆", "ヨーグルト"] },
  { id: "fiber", name: "食物繊維", foods: ["ごぼう", "きのこ", "わかめ", "りんご"] },
  { id: "calcium", name: "カルシウム", foods: ["牛乳", "チーズ", "ヨーグルト", "小松菜"] },
  { id: "fatigue", name: "疲労回復", foods: ["豚肉", "卵", "納豆", "バナナ"] },
  { id: "beauty", name: "美肌", foods: ["トマト", "アボカド", "ブロッコリー", "鮭"] },
  { id: "anemia", name: "貧血予防", foods: ["ほうれん草", "牛肉", "納豆", "ひじき"] },
  { id: "gut", name: "腸活", foods: ["ヨーグルト", "納豆", "味噌", "きのこ"] },
  { id: "immune", name: "免疫サポート", foods: ["ブロッコリー", "きのこ", "緑茶", "みかん"] },
];
let searchPanelStep = "entry";
let activeFoodCategory = "";
let activePurposeTag = "";
let previewPanelStep = "";
let previewFoodCategory = "";
let previewPurposeTag = "";
const foodNameAliases = {
  "卵": "たまご",
  "さば": "サバ",
  "みかん": "オレンジ（フルーツ）",
  "きのこ": "しいたけ（キノコ類）",
};

// 1. データの読み込みと変換（JSONの全食材をfoodDataに登録）
async function loadFoods() {
  try {
    const response = await fetch("/foods"); // FlaskのAPIから全食材取得
    const rawFoods = await response.json();

    foodCatalog = {};
    foodData = {};

    rawFoods.forEach((item) => {
      const id = item.id || item.food;

      // 検索用カタログ（名前とキーワードで探せるようにする）
      foodCatalog[id] = { 
        label: item.food, 
        keywords: item.keywords || [] 
      };

      // 全食材の表示用データを組み立てる
      foodData[id] = {
        name: item.food,
        emoji: item.emoji || "🥗",
        nutrients: item.nutrients || [],
        excellent: {
          icon: "◎",
          pairTitle: `${item.emoji}${item.food} × ${item.good_pairs[0]?.food || "バランス食"}`,
          nutritionScore: item.good_pairs[0] ? Math.round(100 * item.good_pairs[0].boost) : "100",
          boostRate: item.good_pairs[0] ? `+${Math.round((item.good_pairs[0].boost - 1) * 100)}%` : "+0%",
          boosts: [item.good_pairs[0]?.effect || "基本の栄養"],
          suggestion: `${item.good_pairs[0]?.food || "をプラス"}`,
          reason: `${item.good_pairs[0]?.effect || ""}。${item.dressing_logic || ""}`,
          improvement: `おすすめ調理法：${item.best_methods?.join('、') || "加熱調理"}`,
          dressings: item.dressings ? item.dressings.map((d, i) => i === 0 ? `★${d} (栄養効率UP)` : d) : ["お好みの調味料"],
        },
        good: {
          icon: "○",
          pairTitle: (item.better_pairs && item.better_pairs.length > 0)
            ? `${item.emoji}${item.food} × ${item.better_pairs[0].food}`
            : `${item.emoji}${item.food} × 卵や野菜`,
          nutritionScore: (item.better_pairs && item.better_pairs.length > 0) 
            ? Math.round(100 * item.better_pairs[0].boost) 
            : "110",
          boostRate: (item.better_pairs && item.better_pairs.length > 0) 
            ? `+${Math.round((item.better_pairs[0].boost - 1) * 100)}%` 
            : "+10%",
          boosts: (item.better_pairs && item.better_pairs.length > 0) 
            ? [item.better_pairs[0].effect] 
            : ["バランスサポート"],
          suggestion: (item.better_pairs && item.better_pairs.length > 0) 
            ? `${item.better_pairs[0].food}をプラス` 
            : "他の食材と組み合わせて彩りアップ",
          reason: `${(item.better_pairs && item.better_pairs.length > 0) ? item.better_pairs[0].effect : "栄養バランスが整います"}。${item.dressing_logic || ""}`,
          improvement: "彩りよく盛り付けてみましょう。",
          dressings: item.dressings ? item.dressings.map((d, i) => i === 1 ? `★${d}` : d) : ["お好みのドレッシング"],
        },
        improve: {
          icon: (item.bad_pairs && item.bad_pairs.length > 0) ? "⚠" : "△",
          pairTitle: (item.bad_pairs && item.bad_pairs.length > 0) 
            ? `${item.emoji}${item.food} × ${item.bad_pairs[0].food}`
            : `${item.emoji}${item.food} 単体`,
          nutritionScore: (item.bad_pairs && item.bad_pairs.length > 0) ? "85" : "95",
          boostRate: (item.bad_pairs && item.bad_pairs.length > 0) ? "-15%" : "+0%",
          boosts: (item.bad_pairs && item.bad_pairs.length > 0) ? ["もったいないアラート"] : ["伸びしろあり"],
          suggestion: (item.bad_pairs && item.bad_pairs.length > 0) ? "この組み合わせは避ける" : "油や酸味を足して吸収率アップ",
          reason: item.bad_pairs && item.bad_pairs.length > 0 ? item.bad_pairs[0].effect : "もっと効率よく栄養を摂れる方法があります。",
          improvement: "食べるタイミングや調理法を工夫してみましょう。",
          dressings: ["（なし）"]
        }
      };
    });

    renderCategoryTabs();
    renderSearchResults();
    updateDisplay();

  } catch (error) {
    console.error("データの読み込みエラー:", error);
  }
}

// 2. 検索ロジック（名前、栄養素、キーワードすべてから探す「逆引き対応」）
function findMatchingFoods(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return Object.keys(foodData).filter((id) => {
    const food = foodData[id];
    const catalog = foodCatalog[id];
    const targets = [id, food.name, ...(catalog?.keywords || []), ...(food.nutrients || [])];
    return targets.some((target) => String(target).toLowerCase().includes(normalizedQuery));
  });
}

function findFoodIdByName(foodName) {
  const normalizedFoodName = foodNameAliases[foodName] || foodName;
  return Object.keys(foodData).find((id) => {
    const food = foodData[id];
    return food.name === normalizedFoodName
      || food.name.includes(normalizedFoodName)
      || normalizedFoodName.includes(food.name);
  });
}

function syncSelectedFoodFromInput() {
  const foodName = foodSearch.value.trim();
  selectedFood = foodName ? (findFoodIdByName(foodName) || "") : "";
  updateDisplay();
}

// 3. 表示更新
const foodSearch = document.getElementById("foodSearch");
const foodCandidatePanel = document.getElementById("foodCandidatePanel");
const foodCategoryTabs = document.getElementById("foodCategoryTabs");
const searchSubOptions = document.getElementById("searchSubOptions");
const searchResults = document.getElementById("searchResults");
const selectedFoodChip = document.getElementById("selectedFoodChip");
const selectedFoodChipText = document.getElementById("selectedFoodChipText");
const clearSelectedFood = document.getElementById("clearSelectedFood");
const ratingCards = document.querySelectorAll(".rating-card");
const canHoverSearchPanel = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function openFoodCandidatePanel() {
  if (!foodSearch.value.trim()) {
    searchPanelStep = "entry";
    activeFoodCategory = "";
    activePurposeTag = "";
    clearSearchPreview();
  }
  renderCategoryTabs();
  renderSearchResults();
  foodCandidatePanel.classList.add("open");
  foodCandidatePanel.setAttribute("aria-hidden", "false");
}

function closeFoodCandidatePanel() {
  foodCandidatePanel.classList.remove("open");
  foodCandidatePanel.setAttribute("aria-hidden", "true");
}

function clearSearchPreview() {
  previewPanelStep = "";
  previewFoodCategory = "";
  previewPurposeTag = "";
}

function getDisplayedPanelStep() {
  return previewPanelStep || searchPanelStep;
}

function getDisplayedFoodCategory() {
  return previewFoodCategory || activeFoodCategory;
}

function getDisplayedPurposeTag() {
  return previewPurposeTag || activePurposeTag;
}

function updateSelectedFoodChip(foodName) {
  if (!selectedFoodChip || !selectedFoodChipText) return;

  if (!foodName) {
    selectedFoodChip.hidden = true;
    selectedFoodChipText.textContent = "";
    return;
  }

  selectedFoodChipText.textContent = `選択中：${foodName}`;
  selectedFoodChip.hidden = false;
}

function resetFoodSelectionPanel() {
  foodSearch.value = "";
  selectedFood = "";
  searchPanelStep = "entry";
  activeFoodCategory = "";
  activePurposeTag = "";
  clearSearchPreview();
  updateSelectedFoodChip("");
  renderCategoryTabs();
  renderSearchResults();
  clearResultDisplay();
}

function updateDisplay() {
  const food = foodData[selectedFood];
  if (!food) {
    clearResultDisplay();
    return;
  }

  const data = food[selectedRating];

  // テキスト要素の更新
  document.getElementById("selectedFood").textContent = `選んだ食材：${food.emoji} ${food.name}`;
  document.getElementById("resultStatusIcon").textContent = data.icon || "";
  document.getElementById("pairTitle").textContent = data.pairTitle || "";
  document.getElementById("nutritionScore").textContent = data.nutritionScore || "-";
  document.getElementById("boostRate").textContent = data.boostRate || "-";
  document.getElementById("suggestion").textContent = data.suggestion || "";
  document.getElementById("reason").textContent = data.reason || "";
  document.getElementById("improvement").textContent = data.improvement || "";

  // ブーストタグの更新
  const boostTags = document.getElementById("boostTags");
  boostTags.innerHTML = "";
  data.boosts.forEach(b => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = b;
    boostTags.appendChild(span);
  });

  // ドレッシングリストの更新
  const dressingList = document.getElementById("dressingList");
  dressingList.innerHTML = "";
  data.dressings.forEach(d => {
    const li = document.createElement("li");
    li.textContent = d;
    dressingList.appendChild(li);
  });

  updateBoostMeter(data.boostRate);
  ratingCards.forEach(c => c.classList.toggle("active", c.dataset.rating === selectedRating));
}

function clearResultDisplay() {
  document.getElementById("selectedFood").textContent = "選んだ食材：未選択";
  document.getElementById("resultStatusIcon").textContent = "";
  document.getElementById("pairTitle").textContent = "食材を選んでください";
  document.getElementById("nutritionScore").textContent = "-";
  document.getElementById("boostRate").textContent = "-";
  document.getElementById("suggestion").textContent = "";
  document.getElementById("reason").textContent = "";
  document.getElementById("improvement").textContent = "";
  document.getElementById("boostTags").innerHTML = "";
  document.getElementById("dressingList").innerHTML = "";
  updateBoostMeter("+0%");
}

// メーター（ゲージ）の更新
function updateBoostMeter(boostRate) {
  const posBar = document.getElementById("boostMeterPositive");
  const negBar = document.getElementById("boostMeterNegative");
  if(!posBar || !negBar) return;
  
  const value = parseInt(boostRate.replace('%', ''));
  posBar.style.width = value > 0 ? (value / 20 * 50) + "%" : "0%";
  negBar.style.width = value < 0 ? (Math.abs(value) / 20 * 50) + "%" : "0%";
}

// 4. UI生成（検索結果の描画）
function renderSearchResults() {
  if (!searchResults) return;
  const query = foodSearch.value.trim();
  const displayedStep = getDisplayedPanelStep();

  searchResults.innerHTML = "";
  if (query) {
    renderFoodCandidateButtons(findMatchingFoods(query));
    return;
  }

  if (displayedStep === "entry") {
    const message = document.createElement("p");
    message.className = "search-message";
    message.textContent = canHoverSearchPanel ? "探し方にマウスを乗せてください。" : "探し方をタップしてください。";
    searchResults.appendChild(message);
    return;
  }

  if (displayedStep === "foodCategory") {
    const message = document.createElement("p");
    message.className = "search-message";
    message.textContent = canHoverSearchPanel ? "カテゴリにマウスを乗せると食材候補が出ます。" : "カテゴリをタップすると食材候補が出ます。";
    searchResults.appendChild(message);
    return;
  }

  if (displayedStep === "purposeTag") {
    const message = document.createElement("p");
    message.className = "search-message";
    message.textContent = canHoverSearchPanel ? "タグにマウスを乗せるとおすすめ食材が出ます。" : "タグをタップするとおすすめ食材が出ます。";
    searchResults.appendChild(message);
    return;
  }

  if (displayedStep === "foodCandidates") {
    const activeCategory = foodCategories.find((cat) => cat.id === getDisplayedFoodCategory());
    renderFoodCandidateButtons(activeCategory?.foods || []);
    return;
  }

  if (displayedStep === "purposeCandidates") {
    const activeTag = purposeNutrientTags.find((tag) => tag.id === getDisplayedPurposeTag());
    renderFoodCandidateButtons(activeTag?.foods || []);
  }
}

function renderFoodCandidateButtons(foodItems) {
  if (!foodItems.length) {
    const message = document.createElement("p");
    message.className = "no-result";
    message.textContent = "候補が見つかりませんでした。";
    searchResults.appendChild(message);
    return;
  }

  foodItems.forEach((foodItem) => {
    const foodKey = foodData[foodItem] ? foodItem : findFoodIdByName(foodItem);
    const foodName = foodData[foodKey]?.name || foodItem;
    const foodEmoji = foodData[foodKey]?.emoji || "";

    const btn = document.createElement("button");
    btn.className = "food-button search-result-button";
    if (foodKey && foodKey === selectedFood) btn.classList.add("active");
    btn.textContent = foodEmoji ? `${foodEmoji} ${foodName}` : foodName;
    btn.onclick = () => {
      foodSearch.value = foodName;
      selectedFood = foodKey || "";
      updateSelectedFoodChip(foodName);
      foodSearch.dispatchEvent(new Event("change", { bubbles: true }));
      updateDisplay();
      closeFoodCandidatePanel();
    };
    searchResults.appendChild(btn);
  });
}

function renderCategoryTabs() {
  if (!foodCategoryTabs) return;
  foodCategoryTabs.innerHTML = "";
  if (searchSubOptions) searchSubOptions.innerHTML = "";

  if (foodSearch.value.trim()) return;

  [
    { id: "foodCategory", name: "食材から探す" },
    { id: "purposeTag", name: "目的・栄養素から探す" },
  ].forEach((choice) => {
    const btn = document.createElement("button");
    const isActive = searchPanelStep === choice.id
      || (choice.id === "foodCategory" && searchPanelStep === "foodCandidates")
      || (choice.id === "purposeTag" && searchPanelStep === "purposeCandidates");
    const isPreview = !isActive && previewPanelStep === choice.id;

    btn.className = `food-category-tab search-mode-button ${isActive ? "active" : ""} ${isPreview ? "preview" : ""}`;
    btn.textContent = choice.name;

    const previewChoice = () => {
      if (searchPanelStep !== "entry") return;
      previewPanelStep = choice.id;
      previewFoodCategory = "";
      previewPurposeTag = "";
      foodCategoryTabs.querySelectorAll(".preview").forEach((item) => item.classList.remove("preview"));
      btn.classList.add("preview");
      renderSubOptions();
      renderSearchResults();
    };

    const fixChoice = () => {
      searchPanelStep = choice.id;
      activeFoodCategory = "";
      activePurposeTag = "";
      clearSearchPreview();
      renderCategoryTabs();
      renderSearchResults();
    };

    if (canHoverSearchPanel) btn.onmouseenter = previewChoice;
    btn.onclick = fixChoice;
    foodCategoryTabs.appendChild(btn);
  });

  renderSubOptions();
}

function renderSubOptions() {
  if (!searchSubOptions) return;
  searchSubOptions.innerHTML = "";

  const displayedStep = getDisplayedPanelStep();
  if (displayedStep === "entry") return;

  const isPurposeMode = displayedStep === "purposeTag" || displayedStep === "purposeCandidates";
  const controlItems = isPurposeMode
    ? purposeNutrientTags
    : foodCategories;

  controlItems.forEach((cat) => {
    const btn = document.createElement("button");
    const isActive = cat.id === activeFoodCategory || cat.id === activePurposeTag;
    const isPreview = !isActive && (cat.id === previewFoodCategory || cat.id === previewPurposeTag);
    btn.className = `food-category-tab ${isActive ? "active" : ""} ${isPreview ? "preview" : ""}`;
    btn.textContent = cat.name;

    const previewCandidates = () => {
      if (searchPanelStep === "foodCandidates" || searchPanelStep === "purposeCandidates") return;

      if (isPurposeMode) {
        previewPanelStep = "purposeCandidates";
        previewPurposeTag = cat.id;
        previewFoodCategory = "";
      } else {
        previewPanelStep = "foodCandidates";
        previewFoodCategory = cat.id;
        previewPurposeTag = "";
      }
      searchSubOptions.querySelectorAll(".preview").forEach((item) => item.classList.remove("preview"));
      btn.classList.add("preview");
      renderSearchResults();
    };

    const fixCandidates = () => {
      if (isPurposeMode) {
        activePurposeTag = cat.id;
        searchPanelStep = "purposeCandidates";
        activeFoodCategory = "";
      } else {
        activeFoodCategory = cat.id;
        searchPanelStep = "foodCandidates";
        activePurposeTag = "";
      }
      foodSearch.value = "";
      clearSearchPreview();
      renderCategoryTabs();
      renderSearchResults();
    };

    if (canHoverSearchPanel) btn.onmouseenter = previewCandidates;
    btn.onclick = fixCandidates;
    searchSubOptions.appendChild(btn);
  });
}

// イベントリスナーの設定
if (foodSearch) {
  foodSearch.onfocus = () => openFoodCandidatePanel();
  foodSearch.onclick = () => openFoodCandidatePanel();
  foodSearch.oninput = () => {
    searchPanelStep = "entry";
    activeFoodCategory = "";
    activePurposeTag = "";
    clearSearchPreview();
    syncSelectedFoodFromInput();
    updateSelectedFoodChip("");
    renderCategoryTabs();
    renderSearchResults();
  };
  foodSearch.onchange = () => syncSelectedFoodFromInput();
}

if (clearSelectedFood) {
  clearSelectedFood.onclick = () => {
    resetFoodSelectionPanel();
    openFoodCandidatePanel();
    foodSearch.focus();
  };
}

ratingCards.forEach((card) => {
  card.onclick = () => {
    selectedRating = card.dataset.rating;
    updateDisplay();
  };
});

// 初期実行
loadFoods();
