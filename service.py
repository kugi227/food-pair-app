import json

# =========================
# JSON読み込み
# =========================
with open("foods.json", "r", encoding="utf-8") as f:
    foods = json.load(f)


# =========================
# 食材取得
# =========================
def get_food(name):
    if not name:
        return None

    name = name.strip()

    return next((f for f in foods if f["food"] == name), None)


# =========================
# 食べ合わせ取得（◎△×の核）
# =========================
def get_pair(food1, food2):
    food = get_food(food1)

    if not food:
        return None

    # good_pairs検索
    for pair in food.get("good_pairs", []):
        if pair.get("food") == food2:
            return {
                "result": "◎",
                "reason": pair.get("effect", ""),
                "improvement": f"{food1} × {food2}は相性が良い組み合わせです",
                "dressing": "なし",
                "boost": pair.get("boost", 1.0)
            }

    # bad_pairs検索
    for pair in food.get("bad_pairs", []):
        if pair.get("food") == food2:
            return {
                "result": "×",
                "reason": pair.get("effect", ""),
                "improvement": "一緒に摂取を避けるか調整してください",
                "dressing": "なし",
                "boost": 0.8
            }

    # 未登録
    return {
        "result": "△",
        "reason": "この組み合わせのデータはまだありません",
        "improvement": "今後データ追加予定です",
        "dressing": "なし",
        "boost": 1.0
    }


# =========================
# スコア計算（boostベース）
# =========================
def calc_score(food1, food2):
    base = 100

    pair = get_pair(food1, food2)

    if not pair:
        return {
            "base": base,
            "final": base,
            "boost": 1.0
        }

    boost = pair.get("boost", 1.0)
    final = int(base * boost)

    return {
        "base": base,
        "final": final,
        "boost": boost
    }


# =========================
# おすすめ（食材詳細）
# =========================
def get_recommend(name):
    food = get_food(name)

    if not food:
        return None

    return {
        "best_methods": food.get("best_methods", []),
        "tips": food.get("tips", []),
        "nutrients": food.get("nutrients", [])
    }


# =========================
# 食材一覧取得（API用）
# =========================
def get_food_list():
    return [f["food"] for f in foods]