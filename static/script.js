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
  dairy: "乳製品・飲料",
  mushroom: "きのこ",
  seaweed: "海藻",
  seed: "ナッツ・種子",
  beverage: "飲み物",
  snack: "おやつ",
};
const categoryOrder = ["vegetable", "meat", "fish", "processed", "dairy", "mushroom", "seaweed", "seed", "fruit", "beverage", "snack"];
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

// 1. データの読み込みと変換（検索キーワード対応版）
async function loadFoods(query = "") {
  try {
    // 検索ワードがある場合はクエリパラメータを付与してリクエスト
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
        excellent: {
          icon: "◎",
          pairTitle: `${foodIconText}${item.food} × ${item.good_pairs[0]?.food || "バランス食"}`,
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
            ? `${foodIconText}${item.food} × ${item.better_pairs[0].food}`
            : `${foodIconText}${item.food} × 卵や野菜`,
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
            ? `${foodIconText}${item.food} × ${item.bad_pairs[0].food}`
            : `${foodIconText}${item.food} 単体`,
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
    updateDisplay();

  } catch (error) {
    console.error("データの読み込みエラー:", error);
  }
}

// 2. 検索ロジック（サーバー側の検索結果を表示する形に変更）
function buildFoodCategoriesFromData(sourceData) {
  const grouped = {};

  Object.entries(sourceData).forEach(([id, food]) => {
    const category = food.category || "other";
    if (!grouped[category]) {
      grouped[category] = {
        id: category,
        name: categoryLabels[category] || category,
        foods: [],
      };
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

  const exactMatch = Object.keys(sourceData).find((id) => {
    const food = sourceData[id];
    return normalizeFoodName(food.name) === normalizedFoodName;
  });
  if (exactMatch) return exactMatch;

  return Object.keys(sourceData).find((id) => {
    const food = sourceData[id];
    const normalizedName = normalizeFoodName(food.name);
    return normalizedName.includes(normalizedFoodName)
      || normalizedFoodName.includes(normalizedName);
  });
}

function normalizeFoodName(foodName) {
  return String(foodName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[（）()]/g, "");
}

function normalizeFoodImagePath(imagePath) {
  const path = String(imagePath || "").trim().replace(/\\/g, "/");
  return path.startsWith("/static/icons/") && path.toLowerCase().endsWith(".png")
    ? path
    : "";
}

function syncSelectedFoodFromInput() {
  const foodName = foodSearch.value.trim();
  const foodKey = foodName ? (findFoodIdByName(foodName) || "") : "";
  selectedFood = foodKey;
  if (foodName && foodKey) addSelectedFood(foodKey, (allFoodData[foodKey] || foodData[foodKey])?.name || foodName);
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
const foodSearchWrapper = document.getElementById("foodSearchWrapper");
const resultContainer = document.getElementById("resultContainer");
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

function splitFoodNames(foodNames) {
  if (Array.isArray(foodNames)) return foodNames;
  return String(foodNames || "")
    .split(/[、,]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function dedupeFoodNames(foodNames) {
  return [...new Set(splitFoodNames(foodNames))];
}

function dedupeSelectedFoods() {
  const seen = new Set();
  selectedFoods = selectedFoods.filter((food) => {
    const key = food.id || food.name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createFoodMedia(food, className = "food-inline-image") {
  if (food?.image) {
    const img = document.createElement("img");
    img.className = className;
    img.src = food.image;
    img.alt = food.name || "食材";
    img.loading = "lazy";
    img.onerror = () => {
      const fallback = document.createElement("span");
      fallback.className = className === "food-image-display" ? "food-emoji-display" : "food-inline-emoji";
      fallback.textContent = food.emoji || "🥗";
      img.replaceWith(fallback);
    };
    return img;
  }

  const span = document.createElement("span");
  span.className = className === "food-image-display" ? "food-emoji-display" : "food-inline-emoji";
  span.textContent = food?.emoji || "🥗";
  return span;
}

function renderFoodMedia(target, food, className = "food-inline-image") {
  if (!target) return;
  target.textContent = "";
  target.appendChild(createFoodMedia(food, className));
}

function renderFoodLabel(target, food) {
  if (!target) return;
  target.textContent = "";
  appendFoodLabel(target, food);
}

function appendFoodLabel(target, food) {
  target.appendChild(createFoodMedia(food));
  target.append(` ${food.name}`);
}

function addSelectedFood(foodKey, foodName) {
  const selectedFoodData = allFoodData[foodKey] || foodData[foodKey];
  const name = String(foodName || selectedFoodData?.name || "").trim();
  if (!name) return;

  const id = foodKey || findFoodIdByName(name) || name;
  dedupeSelectedFoods();

  if (!selectedFoods.some((food) => food.id === id || food.name === name)) {
    selectedFoods.push({
      id,
      name,
      emoji: selectedFoodData?.emoji || "",
      image: selectedFoodData?.image || "",
      data: selectedFoodData || null,
    });
  }

  dedupeSelectedFoods();
  updateSelectedFoodChip();
}

function updateSelectedFoodChip(foodName) {
  if (!selectedFoodChip || !selectedFoodChipText) return;

  const displayNames = foodName
    ? dedupeFoodNames(foodName)
    : dedupeFoodNames(selectedFoods.map((food) => food.name));

  if (!displayNames.length) {
    selectedFoodChip.hidden = true;
    selectedFoodChipText.textContent = "";
    return;
  }

  selectedFoodChipText.textContent = "選択中：";
  if (!foodName && selectedFoods.length) {
    selectedFoods.forEach((food, index) => {
      if (index > 0) selectedFoodChipText.append("、");
      appendFoodLabel(selectedFoodChipText, food.data || food);
    });
  } else {
    selectedFoodChipText.append(displayNames.join("、"));
  }
  selectedFoodChip.hidden = false;
}

function formatPairPart(part, food) {
  const trimmedPart = String(part || "").trim();
  const iconAndName = `${food.emoji || ""}${food.name || ""}`;

  if (food.emoji && food.name && trimmedPart === iconAndName) {
    return `${food.emoji} ${food.name}`;
  }

  return trimmedPart;
}

function normalizePairTitle(pairTitle, food) {
  const parts = String(pairTitle || "")
    .split("×")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return food.emoji && food.name ? `${food.emoji} ${food.name}` : "おすすめ食材";
  }

  const selectedName = food.name || "";
  const hasIconSelectedPart = selectedName
    && parts.some((part) => part.includes(selectedName) && part !== selectedName);
  const seenNames = new Set();

  return parts
    .filter((part) => !(hasIconSelectedPart && part === selectedName))
    .filter((part) => {
      const nameKey = selectedName && part.includes(selectedName) ? selectedName : part;
      if (seenNames.has(nameKey)) return false;
      seenNames.add(nameKey);
      return true;
    })
    .map((part) => formatPairPart(part, food))
    .join(" × ");
}

function renderPairTitle(target, pairTitle, food) {
  if (!target) return;
  const parts = String(pairTitle || "")
    .split("×")
    .map((part) => part.trim())
    .filter(Boolean);

  target.textContent = "";

  parts.forEach((part, index) => {
    if (index > 0) target.append(" × ");

    if (food.image && food.name && part.includes(food.name)) {
      appendFoodLabel(target, food);
    } else {
      target.append(part);
    }
  });
}

function resetFoodSelectionPanel() {
  foodSearch.value = "";
  selectedFood = "";
  selectedFoods = [];
  currentFoodId = "";
  searchPanelStep = "entry";
  activeFoodCategory = "";
  activePurposeTag = "";
  clearSearchPreview();
  updateSelectedFoodChip("");
  renderCategoryTabs();
  renderSearchResults();
  clearResultDisplay();
  applyRankTheme(0);
  closeFoodCandidatePanel();
  if (resultContainer) resultContainer.hidden = true;
}

let currentFoodId = ""; // 今選んでいる食材を保存する変数（関数の外に書いてください）
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

  document.querySelectorAll(".rating-btn").forEach((btn, index) => {
    btn.classList.toggle("active", index === rankIndex);
  });

  return theme;
}


  function updateDisplay(foodId, rankIndex = 0) { // pairIndex を rankIndex に変更
    if (!foodId) return;
    currentFoodId = foodId; 
    if (resultContainer) resultContainer.hidden = false;

    // foodData という変数を使っている場合はこちらの方が確実です
    const food = allFoodData[foodId] || foodData[foodId]; 
    if (!food) {
        console.error("食材データが見つかりません:", foodId);
        return;
    }

    const selectedFoodEl = document.getElementById("selectedFood");
    if (selectedFoodEl) {
        selectedFoodEl.textContent = "選んだ食材：";
        appendFoodLabel(selectedFoodEl, food);
    }

    // 名前を rankIndex に揃えたので、これで正しくデータが取り出せます！
    const targetData = rankIndex === 0 ? food.excellent : (rankIndex === 1 ? food.good : food.improve);
    const activeTheme = applyRankTheme(rankIndex);
    if (!targetData) return;
    const displayPairTitle = normalizePairTitle(targetData.pairTitle, food);

  // 各項目を targetData から取得して表示
  if (document.getElementById("pairTitle")) 
    renderPairTitle(document.getElementById("pairTitle"), displayPairTitle, food);
  // targetData が存在することを確認してから中身を書き換える
if (targetData) {
    if (document.getElementById("nutritionScore")) {
        document.getElementById("nutritionScore").textContent = targetData.nutritionScore || "-";
    }
    
    if (document.getElementById("boostRate")) {
        document.getElementById("boostRate").textContent = targetData.boostRate || "-";
    }

    if (document.getElementById("suggestion")) {
        document.getElementById("suggestion").textContent = targetData.suggestion || "";
    }
}
  if (document.getElementById("reason"))
    document.getElementById("reason").textContent = targetData.reason || "";

  if (document.getElementById("improvement"))
    document.getElementById("improvement").textContent = targetData.improvement || "";

    // 2. 表示するペア（◎、○、△）を特定する
    // good_pairs(◎), better_pairs(○), bad_pairs(△) の順でひとまとめにする
    const allPairs = [
        ...(food.good_pairs || []),
        ...(food.better_pairs || []),
        ...(food.bad_pairs || [])
    ];
    
   // 以前の allPairs を使うのをやめて、さっき作った targetData を直接使います
  // スコアの計算（targetDataの中にスコアが入っているならそれを使う）
  const score = targetData.nutritionScore || "-"; 

  // ボタン（◎○△）のクリックイベントを最新の状態に更新
  const ratingButtons = document.querySelectorAll(".rating-btn"); 
  ratingButtons.forEach((btn, index) => {
    btn.onclick = () => {
      // ボタンを押した時に、そのランク(index)で自分自身を再表示する
      updateDisplay(foodId, index);
    };
  });

    // 3. テキストデータの流し込み
    const foodEmojiDisplay = document.getElementById("foodEmojiDisplay");
    if (foodEmojiDisplay) renderFoodMedia(foodEmojiDisplay, food, "food-image-display");

    const foodNameLabel = document.getElementById("foodNameLabel");
    if (foodNameLabel) foodNameLabel.textContent = `食材：${food.name}`;

    // score は targetData から取得
    const nutritionScoreEl = document.getElementById("nutritionScore");
    if (nutritionScoreEl) nutritionScoreEl.textContent = targetData.nutritionScore || "-";

    const boostRateEl = document.getElementById("boostRate");
    if (boostRateEl) boostRateEl.textContent = targetData.boostRate || "-";
    
    // ペアの相手の名前を表示
    const bestMethodTitle = document.getElementById("bestMethodTitle");
    if (bestMethodTitle) renderPairTitle(bestMethodTitle, displayPairTitle, food);

    // ロジック（理由・改善点）の表示
    const scientificEvidence = document.getElementById("scientificEvidence");
    if (scientificEvidence) scientificEvidence.textContent = targetData.reason || "";

    const reasonEl = document.getElementById("reason");
    if (reasonEl) reasonEl.textContent = targetData.reason || "";

    const improvementEl = document.getElementById("improvement");
    if (improvementEl) improvementEl.textContent = targetData.suggestion || "";

    // 【修正後】342行目付近
const dList = document.getElementById("dressingList");
if (dList) {
    // food.dressings が存在する場合だけ map を実行し、ない場合は空にする
    if (food.dressings && Array.isArray(food.dressings)) {
        dList.innerHTML = food.dressings.map(d => `<li>${d}</li>`).join("");
    } else {
        dList.innerHTML = "<li>おすすめの味付け：塩・オリーブオイルなど</li>"; 
    }
}
    // 5. チャート描画（既存のグラフを壊してから新しく作る）
    const ctx = document.getElementById('radarChart').getContext('2d');
    let chartStatus = Chart.getChart("radarChart"); 
    if (chartStatus !== undefined) {
        chartStatus.destroy();
    }

    // 【修正後】エラーを回避しつつ、チャート用の数値を設定
const chartValues = [
    (food.chart_data && food.chart_data["栄養"]) || 80,
    (food.chart_data && food.chart_data["吸収"]) || 90,
    (food.chart_data && food.chart_data["脂質"]) || 50,
    (food.chart_data && food.chart_data["酵素"]) || 60,
    (food.chart_data && (food.chart_data["抗酸化"] || food.chart_data["糖質"])) || 70
];

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['栄養', '吸収', '脂質', '酵素', '抗酸化'],
            datasets: [{
                data: chartValues,
                backgroundColor: activeTheme.chartBg,
                borderColor: activeTheme.mainColor,
                borderWidth: 3,
                pointBackgroundColor: activeTheme.mainColor
            }]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: { display: false, stepSize: 20 },
                    pointLabels: { font: { size: 12, weight: 'bold' } }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function clearResultDisplay() {
  const selectedFoodEl = document.getElementById("selectedFood");
  if(selectedFoodEl) selectedFoodEl.textContent = "選んだ食材：未選択";
  const resultStatusIcon = document.getElementById("resultStatusIcon");
  if(resultStatusIcon) {
    resultStatusIcon.textContent = "";
    resultStatusIcon.classList.remove("excellent", "good", "improve");
  }
  const pairTitle = document.getElementById("pairTitle");
  if(pairTitle) pairTitle.textContent = "食材を選んでください";
  const nutritionScore = document.getElementById("nutritionScore");
  if(nutritionScore) nutritionScore.textContent = "-";
  const boostRate = document.getElementById("boostRate");
  if(boostRate) boostRate.textContent = "-";
  const suggestion = document.getElementById("suggestion");
  if(suggestion) suggestion.textContent = "";
  const reason = document.getElementById("reason");
  if(reason) reason.textContent = "";
  const improvement = document.getElementById("improvement");
  if(improvement) improvement.textContent = "";
  const boostTags = document.getElementById("boostTags");
  if(boostTags) boostTags.innerHTML = "";
  const dressingList = document.getElementById("dressingList");
  if(dressingList) dressingList.innerHTML = "";
  updateBoostMeter("+0%");
}

function updateBoostMeter(boostRate) {
  const posBar = document.getElementById("boostMeterPositive");
  const negBar = document.getElementById("boostMeterNegative");
  if(!posBar || !negBar) return;
  
  const value = parseInt(boostRate.replace('%', ''));
  posBar.style.width = value > 0 ? (value / 20 * 50) + "%" : "0%";
  negBar.style.width = value < 0 ? (Math.abs(value) / 20 * 50) + "%" : "0%";
}

// 4. UI生成（検索結果の描画：サーバー側のデータを使うように修正）
function renderSearchResults() {
  if (!searchResults) return;
  const query = foodSearch.value.trim();
  const displayedStep = getDisplayedPanelStep();

  searchResults.innerHTML = "";

  // 修正：クエリがあるときは、サーバーから読み込まれたfoodDataのキーをそのまま使う
  if (query) {
    renderFoodCandidateButtons(searchResultFoodIds);
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
    const foodKey = (allFoodData[foodItem] || foodData[foodItem])
      ? foodItem
      : findFoodIdByName(foodItem);
    const candidateFood = allFoodData[foodKey] || foodData[foodKey];
    if (!foodKey || !candidateFood) return;

    const foodName = candidateFood.name;
    const btn = document.createElement("button");
    btn.className = "food-button search-result-button";
    btn.dataset.id = foodKey;
    if (foodKey && (foodKey === selectedFood || selectedFoods.some((food) => food.id === foodKey))) {
      btn.classList.add("active");
    }
    appendFoodLabel(btn, candidateFood);
    btn.onclick = (event) => {
      event.stopPropagation();
      foodSearch.value = foodName;
      selectedFood = foodKey || "";
      addSelectedFood(foodKey, foodName);
      foodSearch.dispatchEvent(new Event("change", { bubbles: true }));

      // ここを修正：どの食材(foodKey)の、どのランク(0=最強)を表示するか指定する
      updateDisplay(foodKey, 0); 
      
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
  foodSearch.onclick = (event) => {
    event.stopPropagation();
    openFoodCandidatePanel();
  };
  
  // 修正：入力されるたびにサーバーへ問い合わせ(loadFoods)を行うように変更
  foodSearch.oninput = async () => {
    searchPanelStep = "entry";
    activeFoodCategory = "";
    activePurposeTag = "";
    clearSearchPreview();

    // サーバーから検索結果を取得
    await loadFoods(foodSearch.value.trim());

    syncSelectedFoodFromInput();
    updateSelectedFoodChip("");
    renderCategoryTabs();
    renderSearchResults();
  };
  foodSearch.onchange = () => syncSelectedFoodFromInput();
}

if (clearSelectedFood) {
  clearSelectedFood.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    resetFoodSelectionPanel();
    closeFoodCandidatePanel();
    if (foodSearch) {
      foodSearch.value = "";
      foodSearch.placeholder = "クリックして食材を選ぶ";
      foodSearch.blur();
    }
  };
}

ratingCards.forEach((card) => {
  card.onclick = () => {
    selectedRating = card.dataset.rating;
    updateDisplay();
  };
});

// 初期実行（全件読み込み）
loadFoods();
if (resultContainer) resultContainer.hidden = true;
