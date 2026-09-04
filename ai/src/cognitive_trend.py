import pandas as pd

DATA_PATH = "data/raw/04_daily_cognitive_metrics_FINAL_60000.csv"


def get_cognitive_trend(patient_id: str, days: int = 7):
    df = pd.read_csv(DATA_PATH)

    patient_df = df[df["patient_id"].astype(str) == str(patient_id)].copy()

    if patient_df.empty:
        return None

    patient_df = patient_df.sort_values("day").tail(days)

    score_columns = [
        "memory_score",
        "attention_score",
        "recognition_score",
        "recall_score",
        "processing_speed_score",
        "engagement_score",
    ]

    trends = {}

    for column in score_columns:
        values = patient_df[column].astype(float).tolist()

        if len(values) < 2:
            trends[column] = "insufficient_data"
            continue

        change = values[-1] - values[0]

        if change > 3:
            trends[column] = "improving"
        elif change < -3:
            trends[column] = "declining"
        else:
            trends[column] = "stable"

    return {
        "patient_id": str(patient_id),
        "days_analyzed": len(patient_df),
        "trends": trends,
        "latest_scores": {
            column: round(float(patient_df[column].iloc[-1]), 2)
            for column in score_columns
        },
    }