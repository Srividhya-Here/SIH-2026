import pandas as pd

FILE = "data/raw/08_game_recommendation_FINAL_10000.csv"

df = pd.read_csv(FILE)

print("\n===== SHAPE =====")
print(df.shape)

print("\n===== COLUMNS =====")
print(df.columns.tolist())

print("\n===== MISSING VALUES =====")
print(df.isnull().sum())

print("\n===== RECOMMENDED GAMES =====")
print(df["recommended_game"].value_counts())

print("\n===== RECENT GAMES =====")
print(df["recent_game"].value_counts())

print("\n===== REASONS =====")
print(df["reason"].value_counts())

print("\n===== FIRST 10 ROWS =====")
print(df.head(10).to_string())