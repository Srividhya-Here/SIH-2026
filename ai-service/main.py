from fastapi import FastAPI

app = FastAPI(title="NER Care AI Service")


from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="NER Care AI Service")


class GameData(BaseModel):
    accuracy: float
    reactionTime: float
    errorRate: float
    attempts: int
    hintUsage: int
    completionTime: float
    previousScore: float
    streak: int
    gameType: str
    currentDifficulty: str


@app.get("/")
def home():
    return {
        "message": "NER Care AI Service is running"
    }


@app.post("/predict-difficulty")
def predict_difficulty(data: GameData):

    if (
        data.accuracy >= 0.85
        and data.errorRate <= 0.15
        and data.reactionTime <= 3
        and data.previousScore >= 80
    ):
        if data.currentDifficulty == "EASY":
            recommendation = "MEDIUM"
        elif data.currentDifficulty == "MEDIUM":
            recommendation = "HARD"
        else:
            recommendation = "HARD"

        action = "INCREASE"

    elif (
        data.accuracy < 0.60
        or data.errorRate > 0.40
        or data.reactionTime > 6
    ):
        if data.currentDifficulty == "HARD":
            recommendation = "MEDIUM"
        elif data.currentDifficulty == "MEDIUM":
            recommendation = "EASY"
        else:
            recommendation = "EASY"

        action = "DECREASE"

    else:
        recommendation = data.currentDifficulty
        action = "MAINTAIN"

    return {
        "gameType": data.gameType,
        "currentDifficulty": data.currentDifficulty,
        "recommendedDifficulty": recommendation,
        "action": action
    }