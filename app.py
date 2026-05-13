from flask import Flask, render_template, jsonify, Response, request
import json
import jaconv

app = Flask(__name__)

# =========================
# foods.json 読み込み
# =========================
with open("foods.json", "r", encoding="utf-8") as f:
    foods = json.load(f)

# =========================
# トップページ
# =========================
@app.route("/")
def index():
    return render_template("index.html")

# =========================
# foods API (検索機能強化版)
# =========================
@app.route("/foods")
def get_foods():
    # URLの末尾につく検索クエリを取得
    query = request.args.get('q', '')

    if not query:
        filtered_foods = foods
    else:
        # 1. 検索ワードを「ひらがな」に変換
        query_hira = jaconv.kata2hira(query)
        
        filtered_foods = []
        for f in foods:
            # 2. foods.json の項目名に合わせて「food」を取得
            # (もし JSON 側が "food": "いちご" となっていればこちらが正解です)
            food_name = f.get('food', '')
            
            # 食材名も「ひらがな」に変換
            name_hira = jaconv.kata2hira(food_name)
            
            # 元の名前、またはひらがな化した名前に検索文字が含まれるか
            if query in food_name or query_hira in name_hira:
                filtered_foods.append(f)

    return Response(
        json.dumps(filtered_foods, ensure_ascii=False),
        content_type="application/json; charset=utf-8"
    )

# =========================
# アプリ起動
# =========================
if __name__ == "__main__":
    app.run(debug=True, port=5001)