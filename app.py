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

# =========================================
# 🧪 修正版：タブ（◎○△）のベース数値をチャートに完全反映するAPI
# =========================================
@app.route("/calculate")
def calculate_score():
    # JavaScriptから送られてきたパラメータを受け取る
    food_id = request.args.get("food", "").strip()
    rank = request.args.get("rank", "best").strip()        # best(◎), standard(○), single(△)
    portion = float(request.args.get("portion", 1))       # 量スライダー（1〜2倍）
    veg_portion = float(request.args.get("veg_portion", 1)) # 野菜の量（1〜3倍）
    dressing = request.args.get("dressing", "なし").strip() # 調味料名

    # 対象の食材データを検索
    target_food = None
    for f in foods:
        if f.get("id") == food_id or f.get("food") == food_id:
            target_food = f
            break

    if not target_food:
        return jsonify({"success": False, "error": "食材が見つかりません"}), 404

    # 1. foods.json から元々のベースとなる「チャートデータ」を取得（なければデフォルト値）
    base_chart = target_food.get("chart_data", {
        "栄養": 80, "吸収": 80, "脂質": 50, "酵素": 50, "抗酸化": 50
    })

    # 2. 【重要】パートナーさんのこだわり（◎○△）によるベース倍率とチャートの変動ロジック
    base_boost = 1.0
    chart_multiplier = 1.0

    if rank == "best": # ◎ 最強
        # good_pairsの先頭データからブースト率を取得
        if target_food.get("good_pairs") and len(target_food["good_pairs"]) > 0:
            base_boost = float(target_food["good_pairs"][0].get("boost", 1.2))
        else:
            base_boost = 1.2
        # ◎ は相乗効果でグラフ全体がグッと外側に膨らむ（ブースト効果をチャートに反映）
        chart_multiplier = base_boost 

    elif rank == "standard": # ○ 良好
        if target_food.get("better_pairs") and len(target_food["better_pairs"]) > 0:
            base_boost = float(target_food["better_pairs"][0].get("boost", 1.1))
        else:
            base_boost = 1.1
        # ○ は少しだけグラフが膨らむ
        chart_multiplier = base_boost

    elif rank == "single": # △ 普通（食材単体）
        # 単体なのでブーストはなし（1.0倍未満、または元のjsonのbad_pairsの数値を反映）
        if target_food.get("bad_pairs") and len(target_food["bad_pairs"]) > 0:
            base_boost = float(target_food["bad_pairs"][0].get("boost", 0.85))
        else:
            base_boost = 0.95
        # △ は食材単体の数値をそのままベースにするため、乗算は1.0（または少し下げる）
        chart_multiplier = 1.0

    # 3. Yukiさんのスライダーによる「ウネウネ変化」の掛け算
    portion_factor = 1.0 + (portion - 1.0) * 0.25      # 量が2倍なら +25%
    veg_factor = 1.0 + (veg_portion - 1.0) * 0.15      # 野菜2倍なら +15%
    
    # 調味料（ドレッシング）によるボーナス点
    dressing_bonus = 0
    if dressing in ["マヨネーズ", "オリーブオイル", "ごま油"]:
        dressing_bonus = 10 
    elif dressing in ["醤油", "ポン酢", "塩"]:
        dressing_bonus = 5

    # 4. 最終的な「栄養スコア」と「ブースト率」の計算
    calculated_score = int((100 * base_boost * portion_factor * veg_factor) + dressing_bonus)
    
    final_boost_percent = int((calculated_score - 100))
    boost_rate_str = f"+{final_boost_percent}%" if final_boost_percent >= 0 else f"{final_boost_percent}%"

    # 5. 【修正の核心】◎○△のベース変化 ✕ スライダー変化 を合体させてチャートの数値を決定！
    updated_chart = {
        "栄養": min(100, int(base_chart.get("栄養", 80) * chart_multiplier * portion_factor)),
        "吸収": min(100, int(base_chart.get("吸収", 80) * chart_multiplier * veg_factor)),
        "脂質": min(100, int(base_chart.get("脂質", 50) * chart_multiplier + (15 if dressing == "マヨネーズ" else 0))),
        "酵素": min(100, int(base_chart.get("酵素", 50) * chart_multiplier)),
        "抗酸化": min(100, int(base_chart.get("抗酸化", base_chart.get("糖質", 60)) * chart_multiplier))
    }

    # JavaScriptへJSON形式でまとめてお返し
    return Response(
        json.dumps({
            "success": True,
            "nutritionScore": calculated_score,
            "boostRate": boost_rate_str,
            "chart_data": updated_chart
        }, ensure_ascii=False),
        content_type="application/json; charset=utf-8"
    )
# =========================
# アプリ起動
# =========================
if __name__ == "__main__":
    app.run(debug=True, port=5001)
