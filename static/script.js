const foodData = {
  tomato: {
    name: "トマト",
    rating: "excellent",
    icon: "◎",
    pairTitle: "トマト × オリーブオイル",
    nutritionScore: "118",
    boostRate: "+18%",
    boosts: ["抗酸化サポート", "吸収サポート", "美容サポート"],
    suggestion: "オリーブオイルと一緒に食べる",
    reason: "トマトのリコピンは、油と一緒にとることで吸収されやすいとされています。",
    improvement: "サラダにする場合は、オイル系ドレッシングを使うと栄養を活かしやすくなります。",
    dressings: ["オリーブオイル系ドレッシング", "レモンオイルドレッシング"]
  },
  carrot: {
    name: "にんじん",
    rating: "excellent",
    icon: "◎",
    pairTitle: "にんじん × ごま油",
    nutritionScore: "116",
    boostRate: "+16%",
    boosts: ["βカロテンサポート", "吸収サポート", "美容サポート"],
    suggestion: "油と一緒に炒める",
    reason: "にんじんのβカロテンは、油と合わせることで吸収されやすくなります。",
    improvement: "炒め物や温野菜にすると、栄養を活かしやすくなります。",
    dressings: ["ごまドレッシング", "フレンチドレッシング"]
  },
  spinach: {
    name: "ほうれん草",
    rating: "good",
    icon: "○",
    pairTitle: "ほうれん草 × レモン",
    nutritionScore: "108",
    boostRate: "+8%",
    boosts: ["鉄分活用サポート", "抗酸化サポート", "栄養バランスサポート"],
    suggestion: "レモンや酢を少し足す",
    reason: "ほうれん草の鉄は、ビタミンCを含む食材と合わせると活かしやすくなります。",
    improvement: "おひたしにレモンを加えると、相性をより高められます。",
    dressings: ["レモンドレッシング", "和風ドレッシング"]
  },
  egg: {
    name: "卵",
    rating: "good",
    icon: "○",
    pairTitle: "卵 × トマト",
    nutritionScore: "110",
    boostRate: "+10%",
    boosts: ["たんぱく質サポート", "彩りサポート", "食事バランスサポート"],
    suggestion: "トマトや野菜と一緒に食べる",
    reason: "卵は野菜と合わせることで、食事全体の栄養バランスが整いやすくなります。",
    improvement: "サラダや炒め物に加えると食べやすくなります。",
    dressings: ["オーロラソース風", "和風ドレッシング"]
  },
  natto: {
    name: "納豆",
    rating: "excellent",
    icon: "◎",
    pairTitle: "納豆 × 胡麻",
    nutritionScore: "120",
    boostRate: "+20%",
    boosts: ["抗酸化サポート", "たんぱく質活用サポート", "エイジングケアサポート"],
    suggestion: "納豆にすりごまを加える",
    reason: "納豆のたんぱく質と胡麻のビタミンEが相乗的に働き、抗酸化作用が高まります。",
    improvement: "納豆にすりごまを加えることで、栄養価が向上し、風味も豊かになります。",
    dressings: ["ごまドレッシング", "和風しょうゆドレッシング"]
  },
  chicken: {
    name: "鶏肉",
    rating: "improve",
    icon: "△",
    pairTitle: "鶏肉 × レモン",
    nutritionScore: "96",
    boostRate: "+4%",
    boosts: ["さっぱりサポート", "食欲サポート", "たんぱく質サポート"],
    suggestion: "レモンや香味野菜を足す",
    reason: "鶏肉はたんぱく質源として使いやすいですが、野菜や酸味を加えると食べやすさが上がります。",
    improvement: "単体より、野菜やレモンを組み合わせると、よりバランスよく楽しめます。",
    dressings: ["レモン系ドレッシング", "玉ねぎドレッシング"]
  }
};

const foodButtons = document.querySelectorAll(".food-button");

function updateRatingCards(rating) {
  document.getElementById("ratingExcellent").classList.remove("active");
  document.getElementById("ratingGood").classList.remove("active");
  document.getElementById("ratingImprove").classList.remove("active");

  if (rating === "excellent") {
    document.getElementById("ratingExcellent").classList.add("active");
  } else if (rating === "good") {
    document.getElementById("ratingGood").classList.add("active");
  } else if (rating === "improve") {
    document.getElementById("ratingImprove").classList.add("active");
  }
}

function updateDisplay(foodKey) {
  const data = foodData[foodKey];

  document.getElementById("selectedFood").textContent = `選んだ食材：${data.name}`;
  document.getElementById("resultStatusIcon").textContent = data.icon;
  document.getElementById("pairTitle").textContent = data.pairTitle;
  document.getElementById("nutritionScore").textContent = data.nutritionScore;
  document.getElementById("boostRate").textContent = data.boostRate;
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

  updateRatingCards(data.rating);
}

foodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    foodButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const foodKey = button.dataset.food;
    updateDisplay(foodKey);
  });
});

// 初期表示
updateDisplay("natto");