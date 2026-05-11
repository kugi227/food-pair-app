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
# ペア検索（片方向）
# =========================
def find_pair(base_food, target_food):
    if not base_food:
        return None

    # good
    for pair in base_food.get("good_pairs", []):
        if pair.get("food") == target_food:
            return {
                "type": "good",
                "data": pair
            }

    # bad
    for pair in base_food.get("bad_pairs", []):
        if pair.get("food") == target_food:
            return {
                "type": "bad",
                "data": pair
            }

    return None


# =========================
# 食べ合わせ取得（双方向対応）
# =========================
def get_pair(food1, food2):
    f1 = get_food(food1)
    f2 = get_food(food2)

    if not f1 or not f2:
        return None

    # ① food1 → food2
    result = find_pair(f1, food2)

    # ② なければ food2 → food1
    if not result:
        result = find_pair(f2, food1)

    # ③ 判定
    if result:
        if result["type"] == "good":
            return {
                "result": "◎",
                "reason": result["data"].get("effect", ""),
                "improvement": f"{food1} × {food2}は相性が良い組み合わせです",
                "dressing": "なし",
                "boost": result["data"].get("boost", 1.2)
            }

        elif result["type"] == "bad":
            return {
                "result": "×",
                "reason": result["data"].get("effect", ""),
                "improvement": "一緒に摂取を避けるか、時間をずらしましょう",
                "dressing": "なし",
                "boost": 0.8
            }

    # ④ 未登録
    return {
        "result": "△",
        "reason": "この組み合わせのデータはまだありません",
        "improvement": "今後データ追加予定です",
        "dressing": "なし",
        "boost": 1.0
    }


# =========================
# スコア計算
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
# おすすめ取得
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
# 食材一覧
# =========================
def get_food_list():
    return [f["food"] for f in foods]