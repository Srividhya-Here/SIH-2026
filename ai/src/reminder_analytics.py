from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "raw" / "05_reminder_events_FINAL_20000.csv"


def get_reminder_analytics(patient_id: str):
    df = pd.read_csv(DATA_PATH)

    patient_df = df[
        df["patient_id"].astype(str) == str(patient_id)
    ].copy()

    if patient_df.empty:
        return None

    total = len(patient_df)
    completed = int(patient_df["completed"].sum())
    missed = total - completed

    completion_rate = (completed / total) * 100

    average_delay = float(
        patient_df["delay_minutes"].mean()
    )

    by_type = {}

    for reminder_type, group in patient_df.groupby("reminder_type"):
        type_total = len(group)
        type_completed = int(group["completed"].sum())

        by_type[reminder_type] = {
            "total": type_total,
            "completed": type_completed,
            "completion_rate": round(
                (type_completed / type_total) * 100, 2
            )
        }

    return {
        "patient_id": str(patient_id),
        "total_reminders": total,
        "completed": completed,
        "missed": missed,
        "completion_rate": round(completion_rate, 2),
        "average_delay_minutes": round(average_delay, 2),
        "by_type": by_type
    }