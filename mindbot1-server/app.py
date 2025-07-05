from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "https://mindbot1cd.netlify.app"  
])

@app.route("/")
def home():
    return "MindBot backend is live!"

motivational_quotes = [
    "Believe you can and you're halfway there.",
    "You are stronger than you think.",
    "Every day is a second chance."
]

jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!"
]

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()

    message = data.get('message', '')
    emotion = data.get('emotion', '')
    context = data.get('context', '')

    detected_emotion = detect_emotion(message)

    suggestion = ""
    follow_up = {}

    if context == "home":
        suggestion = "You're at home — maybe try a short meditation session? 🧘"
    elif context == "office":
        suggestion = "You're at work — how about a quick desk stretch? 🪑"

    # Custom interventions
    if detected_emotion == "sad":
        follow_up = {
            "type": "youtube",
            "url": "https://www.youtube.com/embed/ZToicYcHIOU",
            "message": "Here's a calming meditation that might help:"
        }
    elif detected_emotion == "happy":
        follow_up = {
            "type": "joke",
            "message": random.choice(jokes)
        }
    elif detected_emotion == "angry":
        follow_up = {
            "type": "quote",
            "message": random.choice(motivational_quotes)
        }

    bot_reply = f'You said: "{message}". I sense you\'re feeling {detected_emotion}. {suggestion}'

    return jsonify({
        "bot_reply": bot_reply,
        "emotion": detected_emotion,
        "intervention": follow_up
    })

def detect_emotion(message):
    message = message.lower()

    elongated_words = ["yayyyy", "okayy", "nooooo", "yeessss"]
    short_words = ["ok", "no", "hmm", "fine"]

    if any(word in message for word in elongated_words):
        return "excited"
    elif any(word in message for word in short_words):
        return "neutral"
    elif any(word in message for word in ["sad", "upset", "tired", "depressed", "down"]):
        return "sad"
    elif any(word in message for word in ["happy", "great", "good", "awesome", "joy"]):
        return "happy"
    elif any(word in message for word in ["angry", "mad", "frustrated", "annoyed"]):
        return "angry"
    else:
        return "neutral"


