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
# 👑 完全版：豆腐・飲み物対応 ＆ ○△ペアデータも正しく返すAPI
# =========================================
@app.route("/calculate")
def calculate_score():
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

    # 私たちが設計した「栄養素のリスト」を取得
    item_nutrients = target_food.get("nutrients", [])

    # 1. foods.json から元々のベースとなる「チャートデータ」を取得
    base_chart = target_food.get("chart_data", {
        "栄養": 70, "吸収": 70, "脂質": 50, "酵素": 50, "抗酸化": 50
    })

    # 2. ◎○△によるベース倍率の決定
    base_boost = 1.0
    chart_multiplier = 1.0

    # 🌟【重要】ここでお互いのタブ（◎○△）に応じた正しいペアデータを裏で抽出する！
    current_pairs = []

    if rank == "best": # ◎ 最強
        current_pairs = target_food.get("good_pairs", [])
        if current_pairs and len(current_pairs) > 0:
            base_boost = float(current_pairs[0].get("boost", 1.2))
        else:
            base_boost = 1.2
        chart_multiplier = base_boost 

    elif rank == "standard": # ○ 良好
        current_pairs = target_food.get("better_pairs", [])
        if current_pairs and len(current_pairs) > 0:
            base_boost = float(current_pairs[0].get("boost", 1.1))
        else:
            base_boost = 1.1
        chart_multiplier = base_boost

    elif rank == "single": # △ 普通（注意）
        current_pairs = target_food.get("bad_pairs", [])
        if current_pairs and len(current_pairs) > 0:
            base_boost = float(current_pairs[0].get("boost", 0.85))
        else:
            base_boost = 0.95
        chart_multiplier = 1.0

    # 3. 各スライダーのベース倍率
    portion_factor = 1.0 + (portion - 1.0) * 0.25      # 量2倍なら +25%
    veg_factor = 1.0 + (veg_portion - 1.0) * 0.15      # 野菜2倍なら +15%
    
    dressing_bonus = 0
    if dressing in ["マヨネーズ", "オリーブオイル", "ごま油"]:
        dressing_bonus = 10 
    elif dressing in ["醤油", "ポン酢", "塩"]:
        dressing_bonus = 5

    # 総合「栄養スコア」の計算
    calculated_score = int((100 * base_boost * portion_factor * veg_factor) + dressing_bonus)
    final_boost_percent = int((calculated_score - 100))
    boost_rate_str = f"+{final_boost_percent}%" if final_boost_percent >= 0 else f"{final_boost_percent}%"

    # 4. 🚀 【栄養素ファースト】仕込んだ栄養素に応じた個別ウネウネ自動分岐！
    chart_nutrition = base_chart.get("栄養", 70) * chart_multiplier
    chart_absorption = base_chart.get("吸収", 70) * chart_multiplier
    chart_lipid = base_chart.get("脂質", 50) * chart_multiplier
    chart_enzyme = base_chart.get("酵素", 50) * chart_multiplier
    chart_antioxidant = base_chart.get("抗酸化", base_chart.get("糖質", 50)) * chart_multiplier

    # 法則A：脂溶性ビタミン（トマトのリコピン、にんじんのβカロテンなど）
    if any(n in item_nutrients for n in ["リコピン", "βカロテン", "ビタミンE", "ビタミンK"]):
        if dressing in ["オリーブオイル", "ごま油", "マヨネーズ"]:
            chart_absorption *= 1.35
            chart_antioxidant *= 1.15
        chart_antioxidant *= (1.0 + (veg_portion - 1.0) * 0.2)
        chart_nutrition *= portion_factor

    # 法則B：ビタミンB1（豚肉など）
    if "ビタミンB1" in item_nutrients:
        chart_nutrition *= (1.0 + (portion - 1.0) * 0.3)
        chart_lipid *= (1.0 + (portion - 1.0) * 0.2)
        chart_absorption *= (1.0 + (veg_portion - 1.0) * 0.25)

    # 法則C：鉄分（ほうれん草、牛肉など）
    if any(n in item_nutrients for n in ["鉄", "鉄分", "ヘム鉄", "非ヘム鉄"]):
        chart_absorption *= (1.0 + (veg_portion - 1.0) * 0.3)
        chart_nutrition *= portion_factor

    # 🌟 新設！法則F：大豆製品（豆腐、納豆など）
    if any(n in item_nutrients for n in ["大豆イソフラボン", "イソフラボン", "大豆タンパク質"]):
        chart_nutrition *= portion_factor
        # 野菜（食物繊維＝善玉菌のエサ）を増やすと、大豆パワーと合わさって「酵素（腸活）」がウネッと跳ね上がる
        chart_enzyme *= (1.0 + (veg_portion - 1.0) * 0.3)
        chart_absorption *= veg_factor

    # 🌟 新設！法則G：ポリフェノール・カテキン類の特殊な飲み物（コーヒー、緑茶など）
    if any(n in item_nutrients for n in ["ポリフェノール", "カテキン", "クロロゲン酸"]):
        # 飲む量（本体スライダー）を増やすほど抗酸化力がグーンとアップ！
        chart_antioxidant *= (1.0 + (portion - 1.0) * 0.35)
        # 飲み物なので、量が増えても「脂質」は一切増えないようにガード
        chart_lipid = min(5, chart_lipid)

    # 法則E：一般的なタンパク質（鶏肉、魚、卵など）
    # ※豆腐もこれに引っかかりますが、上記の大豆ロジックと綺麗に重複して強化されます
    if "たんぱく質" in item_nutrients or "タンパク質" in item_nutrients or "レシチン" in item_nutrients:
        chart_nutrition *= (1.0 + (portion - 1.0) * 0.3)
        chart_absorption *= veg_factor

    # 調味料による一律の脂質変化
    if dressing == "マヨネーズ":
        chart_lipid += 15
    elif dressing in ["オリーブオイル", "ごま油"]:
        chart_lipid += 10

    # 5. 上限ガード（100点満点を超えないように）
    updated_chart = {
        "栄養": min(100, int(chart_nutrition)),
        "吸収": min(100, int(chart_absorption)),
        "脂質": min(100, int(chart_lipid)),
        "酵素": min(100, int(chart_enzyme)),
        "抗酸化": min(100, int(chart_antioxidant))
    }

    # 🌟 フロント（JavaScript）へ、新しく抽出した「選ばれたランクのペアリスト」も一緒に返してあげる
    return Response(
        json.dumps({
            "success": True,
            "nutritionScore": calculated_score,
            "boostRate": boost_rate_str,
            "chart_data": updated_chart,
            "current_pairs": current_pairs  # <-- これが○△コンビ復活のカギ！
        }, ensure_ascii=False),
        content_type="application/json; charset=utf-8"
    )
# =========================
# アプリ起動
# =========================
if __name__ == "__main__":
    app.run(debug=True, port=5001)
