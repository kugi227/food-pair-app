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
# 内部：ペアチェック（片方向）
# =========================
def check_pair(base_food, target_food):
    food = get_food(base_food)
    if not food:
        return None

    # ◎ good
    for pair in food.get("good_pairs", []):
        if pair.get("food") == target_food:
            return {
                "type": "good",
                "result": "◎",
                "reason": pair.get("effect", ""),
                "message": f"{base_food} × {target_food}は相性が良い組み合わせです",
                "boost": pair.get("boost", 1.0)
            }

    # × bad
    for pair in food.get("bad_pairs", []):
        if pair.get("food") == target_food:
            return {
                "type": "bad",
                "result": "×",
                "reason": pair.get("effect", ""),
                "message": "一緒に摂るタイミングをずらすと改善できます",
                "boost": 0.8
            }

    return None


# =========================
# 食べ合わせ取得（双方向対応）
# =========================
def get_pair(food1, food2):

    # ① 正方向
    result = check_pair(food1, food2)
    if result:
        return result

    # ② 逆方向（重要）
    result = check_pair(food2, food1)
    if result:
        return result

    # ③ 未登録
    return {
        "type": "normal",
        "result": "△",
        "reason": "この組み合わせのデータはまだありません",
        "message": "今後データ追加予定です",
        "boost": 1.0
    }


# =========================
# スコア計算（強化版）
# =========================
def calc_score(food1, food2):
    base = 100

    pair = get_pair(food1, food2)

    boost = pair.get("boost", 1.0)

    # スコア計算
    final = int(base * boost)

    # ランク付け（UIで使える）
    if final >= 120:
        rank = "S"
    elif final >= 110:
        rank = "A"
    elif final >= 95:
        rank = "B"
    else:
        rank = "C"

    return {
        "base": base,
        "final": final,
        "boost": boost,
        "rank": rank
    }


# =========================
# おすすめ情報
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