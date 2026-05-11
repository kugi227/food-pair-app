let foodCatalog = {};
let foodData = {};
let selectedFood = "natto"; 
let selectedRating = "excellent";

// カテゴリーの初期設定
let foodCategories = [{ id: "all", name: "すべて", foods: [] }];
let activeFoodCategory = "all";

// 1. データの読み込みと変換（ここで全食材をfoodDataに登録する）
async function loadFoods() {
  try {
    const response = await fetch("/foods");
    const rawFoods = await response.json();

    foodCatalog = {};
    foodData = {};
    foodCategories[0].foods = []; // リセット

    rawFoods.forEach((item) => {
      const id = item.id || item.food;
      
      // カテゴリーリストにIDを追加
      foodCategories[0].foods.push(id);

      // 検索用カタログ
      foodCatalog[id] = { 
        label: item.food, 
        keywords: item.keywords || [] 
      };

      // ★ここが大事！全食材のデータを組み立てる
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
          suggestion: `${item.good_pairs[0]?.food || "旬の野菜"}をプラス`,
          reason: `${item.good_pairs[0].effect}。${item.dressing_logic || ""}`,
          improvement: `おすすめ調理法：${item.best_methods?.join('、') || "加熱調理"}`,
          dressings: item.dressings ? item.dressings.map((d, i) => i === 0 ? `★${d} (栄養効率UP)` : d) : ["お好みの調味料"],
        },
        good: {
          icon: "○",
          // better_pairsがあればその最初のデータを使う。なければ予備のテキストを出す。
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
          dressings: item.dressings ? item.dressings.map((d, i) => i === 0 ? `★${d} (栄養効率UP)` : d) : ["お好みのドレッシング"],
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

// 2. 検索ロジック（栄養素もキーワードも全部探す）
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

// 3. 表示更新
const foodSearch = document.getElementById("foodSearch");
const foodCandidatePanel = document.getElementById("foodCandidatePanel");
const foodCategoryTabs = document.getElementById("foodCategoryTabs");
const searchResults = document.getElementById("searchResults");
const ratingCards = document.querySelectorAll(".rating-card");

function updateDisplay() {
  const food = foodData[selectedFood];
  if (!food) return;

  const data = food[selectedRating];

  document.getElementById("selectedFood").textContent = `選んだ食材：${food.emoji} ${food.name}`;
  document.getElementById("resultStatusIcon").textContent = data.icon;
  document.getElementById("pairTitle").textContent = data.pairTitle;
  document.getElementById("nutritionScore").textContent = data.nutritionScore;
  document.getElementById("boostRate").textContent = data.boostRate;
  document.getElementById("suggestion").textContent = data.suggestion;
  document.getElementById("reason").textContent = data.reason;
  document.getElementById("improvement").textContent = data.improvement;

  const boostTags = document.getElementById("boostTags");
  boostTags.innerHTML = "";
  data.boosts.forEach(b => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = b;
    boostTags.appendChild(span);
  });

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

function updateBoostMeter(boostRate) {
  const posBar = document.getElementById("boostMeterPositive");
  const negBar = document.getElementById("boostMeterNegative");
  const value = parseInt(boostRate.replace('%', ''));
  posBar.style.width = value > 0 ? (value / 20 * 50) + "%" : "0%";
  negBar.style.width = value < 0 ? (Math.abs(value) / 20 * 50) + "%" : "0%";
}

// 4. イベント・UI生成
function renderSearchResults() {
  if (!searchResults) return;
  const query = foodSearch.value.trim();
  const matches = query ? findMatchingFoods(query) : foodCategories[0].foods;

  searchResults.innerHTML = "";
  matches.forEach((foodKey) => {
    if (!foodData[foodKey]) return;
    const btn = document.createElement("button");
    btn.className = "food-button search-result-button";
    btn.textContent = `${foodData[foodKey].emoji} ${foodData[foodKey].name}`;
    btn.onclick = () => {
      selectedFood = foodKey;
      foodSearch.value = foodData[foodKey].name;
      updateDisplay();
      foodCandidatePanel.classList.remove("open");
    };
    searchResults.appendChild(btn);
  });
}

function renderCategoryTabs() {
  if (!foodCategoryTabs) return;
  foodCategoryTabs.innerHTML = "";
  foodCategories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = `food-category-tab ${cat.id === activeFoodCategory ? 'active' : ''}`;
    btn.textContent = cat.name;
    foodCategoryTabs.appendChild(btn);
  });
}

foodSearch.onfocus = () => {
  renderSearchResults();
  foodCandidatePanel.classList.add("open");
};

foodSearch.oninput = () => renderSearchResults();

ratingCards.forEach((card) => {
  card.onclick = () => {
    selectedRating = card.dataset.rating;
    updateDisplay();
  };
});

// 実行
loadFoods();