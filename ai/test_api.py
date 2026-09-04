import requests

BASE_URL = "http://127.0.0.1:8000"


def check(name, response):
    print(f"\n{name}")
    print("Status:", response.status_code)
    print("Response:", response.json())


# 1. Health check
response = requests.get(f"{BASE_URL}/")
check("1. Health Check", response)


# 2. Adaptive difficulty
difficulty_data = {
    "age": 65,
    "game_type": "memory_cards",
    "difficulty": 3,
    "accuracy": 0.95,
    "reaction_time_sec": 2.0,
    "error_count": 1,
    "hint_count": 0,
    "attempt_count": 1,
    "completion_time_sec": 60,
    "streak_days": 5,
    "previous_score": 90,
    "rolling_7day_score": 88,
    "baseline_score": 80,
    "baseline_difference": 8,
    "session_duration_sec": 300,
    "fatigue_signal": 0.1,
    "memory_score": 90,
    "attention_score": 88,
    "recognition_score": 92,
    "recall_score": 89,
    "processing_speed_score": 87,
    "engagement_score": 91,
    "content_familiarity": "high",
    "voice_used": 0,
    "offline_mode": 0
}

response = requests.post(
    f"{BASE_URL}/predict-difficulty",
    json=difficulty_data
)
check("2. Adaptive Difficulty", response)


# 3. Game recommendation
recommendation_data = {
    "memory_score": 60,
    "attention_score": 80,
    "recognition_score": 75,
    "recall_score": 70,
    "recent_game": "memory_cards"
}

response = requests.post(
    f"{BASE_URL}/recommend-game",
    json=recommendation_data
)
check("3. Game Recommendation", response)


# 4. Voice intent
voice_data = {
    "language": "Bengali",
    "text": "মেমোরি গেম শুরু করো"
}

response = requests.post(
    f"{BASE_URL}/predict-intent",
    json=voice_data
)
check("4. Voice Intent", response)


# 5. Cognitive trend
response = requests.get(
    f"{BASE_URL}/cognitive-trend/P00001?days=7"
)
check("5. Cognitive Trend", response)


# 6. Cultural content
response = requests.get(
    f"{BASE_URL}/cultural-content",
    params={
        "state": "Arunachal Pradesh",
        "language": "Hindi",
        "difficulty": "easy"
    }
)
check("6. Cultural Content", response)


# 7. Reminder analytics
response = requests.get(
    f"{BASE_URL}/reminder-analytics/P00383"
)
check("7. Reminder Analytics", response)


print("\nALL API TESTS COMPLETED")
