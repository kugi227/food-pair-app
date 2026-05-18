// プログラム全体で使うデータの名前を定義します
let foods = []; 

// static フォルダの直下を読みに行くように指定します
fetch('/static/foods.json') 
  .then(response => {
    if (!response.ok) throw new Error('ファイルが見つかりません');
    return response.json();
  })
  .then(data => {
    foods = data;
    console.log("読み込み成功！", foods);
  })
  .catch(error => console.error("読み込みエラー:", error));

let foodCatalog = {};
let foodData = {};
let allFoodData = {};
let searchResultFoodIds = [];
let selectedFood = ""; 
let selectedFoods = [];
let selectedRating = "excellent";

// カテゴリーは foods.json の category から自動生成する
let foodCategories = [];
const categoryLabels = {
  vegetable: "野菜",
  processed: "加工・発酵食品",
  meat: "肉",
  fish: "魚",
  fruit: "フルーツ",
  carbohydrate: "炭水化物",
  protein: "卵・たんぱく質",
  dairy: "乳製品・飲料",
  mushroom: "きのこ",
  seaweed: "海藻",
  seed: "ナッツ・種子",
  beverage: "飲み物",
  snack: "おやつ",
};
const categoryOrder = ["vegetable", "meat", "fish", "protein", "processed", "dairy", "carbohydrate", "mushroom", "seaweed", "seed", "fruit", "beverage", "snack"];
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
  "きのこ": "椎茸",
  "しいたけ": "椎茸",
  "くるみ": "胡桃（くるみ）",
  "まぐろ": "鮪（マグロ）",
  "ツナ": "鮪（マグロ）",
  "のり": "海苔",
  "ごま": "ゴマ",
  "なす": "なすび",
};

// 1. データの読み込みと変換
async function loadFoods(query = "") {
  try {
    const url = query ? `/foods?q=${encodeURIComponent(query)}` : "/foods";
    const response = await fetch(url); 
    const rawFoods = await response.json();

    foodCatalog = {};
    foodData = {};

    rawFoods.forEach((item) => {
      const id = item.id || item.food;

      foodCatalog[id] = { 
        label: item.food, 
        keywords: item.keywords || [] 
      };

      const foodIconText = item.emoji || "🥗";

      foodData[id] = {
        name: item.food,
        category: item.category || "",
        emoji: foodIconText,
        image: normalizeFoodImagePath(item.image),
        nutrients: item.nutrients || [],
        chart_data: item.chart_data || null,
        excellent: {
          icon: "◎",
          pairTitle: `${foodIconText}${item.food} × ${item.good_pairs[0]?.food || "バランス食"}`,
          nutritionScore: item.good_pairs[0] ? Math.round(100 * item.good_pairs[0].boost) : "100",
          boostRate: item.good_pairs[0] ? `+${Math.round((item.good_pairs[0].boost - 1) * 100)}%` : "+0%",
          suggestion: `${item.good_pairs[0]?.food || "をプラス"}`,
          reason: `${item.good_pairs[0]?.effect || ""}。${item.dressing_logic || ""}`,
          improvement: `おすすめ調理法：${item.best_methods?.join('、') || "加熱調理"}`,
          dressings: item.dressings ? item.dressings.map((d, i) => i === 0 ? `★${d} (栄養効率UP)` : d) : ["お好みの調味料"],
        },
        good: {
          icon: "○",
          pairTitle: (item.better_pairs && item.better_pairs.length > 0) ? `${foodIconText}${item.food} × ${item.better_pairs[0].food}` : `${foodIconText}${item.food} × 卵や野菜`,
          nutritionScore: (item.better_pairs && item.better_pairs.length > 0) ? Math.round(100 * item.better_pairs[0].boost) : "110",
          boostRate: (item.better_pairs && item.better_pairs.length > 0) ? `+${Math.round((item.better_pairs[0].boost - 1) * 100)}%` : "+10%",
          suggestion: (item.better_pairs && item.better_pairs.length > 0) ? `${item.better_pairs[0].food}をプラス` : "他の食材と組み合わせて彩りアップ",
          reason: `${(item.better_pairs && item.better_pairs.length > 0) ? item.better_pairs[0].effect : "栄養バランスが整います"}。${item.dressing_logic || ""}`,
          improvement: "彩りよく盛り付けてみましょう。",
          dressings: item.dressings ? item.dressings.map((d, i) => i === 1 ? `★${d}` : d) : ["お好みのドレッシング"],
        },
        improve: {
          icon: (item.bad_pairs && item.bad_pairs.length > 0) ? "⚠" : "△",
          pairTitle: (item.bad_pairs && item.bad_pairs.length > 0) ? `${foodIconText}${item.food} × ${item.bad_pairs[0].food}` : `${foodIconText}${item.food} 単体`,
          nutritionScore: (item.bad_pairs && item.bad_pairs.length > 0) ? "85" : "95",
          boostRate: (item.bad_pairs && item.bad_pairs.length > 0) ? "-15%" : "+0%",
          suggestion: (item.bad_pairs && item.bad_pairs.length > 0) ? "この組み合わせは避ける" : "油や酸味を足して吸収率アップ",
          reason: item.bad_pairs && item.bad_pairs.length > 0 ? item.bad_pairs[0].effect : "もっと効率よく栄養を摂れる方法があります。",
          improvement: "食べるタイミングや調理法を工夫してみましょう。",
          dressings: ["（なし）"]
        }
      };
    });

    if (!query) {
      allFoodData = { ...foodData };
      searchResultFoodIds = Object.keys(allFoodData);
      foodCategories = buildFoodCategoriesFromData(allFoodData);
    } else {
      searchResultFoodIds = rawFoods.map((item) => item.id || item.food);
      rawFoods.forEach((item) => {
        const id = item.id || item.food;
        allFoodData[id] = foodData[id];
      });
    }

    renderCategoryTabs();
    renderSearchResults();

  } catch (error) {
    console.error("データの読み込みエラー:", error);
  }
}

