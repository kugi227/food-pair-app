from flask import Flask, jsonify, request, render_template
import json

app = Flask(__name__)

# =========================
# JSON読み込み（新機能）
# =========================
with open("foods.json", "r", encoding="utf-8") as f:
    foods = json.load(f)

# =========================
# 既存：組み合わせ判定データ（そのまま活かす）
# =========================
food_data = {

    ("オリーブオイル", "トマト"): {
        "result": "◎",
        "reason": "リコピンは油と一緒に摂ると吸収率アップ",
        "improvement": "加熱するとさらに吸収効率UP",
        "dressing": "イタリアンドレッシング"
    },

    ("ほうれん草", "レモン"): {
        "result": "◎",
        "reason": "ビタミンCが鉄分吸収を助ける",
        "improvement": "油と一緒に調理するとさらに良い",
        "dressing": "和風ドレッシング"
    },

    ("納豆", "キムチ"): {
        "result": "◎",
        "reason": "発酵食品同士で腸内環境をサポート",
        "improvement": "卵を加えると栄養バランスUP",
        "dressing": "なし"
    },

    ("緑茶", "鉄分サプリ"): {
        "result": "×",
        "reason": "タンニンが鉄分の吸収を妨げる",
        "improvement": "時間を空けて摂取する",
        "dressing": "なし"
    },

    ("牛乳", "鉄分サプリ"): {
        "result": "△",
        "reason": "カルシウムが鉄分吸収を少し妨げる可能性",
        "improvement": "別の時間に摂るとよい",
        "dressing": "なし"
    }

}

# =========================
# 入力ゆらぎ対策
# =========================
def normalize(food):
    if not food:
        return ""
    return food.strip()

# =========================
# トップページ
# =========================
@app.route("/")
def index():
    return render_template("index.html")

# =========================
# 食材一覧API
# =========================
@app.route("/foods", methods=["GET"])
def get_foods():
    food_set = set()

    # 既存データ
    for f1, f2 in food_data.keys():
        food_set.add(f1)
        food_set.add(f2)

    # JSONデータ
    for f in foods:
        food_set.add(f["food"])

    return jsonify(sorted(list(food_set)))

# =========================
# 判定API（既存）
# =========================
@app.route("/result", methods=["POST"])
def result():
    data = request.get_json()

    if not data:
        return jsonify({"error": "データが送信されていません"}), 400

    food1 = normalize(data.get("food1"))
    food2 = normalize(data.get("food2"))

    if not food1 or not food2:
        return jsonify({"error": "食材が不足しています"}), 400

    key = tuple(sorted([food1, food2]))

    if key in food_data:
        result_data = food_data[key]
    else:
        result_data = {
            "result": "△",
            "reason": "この組み合わせのデータはまだありません",
            "improvement": "別の組み合わせも試してみてください",
            "dressing": "なし"
        }

    return jsonify(result_data)

# =========================
# スコア計算（新機能🔥）
# =========================
@app.route("/score", methods=["POST"])
def score():
    data = request.get_json()

    food1 = normalize(data.get("food1"))
    food2 = normalize(data.get("food2"))

    base = 100
    boost = 1.0

    food_json = next((f for f in foods if f["food"] == food1), None)

    if food_json:
        for pair in food_json.get("good_pairs", []):
            if pair["food"] == food2:
                boost = pair.get("boost", 1.0)

    final = int(base * boost)

    return jsonify({
        "base": base,
        "final": final,
        "boost": boost
    })

# =========================
# おすすめ（最強の食べ方）
# =========================
@app.route("/recommend/<name>")
def recommend(name):

    food_json = next((f for f in foods if f["food"] == name), None)

    if not food_json:
        return jsonify({"error": "not found"}), 404

    return jsonify({
        "best_methods": food_json.get("best_methods", []),
        "tips": food_json.get("tips", [])
    })

# =========================
# 起動
# =========================
if __name__ == "__main__":
    app.run(debug=True)