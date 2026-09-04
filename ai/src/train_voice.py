import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report


# ============================================================
# 1. LOAD DATA
# ============================================================

DATA_PATH = "data/raw/06_voice_intent_ALL.csv"
df = pd.read_csv(DATA_PATH)

print("Dataset shape:", df.shape)


# ============================================================
# 2. CREATE MODEL INPUT
# ============================================================

# Include language together with the utterance.
#
# Example:
#
# English Start the memory game
# Hindi    मेमोरी गेम शुरू करो
# Assamese ...
#
# This allows the classifier to learn multilingual patterns.

df["model_text"] = (
    df["language"].astype(str)
    + " "
    + df["text"].astype(str)
)


X = df["model_text"]
y = df["intent"]


# ============================================================
# 3. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training rows:", len(X_train))
print("Testing rows:", len(X_test))


# ============================================================
# 4. CREATE NLP PIPELINE
# ============================================================

pipeline = Pipeline(
    steps=[
        (
            "tfidf",
            TfidfVectorizer(
                analyzer="char",
                ngram_range=(2, 5),
                min_df=1,
                sublinear_tf=True
            )
        ),

        (
            "classifier",
            LogisticRegression(
                max_iter=2000,
                C=5.0,
                random_state=42
            )
        )
    ]
)


# ============================================================
# 5. TRAIN
# ============================================================

print("\nTraining voice intent model...")

pipeline.fit(
    X_train,
    y_train
)

print("Training complete!")


# ============================================================
# 6. EVALUATE
# ============================================================

predictions = pipeline.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n========================================")
print("VOICE MODEL RESULTS")
print("========================================")

print(f"\nAccuracy: {accuracy:.4f}")

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions
    )
)


# ============================================================
# 7. SAVE MODEL
# ============================================================

MODEL_PATH = "models/voice_intent_model.joblib"

joblib.dump(
    pipeline,
    MODEL_PATH
)

print("\n========================================")
print("MODEL SAVED")
print("========================================")

print(MODEL_PATH)






