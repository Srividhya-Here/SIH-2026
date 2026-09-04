from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.reminder_analytics import get_reminder_analytics
from src.cultural_content import get_cultural_content
from src.cognitive_trend import get_cognitive_trend


BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# LOAD ADAPTIVE DIFFICULTY MODEL
# ============================================================

MODEL_PATH = BASE_DIR / "models" / "adaptive_difficulty_xgboost.joblib"

model_data = joblib.load(MODEL_PATH)

model = model_data["model"]
label_encoder = model_data["label_encoder"]
feature_columns = model_data["feature_columns"]


# ============================================================
# LOAD VOICE INTENT MODEL
# ============================================================

VOICE_MODEL_PATH = BASE_DIR / "models" / "voice_intent_model.joblib"

voice_model = joblib.load(VOICE_MODEL_PATH)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Memora",
    description="AI-powered cognitive assistance and game adaptation API",
    version="1.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# INPUT MODELS
# ============================================================

class GameplayInput(BaseModel):
    age: int
    game_type: str
    difficulty: int
    accuracy: float
    reaction_time_sec: float
    error_count: int
    hint_count: int
    attempt_count: int
    completion_time_sec: float
    streak_days: int
    previous_score: float
    rolling_7day_score: float
    baseline_score: float
    baseline_difference: float
    session_duration_sec: float
    fatigue_signal: float
    memory_score: float
    attention_score: float
    recognition_score: float
    recall_score: float
    processing_speed_score: float
    engagement_score: float
    content_familiarity: str
    voice_used: int
    offline_mode: int


class RecommendationInput(BaseModel):
    memory_score: float
    attention_score: float
    recognition_score: float
    recall_score: float
    recent_game: str


class VoiceInput(BaseModel):
    language: str
    text: str


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "service": "Memora",
        "status": "running"
    }


# ============================================================
# ADAPTIVE DIFFICULTY
# ============================================================

@app.post("/predict-difficulty")
def predict_difficulty(data: GameplayInput):

    input_data = pd.DataFrame([data.model_dump()])

    input_data = pd.get_dummies(
        input_data,
        columns=["game_type", "content_familiarity"]
    )

    input_data = input_data.reindex(
        columns=feature_columns,
        fill_value=0
    )

    probabilities = model.predict_proba(input_data)[0]

    predicted_class = model.predict(input_data)[0]

    action = label_encoder.inverse_transform(
        [predicted_class]
    )[0]

    confidence = float(max(probabilities))

    current_difficulty = int(data.difficulty)

    if action == "increase":
        next_difficulty = current_difficulty + 1

    elif action == "decrease":
        next_difficulty = current_difficulty - 1

    else:
        next_difficulty = current_difficulty

    # Safety clamp: difficulty must remain between 1 and 5
    next_difficulty = max(
        1,
        min(5, next_difficulty)
    )

    return {
        "action": action,
        "current_difficulty": current_difficulty,
        "next_difficulty": next_difficulty,
        "confidence": round(confidence, 4)
    }


# ============================================================
# GAME RECOMMENDATION
# ============================================================

@app.post("/recommend-game")
def recommend_game(data: RecommendationInput):

    scores = {
        "memory_cards": data.memory_score,
        "pattern_recognition": data.attention_score,
        "object_recognition": data.recognition_score,
        "routine_recall": data.recall_score
    }

    recommended_game = min(
        scores,
        key=scores.get
    )

    reasons = {
        "memory_cards": "Prioritize memory practice based on recent performance",
        "pattern_recognition": "Prioritize attention and pattern practice based on recent performance",
        "object_recognition": "Prioritize recognition practice based on recent performance",
        "routine_recall": "Prioritize recall practice based on recent performance"
    }

    return {
        "recommended_game": recommended_game,
        "reason": reasons[recommended_game],
        "weakest_score": round(
            float(scores[recommended_game]),
            2
        ),
        "recent_game": data.recent_game
    }


# ============================================================
# VOICE INTENT
# ============================================================

@app.post("/predict-intent")
def predict_intent(data: VoiceInput):

    model_text = f"{data.language} {data.text}"

    predicted_intent = voice_model.predict(
        [model_text]
    )[0]

    probabilities = voice_model.predict_proba(
        [model_text]
    )[0]

    confidence = float(max(probabilities))

    return {
        "language": data.language,
        "text": data.text,
        "intent": predicted_intent,
        "confidence": round(confidence, 4)
    }


# ============================================================
# COGNITIVE TREND
# ============================================================

@app.get("/cognitive-trend/{patient_id}")
def cognitive_trend(
    patient_id: str,
    days: int = 7
):

    result = get_cognitive_trend(
        patient_id,
        days
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return result


# ============================================================
# CULTURAL CONTENT
# ============================================================

@app.get("/cultural-content")
def cultural_content(
    state: str,
    language: str,
    difficulty: str | None = None
):

    result = get_cultural_content(
        state,
        language,
        difficulty
    )

    return {
        "state": state,
        "language": language,
        "difficulty": difficulty,
        "count": len(result),
        "content": result
    }


# ============================================================
# REMINDER ANALYTICS
# ============================================================

@app.get("/reminder-analytics/{patient_id}")
def reminder_analytics(
    patient_id: str
):

    result = get_reminder_analytics(
        patient_id
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return result