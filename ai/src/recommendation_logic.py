import pandas as pd


FILE = "data/raw/08_game_recommendation_FINAL_10000.csv"

df = pd.read_csv(FILE)


def rule_recommendation(row):

    scores = {
        "memory_cards": row["memory_score"],
        "pattern_recognition": row["attention_score"],
        "object_recognition": row["recognition_score"],
        "routine_recall": row["recall_score"],
    }

    return min(scores, key=scores.get)


df["rule_recommendation"] = df.apply(
    rule_recommendation,
    axis=1
)


matches = (
    df["rule_recommendation"]
    == df["recommended_game"]
)

accuracy = matches.mean()


print("\n========================================")
print("RECOMMENDATION RULE CHECK")
print("========================================")

print(f"\nRows checked: {len(df)}")
print(f"Rule agreement: {accuracy:.4f}")
print(f"Agreement percentage: {accuracy * 100:.2f}%")


print("\n===== EXAMPLES =====")

print(
    df[
        [
            "memory_score",
            "attention_score",
            "recognition_score",
            "recall_score",
            "recent_game",
            "recommended_game",
            "rule_recommendation"
        ]
    ].head(10).to_string(index=False)
)