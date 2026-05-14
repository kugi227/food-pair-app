from flask import Flask, render_template, jsonify, Response, request
import json
import jaconv

app = Flask(__name__)

# =========================
# foods.json 読み込み
# =========================
with open("static/foods.json", "r", encoding="utf-8") as f:
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
FOOD_ALIASES = {
    "しいたけ": "椎茸",
    "くるみ": "胡桃（くるみ）",
    "まぐろ": "鮪（マグロ）",
    "さば": "鯖（サバ）",
    "のり": "海苔",
    "ごま": "ゴマ",
    "みかん": "オレンジ",
    "ツナ": "鮪（マグロ）",
    "きのこ": "椎茸",
    "なす": "なすび",
}


def normalize_search_text(value):
    return jaconv.kata2hira(str(value or "")).lower().replace(" ", "").replace("　", "")


@app.route("/foods")
def get_foods():
    # URLの末尾につく検索クエリを取得
    query = request.args.get('q', '').strip()

    if not query:
        filtered_foods = foods
    else:
        query_terms = {normalize_search_text(query)}
        alias = FOOD_ALIASES.get(query)
        if alias:
            query_terms.add(normalize_search_text(alias))
        
        filtered_foods = []
        for f in foods:
            searchable_values = [
                f.get('id', ''),
                f.get('food', ''),
                f.get('category', ''),
                *(f.get('keywords') or []),
                *(f.get('nutrients') or []),
            ]
            searchable_text = " ".join(normalize_search_text(value) for value in searchable_values)

            if any(term and term in searchable_text for term in query_terms):
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