function buildFoodCategoriesFromData(sourceData) {
  const grouped = {};
  Object.entries(sourceData).forEach(([id, food]) => {
    const category = food.category || "other";
    if (!grouped[category]) {
      grouped[category] = { id: category, name: categoryLabels[category] || category, foods: [] };
    }
    grouped[category].foods.push(id);
  });

  return Object.values(grouped).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.id);
    const bIndex = categoryOrder.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name, "ja");
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

function findFoodIdByName(foodName) {
  const normalizedFoodName = normalizeFoodName(foodNameAliases[foodName] || foodName);
  const sourceData = Object.keys(allFoodData).length ? allFoodData : foodData;
  const exactMatch = Object.keys(sourceData).find((id) => normalizeFoodName(sourceData[id].name) === normalizedFoodName);
  if (exactMatch) return exactMatch;
  return Object.keys(sourceData).find((id) => {
    const normalizedName = normalizeFoodName(sourceData[id].name);
    return normalizedName.includes(normalizedFoodName) || normalizedFoodName.includes(normalizedName);
  });
}

function normalizeFoodName(foodName) {
  return String(foodName || "").trim().toLowerCase().replace(/\s+/g, "").replace(/[（）()]/g, "");
}

function normalizeFoodImagePath(imagePath) {
  const path = String(imagePath || "").trim().replace(/\\/g, "/");
  return path.startsWith("/static/icons/") && path.toLowerCase().endsWith(".png") ? path : "";
}

function syncSelectedFoodFromInput() {
  const foodName = foodSearch.value.trim();
  const foodKey = foodName ? (findFoodIdByName(foodName) || "") : "";
  selectedFood = foodKey;
  if (foodName && foodKey) addSelectedFood(foodKey, (allFoodData[foodKey] || foodData[foodKey])?.name || foodName);
  updateDisplay(foodKey, getCurrentRankIndex());
}

// 2. UI要素の取得と検索パネル制御
const foodSearch = document.getElementById("foodSearch");
const foodCandidatePanel = document.getElementById("foodCandidatePanel");
const foodCategoryTabs = document.getElementById("foodCategoryTabs");
const searchSubOptions = document.getElementById("searchSubOptions");
const searchResults = document.getElementById("searchResults");
const selectedFoodChip = document.getElementById("selectedFoodChip");
const selectedFoodChipText = document.getElementById("selectedFoodChipText");
const clearSelectedFood = document.getElementById("clearSelectedFood");
const foodSearchWrapper = document.getElementById("foodSearchWrapper");
const resultContainer = document.getElementById("resultContainer");
const canHoverSearchPanel = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

