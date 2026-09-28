from flask import Flask, request, jsonify, send_from_directory
import re


# =========================================================
# FLASK APP
# =========================================================

app = Flask(__name__)


# =========================================================
# SERVE FRONTEND
# =========================================================

@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/style.css")
def style():
    return send_from_directory(".", "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(".", "script.js")


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def contains_any(text, words):
    """
    Check whether any keyword exists in the text.
    """
    text = text.lower()

    for word in words:
        if word in text:
            return True

    return False


def detect_content_type(text):
    """
    Basic local classification.
    """

    lower = text.lower()

    # ---------------------------------------------
    # HUMOR / JOKE
    # ---------------------------------------------

    joke_words = [
        "lol",
        "lmao",
        "haha",
        "😂",
        "🤣",
        "💀",
        "joke",
        "funny",
        "meme",
        "when you",
        "me when",
        "bro really",
        "POV"
    ]

    # ---------------------------------------------
    # OPINION
    # ---------------------------------------------

    opinion_words = [
        "i think",
        "i believe",
        "in my opinion",
        "i feel",
        "personally",
        "best",
        "worst",
        "should",
        "must",
        "better than",
        "prefer"
    ]

    # ---------------------------------------------
    # FACTUAL CLAIM
    # ---------------------------------------------

    factual_words = [
        "scientists",
        "study",
        "studies",
        "research",
        "doctors",
        "doctor",
        "experts",
        "government",
        "according to",
        "causes",
        "causes",
        "increases",
        "decreases",
        "prevents",
        "cures",
        "kills",
        "contains",
        "proves",
        "confirmed",
        "officially",
        "always",
        "never",
        "percent",
        "%",
        "million",
        "billion",
        "true",
        "fact",
        "research shows",
        "scientifically"
    ]

    # ---------------------------------------------
    # OPINION FIRST
    # ---------------------------------------------

    if contains_any(lower, opinion_words):
        return "opinion"

    # ---------------------------------------------
    # FACTUAL CLAIM
    # ---------------------------------------------

    if contains_any(lower, factual_words):
        return "factual_claim"

    # ---------------------------------------------
    # JOKE / HUMOR
    # ---------------------------------------------

    if contains_any(lower, joke_words):
        return "humor/joke"

    # ---------------------------------------------
    # DEFAULT
    # ---------------------------------------------

    return "potentially_misleading"


def extract_claim(text, content_type):
    """
    Extract the main claim.
    For this MVP we use the submitted meme text itself.
    """

    clean_text = text.strip()

    if content_type == "humor/joke":
        return clean_text

    if len(clean_text) > 250:
        return clean_text[:247] + "..."

    return clean_text


def calculate_scores(text, content_type):
    """
    Generate demo accuracy/risk scores.

    IMPORTANT:
    These are heuristic demo scores, NOT verified
    factual accuracy measurements.
    """

    lower = text.lower()

    # -------------------------------------------------
    # HUMOR
    # -------------------------------------------------

    if content_type == "humor/joke":

        accuracy = 85
        risk = 10

        return accuracy, risk


    # -------------------------------------------------
    # OPINION
    # -------------------------------------------------

    if content_type == "opinion":

        accuracy = 50
        risk = 20

        return accuracy, risk


    # -------------------------------------------------
    # SUSPICIOUS CLAIMS
    # -------------------------------------------------

    risk = 45
    accuracy = 55


    suspicious_patterns = [

        "always",
        "never",
        "100%",
        "100 percent",
        "guaranteed",
        "instantly",
        "miracle",
        "secret",
        "scientists don't want you to know",
        "doctors hate",
        "cures everything",
        "cures cancer",
        "kills",
        "no one tells you",
        "they don't want you to know",
        "overnight",
        "completely safe",
        "zero risk"
    ]


    for pattern in suspicious_patterns:

        if pattern in lower:

            risk += 8
            accuracy -= 7


    # -------------------------------------------------
    # SCIENCE / HEALTH CLAIMS
    # -------------------------------------------------

    science_words = [
        "coffee",
        "water",
        "health",
        "medicine",
        "vitamin",
        "protein",
        "cancer",
        "brain",
        "sleep",
        "diet",
        "weight",
        "disease",
        "doctor",
        "medical"
    ]

    if contains_any(lower, science_words):

        risk += 12
        accuracy -= 8


    # -------------------------------------------------
    # NUMBERS / STATISTICS
    # -------------------------------------------------

    if re.search(r"\d+(\.\d+)?\s*%|\d+", lower):

        risk += 10
        accuracy -= 5


    # -------------------------------------------------
    # SOCIAL / POLITICAL / NEWS-LIKE CLAIM
    # -------------------------------------------------

    news_words = [
        "government",
        "minister",
        "president",
        "election",
        "law",
        "police",
        "court",
        "news",
        "breaking",
        "official"
    ]

    if contains_any(lower, news_words):

        risk += 10
        accuracy -= 5


    # Keep scores within range

    accuracy = max(5, min(95, accuracy))
    risk = max(5, min(95, risk))


    return accuracy, risk


def create_verdict(content_type, risk):
    """
    Create a human-readable verdict.
    """

    if content_type == "humor/joke":

        return "CASE DISMISSED"

    if content_type == "opinion":

        return "OPINION DETECTED"

    if risk >= 75:

        return "HIGH RISK — POTENTIALLY MISLEADING"

    if risk >= 50:

        return "SUSPICIOUS — FACT-CHECK NEEDED"

    return "LOWER RISK — VERIFY CONTEXT"


def create_reason(text, content_type, risk):
    """
    Generate explanation.
    """

    if content_type == "humor/joke":

        return (
            "The submitted meme appears to be primarily humorous "
            "or joke-based. It does not clearly present a serious "
            "factual claim, although jokes can still contain misleading "
            "information."
        )


    if content_type == "opinion":

        return (
            "The content appears to express an opinion or personal "
            "view rather than a directly verifiable factual statement. "
            "An opinion should not automatically be treated as misinformation."
        )


    if risk >= 75:

        return (
            "The meme contains language or claims that may be "
            "overgeneralized, exaggerated, or presented without enough "
            "context. The claim should be checked against reliable sources "
            "before being treated as fact."
        )


    if risk >= 50:

        return (
            "The meme presents information that could be interpreted "
            "as a factual claim. Some wording, statistics, or context "
            "may require verification before sharing."
        )


    return (
        "The meme contains a claim that can be checked against "
        "reliable evidence. No strong suspicious pattern was detected, "
        "but the original source and context should still be verified."
    )


def create_verification_points(text, content_type):

    if content_type == "humor/joke":

        return [
            "Determine whether the content is intended as satire or humor.",
            "Check whether viewers could mistake the joke for a factual claim.",
            "Look for factual statements hidden inside the joke."
        ]


    if content_type == "opinion":

        return [
            "Separate opinion from objectively verifiable facts.",
            "Check whether supporting evidence is provided.",
            "Look for factual claims used to support the opinion."
        ]


    points = [
        "Find the original source of the claim.",
        "Check the claim against reliable and independent sources.",
        "Verify statistics, dates, names, and numbers.",
        "Check whether important context has been removed."
    ]


    lower = text.lower()


    if contains_any(
        lower,
        ["doctor", "medicine", "health", "cancer", "vitamin", "disease"]
    ):

        points.append(
            "For health claims, check trusted medical or scientific sources."
        )


    if contains_any(
        lower,
        ["government", "minister", "president", "election", "law", "police"]
    ):

        points.append(
            "Check the relevant official government or institutional source."
        )


    return points[:5]


# =========================================================
# ANALYZE MEME
# =========================================================

@app.route("/analyze", methods=["POST"])
def analyze():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "No data received."
            }), 400


        meme_text = data.get("meme_text", "").strip()


        if not meme_text:

            return jsonify({
                "error": "Please enter some meme text."
            }), 400


        # -------------------------------------------------
        # LOCAL ANALYSIS
        # -------------------------------------------------

        content_type = detect_content_type(meme_text)

        claim = extract_claim(
            meme_text,
            content_type
        )

        accuracy, risk = calculate_scores(
            meme_text,
            content_type
        )

        verdict = create_verdict(
            content_type,
            risk
        )

        reason = create_reason(
            meme_text,
            content_type,
            risk
        )

        verification_points = create_verification_points(
            meme_text,
            content_type
        )


        # -------------------------------------------------
        # FACT CHECK DECISION
        # -------------------------------------------------

        if content_type in ["humor/joke", "opinion"]:

            fact_check_required = False

        else:

            fact_check_required = True


        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        result = {

            "content_type": content_type,

            "claim": claim,

            "fact_check_required": fact_check_required,

            "accuracy_score": accuracy,

            "misinformation_risk": risk,

            "verdict": verdict,

            "reason": reason,

            "verification_points": verification_points

        }


        print("")
        print("======================================")
        print("⚖️ MEME COURT CASE")
        print("======================================")
        print("Meme:", meme_text)
        print("Type:", content_type)
        print("Accuracy:", accuracy)
        print("Risk:", risk)
        print("Verdict:", verdict)
        print("======================================")
        print("")


        return jsonify(result)


    except Exception as e:

        print("ERROR:", str(e))

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    print("")
    print("======================================")
    print("⚖️  MEME COURT IS STARTING...")
    print("======================================")
    print("🚫 OpenAI API is NOT being used.")
    print("💰 No API credits required.")
    print("🧠 Running local demo analysis.")
    print("")
    print("🌐 http://127.0.0.1:5000")
    print("")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )