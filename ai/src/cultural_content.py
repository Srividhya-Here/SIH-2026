from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "raw" / "02_ner_cultural_content.csv"


def get_cultural_content(
    state: str,
    language: str,
    difficulty: str | None = None
):
    df = pd.read_csv(DATA_PATH)

    result = df[
        (df["state"].str.lower() == state.lower()) &
        (df["language"].str.lower() == language.lower())
    ].copy()

    if difficulty:
        result = result[
            result["default_difficulty"].str.lower() == difficulty.lower()
        ]

    if result.empty:
        return []

    return result[
        [
            "content_id",
            "state",
            "language",
            "item_name",
            "category",
            "default_difficulty"
        ]
    ].to_dict(orient="records")