var volumeSliderEl = document.getElementById("volumeSlider");
var vegSliderEl = document.getElementById("vegSlider");
var condimentSliderEl = document.getElementById("condimentSlider");

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

function getDisplayedPanelStep() { return previewPanelStep || searchPanelStep; }
function getDisplayedPurposeTag() { return previewPurposeTag || activePurposeTag; }
function splitFoodNames(foodNames) { return Array.isArray(foodNames) ? foodNames : String(foodNames || "").split(/[、,]/).map(n => n.trim()).filter(Boolean); }
function dedupeFoodNames(foodNames) { return [...new Set(splitFoodNames(foodNames))]; }

function dedupeSelectedFoods() {
  const seen = new Set();
  selectedFoods = selectedFoods.filter((food) => {
    const key = food.id || food.name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// メディア(絵文字・画像)生成ヘルパー
function createFoodMedia(food, className = "food-inline-image") {
  if (food?.image) {
    const img = document.createElement("img");
    img.className = className; img.src = food.image; img.alt = food.name || "食材"; img.loading = "lazy";
    img.onerror = () => {
      const fallback = document.createElement("span");
      fallback.className = className === "food-image-display" ? "food-emoji-display" : "food-inline-emoji";
      fallback.textContent = food.emoji || "🥗"; img.replaceWith(fallback);
    };
    return img;
  }
  const span = document.createElement("span");
  span.className = className === "food-image-display" ? "food-emoji-display" : "food-inline-emoji";
  span.textContent = food?.emoji || "🥗";
  return span;
}

function renderFoodMedia(target, food, className = "food-inline-image") { if (!target) return; target.textContent = ""; target.appendChild(createFoodMedia(food, className)); }
function appendFoodLabel(target, food) { target.appendChild(createFoodMedia(food)); target.append(` ${food.name}`); }

function addSelectedFood(foodKey, foodName) {
  const selectedFoodData = allFoodData[foodKey] || foodData[foodKey];
  const name = String(foodName || selectedFoodData?.name || "").trim(); if (!name) return;
  const id = foodKey || findFoodIdByName(name) || name; dedupeSelectedFoods();
  if (!selectedFoods.some((food) => food.id === id || food.name === name)) {
    selectedFoods.push({ id, name, emoji: selectedFoodData?.emoji || "", image: selectedFoodData?.image || "", data: selectedFoodData || null });
  }
  dedupeSelectedFoods(); updateSelectedFoodChip();
}

function updateSelectedFoodChip(foodName) {
  if (!selectedFoodChip || !selectedFoodChipText) return;
  const displayNames = foodName ? dedupeFoodNames(foodName) : dedupeFoodNames(selectedFoods.map((food) => food.name));
  if (!displayNames.length) { selectedFoodChip.hidden = true; selectedFoodChipText.textContent = ""; return; }
  selectedFoodChipText.textContent = "選択中：";
  if (!foodName && selectedFoods.length) {
    selectedFoods.forEach((food, index) => { if (index > 0) selectedFoodChipText.append("、"); appendFoodLabel(selectedFoodChipText, food.data || food); });
  } else { selectedFoodChipText.append(displayNames.join("、")); }
  selectedFoodChip.hidden = false;
}

function formatPairPart(part, food) { const trimmedPart = String(part || "").trim(); const iconAndName = `${food.emoji || ""}${food.name || ""}`; return (food.emoji && food.name && trimmedPart === iconAndName) ? `${food.emoji} ${food.name}` : trimmedPart; }

function normalizePairTitle(pairTitle, food) {
  const parts = String(pairTitle || "").split("×").map(p => p.trim()).filter(Boolean);
  if (!parts.length) return food.emoji && food.name ? `${food.emoji} ${food.name}` : "おすすめ食材";
  const selectedName = food.name || ""; const hasIconSelectedPart = selectedName && parts.some((part) => part.includes(selectedName) && part !== selectedName); const seenNames = new Set();
  return parts.filter(p => !(hasIconSelectedPart && p === selectedName)).filter(p => { const k = selectedName && p.includes(selectedName) ? selectedName : p; if (seenNames.has(k)) return false; seenNames.add(k); return true; }).map(p => formatPairPart(p, food)).join(" × ");
}

function renderPairTitle(target, pairTitle, food) {
  if (!target) return; const parts = String(pairTitle || "").split("×").map(p => p.trim()).filter(Boolean); target.textContent = "";
  parts.forEach((part, index) => { if (index > 0) target.append(" × "); if (food.image && food.name && part.includes(food.name)) { appendFoodLabel(target, food); } else { target.append(part); } });
}

function resetFoodSelectionPanel() {
  foodSearch.value = ""; selectedFood = ""; selectedFoods = []; currentFoodId = ""; searchPanelStep = "entry"; activeFoodCategory = ""; activePurposeTag = ""; clearSearchPreview(); updateSelectedFoodChip(""); renderCategoryTabs(); renderSearchResults(); clearResultDisplay(); applyRankTheme(0); closeFoodCandidatePanel(); if (resultContainer) resultContainer.hidden = true;
}

// ----------------------------------------------------
// 3. 【コアロジック】表示更新・テーマ適用・API連携（統合版）
// ----------------------------------------------------
let currentFoodId = ""; 
const rankThemes = [
  { key: "excellent", label: "最強", icon: "◎", mainColor: "#f1c40f", chartBg: "rgba(241, 196, 15, 0.35)" },
  { key: "good", label: "良好", icon: "○", mainColor: "#e74c3c", chartBg: "rgba(231, 76, 60, 0.22)" },
  { key: "improve", label: "普通", icon: "△", mainColor: "#3498db", chartBg: "rgba(52, 152, 219, 0.22)" },
];

function applyRankTheme(rankIndex) {
  const theme = rankThemes[rankIndex] || rankThemes[0];
  const logicBox = document.getElementById("logicBox");
  const cardTitle = document.getElementById("cardTitle");
  const statusIcon = document.getElementById("resultStatusIcon");
  const bestLogicArea = document.getElementById("bestLogicArea");

  if (logicBox) {
    logicBox.classList.remove("rank-excellent", "rank-good", "rank-improve", "logic-gold");
    logicBox.classList.add(`rank-${theme.key}`);
  }
  if (cardTitle) cardTitle.textContent = `栄養の組み合わせ：${theme.label}`;
  if (statusIcon) statusIcon.textContent = theme.icon;
  if (bestLogicArea) bestLogicArea.hidden = rankIndex !== 0;

  document.querySelectorAll(".pair-tabs .rating-btn").forEach((btn, index) => {
    btn.classList.toggle("active", index === parseInt(rankIndex));
  });
  return theme;
}

// テキスト情報の描画と、裏側計算(fetch)を同時に行う統合関数
function updateDisplay(foodId, rankIndex = 0) {
  if (!foodId) return;
  currentFoodId = foodId; 
  if (resultContainer) resultContainer.hidden = false;

  const food = allFoodData[foodId] || foodData[foodId]; 
  if (!food) return;

  const targetData = rankIndex === 0 ? food.excellent : (rankIndex === 1 ? food.good : food.improve);
  const activeTheme = applyRankTheme(rankIndex);
  if (!targetData) return;

  const displayPairTitle = normalizePairTitle(targetData.pairTitle, food);

  if (document.getElementById("pairTitle")) renderPairTitle(document.getElementById("pairTitle"), displayPairTitle, food);
  if (document.getElementById("suggestion")) document.getElementById("suggestion").textContent = targetData.suggestion || "";
  if (document.getElementById("reason")) document.getElementById("reason").textContent = targetData.reason || "";
  if (document.getElementById("improvement")) document.getElementById("improvement").textContent = targetData.improvement || "";

  const foodEmojiDisplay = document.getElementById("foodEmojiDisplay");
  if (foodEmojiDisplay) renderFoodMedia(foodEmojiDisplay, food, "food-image-display");

  const foodNameLabel = document.getElementById("foodNameLabel");
  if (foodNameLabel) foodNameLabel.textContent = `食材：${food.name}`;
    
  const bestMethodTitle = document.getElementById("bestMethodTitle");
  if (bestMethodTitle) renderPairTitle(bestMethodTitle, displayPairTitle, food);

  const scientificEvidence = document.getElementById("scientificEvidence");
  if (scientificEvidence) scientificEvidence.textContent = targetData.reason || "";

  const dList = document.getElementById("dressingList");
  if (dList) {
    if (food.dressings && Array.isArray(food.dressings)) {
      dList.innerHTML = food.dressings.map(d => `<li>${d}</li>`).join("");
    } else {
      dList.innerHTML = "<li>おすすめの味付け：塩・オリーブオイルなど</li>"; 
    }
  }

  // 自動的にリアルタイム計算を呼び出す
  fetchCalculatedScore();
}

// サーバー(Python)に現在の条件を送り、スコアとグラフデータを更新する関数
async function fetchCalculatedScore() {
  if (!currentFoodId) return;

  const activeBtn = document.querySelector(".pair-tabs .rating-btn.active");
  const rankIndex = activeBtn ? parseInt(activeBtn.dataset.rank) : 0;
  
  const modes = ["best", "standard", "single"];
  const currentRank = modes[rankIndex] || "best";

  const portion = volumeSliderEl ? volumeSliderEl.value : 1;
  const vegPortion = vegSliderEl ? vegSliderEl.value : 1;
  
  let dressing = "なし";
  if (condimentSliderEl) {
    const names = ["なし", "オリーブオイル", "醤油", "マヨネーズ"];
    dressing = names[condimentSliderEl.value] || "なし";
  }

  try {
    const response = await fetch(`/calculate?food=${encodeURIComponent(currentFoodId)}&rank=${currentRank}&portion=${portion}&veg_portion=${vegPortion}&dressing=${encodeURIComponent(dressing)}`);
    if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);

    const result = await response.json();

    if (result.success) {
      if (document.getElementById("nutritionScore")) document.getElementById("nutritionScore").textContent = result.nutritionScore;
      if (document.getElementById("boostRate")) document.getElementById("boostRate").textContent = result.boostRate;

      // 📊 Chart.js の描画・更新処理
      const chartValues = [
        result.chart_data["栄養"] || 0,
        result.chart_data["吸収"] || 0,
        result.chart_data["脂質"] || 0,
        result.chart_data["酵素"] || 0,
        result.chart_data["抗酸化"] || 0
      ];

      const activeTheme = rankThemes[rankIndex] || rankThemes[0];
      let chartStatus = Chart.getChart("radarChart");

      if (chartStatus !== undefined) {
        chartStatus.data.datasets[0].data = chartValues;
        chartStatus.data.datasets[0].backgroundColor = activeTheme.chartBg;
        chartStatus.data.datasets[0].borderColor = activeTheme.mainColor;
        chartStatus.data.datasets[0].pointBackgroundColor = activeTheme.mainColor;
        chartStatus.update(); 
      } else {
        const ctx = document.getElementById('radarChart').getContext('2d');
        new Chart(ctx, {
          type: 'radar',
          data: {
            labels: ['栄養', '吸収', '脂質', '酵素', '抗酸化'],
            datasets: [{ data: chartValues, backgroundColor: activeTheme.chartBg, borderColor: activeTheme.mainColor, borderWidth: 3, pointBackgroundColor: activeTheme.mainColor }]
          },
          options: {
            scales: { r: { min: 0, max: 100, ticks: { display: false, stepSize: 20 }, pointLabels: { font: { size: 12, weight: 'bold' } } } },
            plugins: { legend: { display: false } }
          }
        });
      }
    }
  } catch (error) {
    console.error("リアルタイム計算エラー:", error);
  }
}

function clearResultDisplay() {
  if(document.getElementById("resultStatusIcon")) document.getElementById("resultStatusIcon").textContent = "";
  if(document.getElementById("pairTitle")) document.getElementById("pairTitle").textContent = "食材を選んでください";
  if(document.getElementById("nutritionScore")) document.getElementById("nutritionScore").textContent = "-";
  if(document.getElementById("boostRate")) document.getElementById("boostRate").textContent = "-";
  if(document.getElementById("suggestion")) document.getElementById("suggestion").textContent = "";
  if(document.getElementById("reason")) document.getElementById("reason").textContent = "";
  if(document.getElementById("improvement")) document.getElementById("improvement").textContent = "";
  if(document.getElementById("dressingList")) document.getElementById("dressingList").innerHTML = "";
}

// 4. UI生成・検索結果・タブイベント
function renderSearchResults() {
  if (!searchResults) return;
  const query = foodSearch.value.trim(); const displayedStep = getDisplayedPanelStep();
  searchResults.innerHTML = "";

  if (query) { renderFoodCandidateButtons(searchResultFoodIds); return; }
  if (displayedStep === "entry") { searchResults.innerHTML = `<p class="search-message">${canHoverSearchPanel ? "探し方にマウスを乗せてください。" : "探し方をタップしてください。"}</p>`; return; }
  if (displayedStep === "foodCategory") { searchResults.innerHTML = `<p class="search-message">${canHoverSearchPanel ? "カテゴリにマウスを乗せると食材候補が出ます。" : "カテゴリをタップすると食材候補が出ます。"}</p>`; return; }
  if (displayedStep === "purposeTag") { searchResults.innerHTML = `<p class="search-message">${canHoverSearchPanel ? "タグにマウスを乗せるとおすすめ食材が出ます。" : "タグをタップするとおすすめ食材が出ます。"}</p>`; return; }
  if (displayedStep === "foodCandidates") { const cat = foodCategories.find(c => c.id === (previewFoodCategory || activeFoodCategory)); renderFoodCandidateButtons(cat?.foods || []); return; }
  if (displayedStep === "purposeCandidates") { const tag = purposeNutrientTags.find(t => t.id === (previewPurposeTag || activePurposeTag)); renderFoodCandidateButtons(tag?.foods || []); }
}

function renderFoodCandidateButtons(foodItems) {
  if (!foodItems.length) { searchResults.innerHTML = '<p class="no-result">候補が見つかりませんでした。</p>'; return; }
  foodItems.forEach((item) => {
    const foodKey = (allFoodData[item] || foodData[item]) ? item : findFoodIdByName(item);
    const candidateFood = allFoodData[foodKey] || foodData[foodKey]; if (!foodKey || !candidateFood) return;

    const btn = document.createElement("button");
    btn.className = `food-button search-result-button ${foodKey === selectedFood ? "active" : ""}`;
    appendFoodLabel(btn, candidateFood);
    btn.onclick = (e) => {
      e.stopPropagation(); foodSearch.value = candidateFood.name; selectedFood = foodKey;
      addSelectedFood(foodKey, candidateFood.name); closeFoodCandidatePanel();
      updateDisplay(foodKey, 0); 
    };
    searchResults.appendChild(btn);
  });
}

function renderCategoryTabs() {
  if (!foodCategoryTabs) return; foodCategoryTabs.innerHTML = ""; if (searchSubOptions) searchSubOptions.innerHTML = "";
  if (foodSearch.value.trim()) return;

  [{ id: "foodCategory", name: "食材から探す" }, { id: "purposeTag", name: "目的・栄養素から探す" }].forEach((choice) => {
    const btn = document.createElement("button");
    const isActive = searchPanelStep === choice.id || (choice.id === "foodCategory" && searchPanelStep === "foodCandidates") || (choice.id === "purposeTag" && searchPanelStep === "purposeCandidates");
    btn.className = `food-category-tab search-mode-button ${isActive ? "active" : ""} ${(!isActive && previewPanelStep === choice.id) ? "preview" : ""}`;
    btn.textContent = choice.name;

    if (canHoverSearchPanel) {
      btn.onmouseenter = () => { if (searchPanelStep !== "entry") return; previewPanelStep = choice.id; renderSubOptions(); renderSearchResults(); };
    }
    btn.onclick = () => { searchPanelStep = choice.id; activeFoodCategory = ""; activePurposeTag = ""; clearSearchPreview(); renderCategoryTabs(); renderSearchResults(); };
    foodCategoryTabs.appendChild(btn);
  });
  renderSubOptions();
}

function renderSubOptions() {
  if (!searchSubOptions) return; searchSubOptions.innerHTML = "";
  const displayedStep = getDisplayedPanelStep(); if (displayedStep === "entry") return;
  const isPurposeMode = displayedStep === "purposeTag" || displayedStep === "purposeCandidates";

  (isPurposeMode ? purposeNutrientTags : foodCategories).forEach((cat) => {
    const btn = document.createElement("button");
    const isActive = cat.id === activeFoodCategory || cat.id === activePurposeTag;
    btn.className = `food-category-tab ${isActive ? "active" : ""} ${(!isActive && (cat.id === previewFoodCategory || cat.id === previewPurposeTag)) ? "preview" : ""}`;
    btn.textContent = cat.name;

    if (canHoverSearchPanel) {
      btn.onmouseenter = () => {
        if (searchPanelStep === "foodCandidates" || searchPanelStep === "purposeCandidates") return;
        if (isPurposeMode) { previewPanelStep = "purposeCandidates"; previewPurposeTag = cat.id; }
        else { previewPanelStep = "foodCandidates"; previewFoodCategory = cat.id; }
        renderSearchResults();
      };
    }
    btn.onclick = () => {
      if (isPurposeMode) { activePurposeTag = cat.id; searchPanelStep = "purposeCandidates"; }
      else { activeFoodCategory = cat.id; searchPanelStep = "foodCandidates"; }
      clearSearchPreview(); renderCategoryTabs(); renderSearchResults();
    };
    searchSubOptions.appendChild(btn);
  });
}

function getCurrentRankIndex() {
  const activeBtn = document.querySelector(".pair-tabs .rating-btn.active");
  return activeBtn ? parseInt(activeBtn.dataset.rank) : 0;
}

// ----------------------------------------------------
// 5. イベントリスナー・初期化のセットアップ
// ----------------------------------------------------
function setupSliderEvents() {
  if (volumeSliderEl) {
    volumeSliderEl.addEventListener("input", () => {
      const valEl = document.getElementById("volumeSliderValue");
      if (valEl) valEl.textContent = `${volumeSliderEl.value}倍`;
      fetchCalculatedScore();
    });
  }
  if (vegSliderEl) {
    vegSliderEl.addEventListener("input", () => {
      const valEl = document.getElementById("vegSliderValue");
      const labels = ["", "通常", "2倍", "3倍山盛り!"];
      if (valEl) valEl.textContent = labels[vegSliderEl.value];
      fetchCalculatedScore();
    });
  }
  if (condimentSliderEl) {
    condimentSliderEl.addEventListener("input", () => {
      const valEl = document.getElementById("condimentSliderValue");
      const names = ["なし", "オリーブオイル", "醤油", "マヨネーズ"];
      if (valEl) valEl.textContent = names[condimentSliderEl.value];
      fetchCalculatedScore();
    });
  }

  // ◎○△タブの切り替え
  document.querySelectorAll(".pair-tabs .rating-btn").forEach((btn) => {
    btn.onclick = () => {
      if (currentFoodId) {
        const rank = parseInt(btn.dataset.rank);
        updateDisplay(currentFoodId, rank);
      }
    };
  });
}

if (foodSearch) {
  foodSearch.onfocus = () => openFoodCandidatePanel();
  foodSearch.onclick = (e) => { e.stopPropagation(); openFoodCandidatePanel(); };
  foodSearch.oninput = async () => {
    searchPanelStep = "entry"; activeFoodCategory = ""; activePurposeTag = ""; clearSearchPreview();
    await loadFoods(foodSearch.value.trim()); syncSelectedFoodFromInput(); renderCategoryTabs(); renderSearchResults();
  };
  foodSearch.onchange = () => syncSelectedFoodFromInput();
}

if (clearSelectedFood) {
  clearSelectedFood.onclick = (e) => {
    e.preventDefault(); e.stopPropagation(); resetFoodSelectionPanel();
    if (foodSearch) { foodSearch.value = ""; foodSearch.placeholder = "クリックして食材を選ぶ"; foodSearch.blur(); }
  };
}

// 起動
loadFoods();
setupSliderEvents();
if (resultContainer) resultContainer.hidden = true;