from flask import Flask, render_template, jsonify, Response
import json

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
# foods API
# =========================
@app.route("/foods")
def get_foods():
    return Response(
        json.dumps(foods, ensure_ascii=False),
        content_type="application/json; charset=utf-8"
    )

# =========================
# アプリ起動
# =========================
if __name__ == "__main__":
    app.run(debug=True, port=5001)