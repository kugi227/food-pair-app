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
let selectedFood = ""; 
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

// 2. 検索ロジック（サーバー側の検索結果を表示する形に変更）
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

let currentFoodId = ""; // 今選んでいる食材を保存する変数（関数の外に書いてください）

function updateDisplay(foodId, pairIndex = 0) {
    // 1. データの特定
    if (!foodId) return;
    currentFoodId = foodId; // 今の食材IDを記憶しておく

    const food = foods.find(f => f.id === foodId);
    if (!food) return;

    // 2. 表示するペア（◎、○、△）を特定する
    // good_pairs(◎), better_pairs(○), bad_pairs(△) の順でひとまとめにする
    const allPairs = [
        ...(food.good_pairs || []),
        ...(food.better_pairs || []),
        ...(food.bad_pairs || [])
    ];
    
    // 指定された番号のペアを取り出す（なければ1番目のペアを表示）
    const currentPair = allPairs[pairIndex] || food.good_pairs[0];
    const score = Math.round(currentPair.boost * 100);

    // 3. 判定（◎○△）に合わせてカードの見た目を変える
    const logicBox = document.getElementById("logicBox");
    const cardTitle = document.getElementById("cardTitle");
    const statusIcon = document.getElementById("resultStatusIcon");

    if (pairIndex === 0 && score >= 130) {
        logicBox.classList.add("logic-gold"); // 黄金デザイン適用
        cardTitle.textContent = "黄金の栄養ブースト";
        statusIcon.textContent = "◎";
    } else {
        logicBox.classList.remove("logic-gold"); // 通常デザイン
        cardTitle.textContent = pairIndex === 1 ? "栄養の組み合わせ：良好" : "栄養の組み合わせ：普通";
        statusIcon.textContent = pairIndex === 1 ? "○" : "△";
    }

    // 4. テキストデータの流し込み
    document.getElementById("foodEmojiDisplay").textContent = food.emoji;
    document.getElementById("foodNameLabel").textContent = `食材：${food.food}`;
    document.getElementById("nutritionScore").textContent = score;
    document.getElementById("boostRate").textContent = `+${Math.round((currentPair.boost - 1) * 100)}%`;
    
    // ペアの相手の名前と、理由を表示
    // 相手の名前を候補（name, partner, food_name）から探して表示する
    // partner がさらに中に入っている場合や、別の名前（food）で入っている場合を網羅
const partnerName = currentPair.food || currentPair.name || currentPair.partner || "玉ねぎ等";
    document.getElementById("bestMethodTitle").textContent = `${food.food} × ${partnerName}`;
    document.getElementById("scientificEvidence").textContent = food.logic.reason;
    document.getElementById("reason").textContent = food.logic.reason;
    document.getElementById("improvement").textContent = food.logic.action;

    const dList = document.getElementById("dressingList");
    dList.innerHTML = food.dressings.map(d => `<li>${d}</li>`).join("");

    // 5. チャート描画（既存のグラフを壊してから新しく作る）
    const ctx = document.getElementById('radarChart').getContext('2d');
    let chartStatus = Chart.getChart("radarChart"); 
    if (chartStatus !== undefined) {
        chartStatus.destroy();
    }

    const chartValues = [
        food.chart_data["栄養"] || 0,
        food.chart_data["吸収"] || 80,
        food.chart_data["脂質"] || 0,
        food.chart_data["酵素"] || 0,
        food.chart_data["抗酸化"] || food.chart_data["糖質"] || 0
    ];

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['栄養', '吸収', '脂質', '酵素', '抗酸化'],
            datasets: [{
                data: chartValues,
                backgroundColor: 'rgba(255, 215, 0, 0.4)',
                borderColor: '#ffd700',
                borderWidth: 3,
                pointBackgroundColor: '#ffd700'
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
    renderFoodCandidateButtons(Object.keys(foodData));
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