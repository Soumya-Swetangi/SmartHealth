"""Train and evaluate two classifiers on the synthetic outbreak data.

Outputs (placed under `ml-service/models/`):
  - preprocessor.joblib          – sklearn ColumnTransformer
  - random_forest.joblib         – trained RandomForestClassifier
  - xgboost.joblib               – trained XGBClassifier
  - best_model.joblib            – the model with higher ROC‑AUC on the test set
  - evaluation.json              – metrics for *both* models and the chosen winner
"""

import json
import pathlib
import warnings
from typing import Dict

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# XGBoost can emit a lot of convergence warnings on Windows – silence them for a cleaner log
warnings.filterwarnings("ignore", category=UserWarning)

# ----------------------------------------------------------------------
# Helper utilities
# ----------------------------------------------------------------------
def chronological_split(df: pd.DataFrame, test_size: float = 0.15, val_size: float = 0.15):
    """Split by (year, week) so training contains the earliest weeks.
    Returns train, val, test DataFrames.
    """
    df = df.sort_values(["year", "week"]).reset_index(drop=True)
    n = len(df)
    test_end = int(n * (1 - test_size))
    val_end = int(test_end * (1 - val_size / (1 - test_size)))
    train = df.iloc[:val_end]
    val = df.iloc[val_end:test_end]
    test = df.iloc[test_end:]
    return train, val, test


def build_preprocessor(categorical: list, numeric: list) -> ColumnTransformer:
    cat_pipe = OneHotEncoder(handle_unknown="ignore")
    num_pipe = StandardScaler()
    return ColumnTransformer(
        transformers=[
            ("cat", cat_pipe, categorical),
            ("num", num_pipe, numeric),
        ]
    )


def evaluate_model(model, X_test, y_test) -> Dict:
    probs = model.predict_proba(X_test)[:, 1]
    preds = (probs >= 0.5).astype(int)
    return {
        "accuracy": accuracy_score(y_test, preds),
        "precision": classification_report(y_test, preds, output_dict=True)["1"]["precision"],
        "recall": classification_report(y_test, preds, output_dict=True)["1"]["recall"],
        "f1": classification_report(y_test, preds, output_dict=True)["1"]["f1-score"],
        "roc_auc": roc_auc_score(y_test, probs),
        "confusion_matrix": confusion_matrix(y_test, preds).tolist(),
        "positive_rate": int(y_test.sum()),
        "total": int(len(y_test)),
    }


def main():
    # ------------------------------------------------------------------
    # Load data
    # ------------------------------------------------------------------
    data_path = (
        pathlib.Path(__file__).resolve().parents[1]
        / "data"
        / "synthetic"
        / "synthetic_outbreak_training.csv"
    )
    df = pd.read_csv(data_path)

    # Define features / target
    TARGET = "outbreak_next_7_days"
    FEATURE_COLS = [
        "state",
        "district",
        "rainfall_mm",
        "temperature_c",
        "humidity_percent",
        "water_ph",
        "turbidity_ntu",
        "water_contamination",
        "sanitation_risk_score",
        "population_density",
        "recent_diarrheal_cases",
        "historical_outbreak_count",
        "monsoon_indicator",
    ]

    # ------------------------------------------------------------------
    # Chronological train/val/test split
    # ------------------------------------------------------------------
    train_df, val_df, test_df = chronological_split(df)
    X_train, y_train = train_df[FEATURE_COLS], train_df[TARGET]
    X_val, y_val = val_df[FEATURE_COLS], val_df[TARGET]
    X_test, y_test = test_df[FEATURE_COLS], test_df[TARGET]

    # ------------------------------------------------------------------
    # Pre‑processing pipeline
    # ------------------------------------------------------------------
    categorical_features = ["state", "district"]
    numeric_features = [c for c in FEATURE_COLS if c not in categorical_features]
    preprocessor = build_preprocessor(categorical_features, numeric_features)

    # ------------------------------------------------------------------
    # Model definitions
    # ------------------------------------------------------------------
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        random_state=42,
        n_jobs=-1,
    )
    # Import XGBClassifier lazily to avoid import error if xgboost missing
    from xgboost import XGBClassifier

    xgb = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.9,
        colsample_bytree=0.9,
        objective="binary:logistic",
        eval_metric="logloss",
        use_label_encoder=False,
        random_state=42,
        n_jobs=-1,
    )

    # ------------------------------------------------------------------
    # Build pipelines
    # ------------------------------------------------------------------
    rf_pipe = Pipeline([("preproc", preprocessor), ("clf", rf)])
    xgb_pipe = Pipeline([("preproc", preprocessor), ("clf", xgb)])

    # ------------------------------------------------------------------
    # Train models
    # ------------------------------------------------------------------
    print("🚂 Training RandomForest …")
    rf_pipe.fit(X_train, y_train)

    print("🚂 Training XGBoost …")
    xgb_pipe.fit(X_train, y_train)

    # ------------------------------------------------------------------
    # Evaluate on test set
    # ------------------------------------------------------------------
    print("\n🔎 Evaluating on TEST set …")
    rf_metrics = evaluate_model(rf_pipe, X_test, y_test)
    xgb_metrics = evaluate_model(xgb_pipe, X_test, y_test)

    # ------------------------------------------------------------------
    # Choose best model (higher ROC‑AUC)
    # ------------------------------------------------------------------
    if rf_metrics["roc_auc"] >= xgb_metrics["roc_auc"]:
        best_name, best_pipe, best_metrics = "RandomForest", rf_pipe, rf_metrics
    else:
        best_name, best_pipe, best_metrics = "XGBoost", xgb_pipe, xgb_metrics
    print(f"\n🏆 Best model according to ROC‑AUC: {best_name}")

    # ------------------------------------------------------------------
    # Save artifacts
    # ------------------------------------------------------------------
    out_dir = pathlib.Path(__file__).resolve().parents[1] / "models"
    out_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(preprocessor, out_dir / "preprocessor.joblib")
    joblib.dump(rf_pipe.named_steps["clf"], out_dir / "random_forest.joblib")
    joblib.dump(xgb_pipe.named_steps["clf"], out_dir / "xgboost.joblib")
    joblib.dump(best_pipe.named_steps["clf"], out_dir / "best_model.joblib")

    evaluation = {
        "random_forest": rf_metrics,
        "xgboost": xgb_metrics,
        "chosen_model": {
            "name": best_name,
            "metrics": best_metrics,
        },
    }
    with open(out_dir / "evaluation.json", "w", encoding="utf-8") as f:
        json.dump(evaluation, f, indent=2)

    print("\n✅ All artifacts saved under:", out_dir)
    print("   - preprocessor.joblib")
    print("   - random_forest.joblib")
    print("   - xgboost.joblib")
    print("   - best_model.joblib")
    print("   - evaluation.json")


if __name__ == "__main__":
    main()
