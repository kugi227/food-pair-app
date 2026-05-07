from flask import Flask, jsonify, request, render_template
from service import get_pair, calc_score, get_recommend

app = Flask(__name__)

# =========================
# トップページ
# =========================
@app.route("/")
def index():
    return render_template("index.html")


# =========================
# 食べ合わせ判定API
# =========================
@app.route("/result", methods=["POST"])
def result():
    data = request.get_json()

    if not data:
        return jsonify({"error": "データが送信されていません"}), 400

    food1 = data.get("food1")
    food2 = data.get("food2")

    if not food1 or not food2:
        return jsonify({"error": "食材が不足しています"}), 400

    pair = get_pair(food1, food2)

    if pair:
        return jsonify(pair)

    return jsonify({
        "result": "△",
        "reason": "この組み合わせのデータはまだありません",
        "improvement": "別の組み合わせも試してみてください",
        "dressing": "なし"
    })


# =========================
# スコア計算API
# =========================
@app.route("/score", methods=["POST"])
def score():
    data = request.get_json()

    if not data:
        return jsonify({"error": "データが送信されていません"}), 400

    food1 = data.get("food1")
    food2 = data.get("food2")

    if not food1 or not food2:
        return jsonify({"error": "食材が不足しています"}), 400

    return jsonify(calc_score(food1, food2))


# =========================
# おすすめAPI
# =========================
@app.route("/recommend/<name>")
def recommend(name):

    result = get_recommend(name)

    if not result:
        return jsonify({"error": "not found"}), 404

    return jsonify(result)


# =========================
# 食材一覧API（簡易版：foods.jsonから直接取得）
# =========================
@app.route("/foods", methods=["GET"])
def get_foods():
    # service側のfoodsを再利用するためにimport内で取得
    from service import foods

    food_set = set()

    for f in foods:
        food_set.add(f["food"])

    return jsonify(sorted(list(food_set)))


# =========================
# 起動
# =========================
if __name__ == "__main__":
    app.run(debug=True)