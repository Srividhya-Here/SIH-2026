import pandas as pd

file = "data/raw/03_gameplay_telemetry_FINAL_50000.csv"

df = pd.read_csv(file)

print("\n===== SHAPE =====")
print(df.shape)

print("\n===== COLUMNS =====")
print(df.columns.tolist())

print("\n===== DATA TYPES =====")
print(df.dtypes)

print("\n===== MISSING VALUES =====")
print(df.isnull().sum())

print("\n===== TARGET: recommended_next_action =====")
print(df["recommended_next_action"].value_counts())

print("\n===== TARGET: recommended_next_difficulty =====")
print(df["recommended_next_difficulty"].value_counts())

print("\n===== GAME TYPES =====")
print(df["game_type"].value_counts())

print("\n===== DIFFICULTY =====")
print(df["difficulty"].value_counts())

print("\n===== FIRST 5 ROWS =====")
print(df.head())