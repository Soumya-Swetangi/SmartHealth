import pandas as pd
import numpy as np
import sys
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score
import joblib

FEATURES = [
    "report_year",
    "month",
    "cases",
    "deaths",
    "rainfall_mm",
    "state_code",
    "district_code",
]
TARGET = "high_risk"

def load_data(csv_path: str):
    df = pd.read_csv(csv_path)
    # ensure correct ordering for chronological split
    df = df.sort_values(["report_year", "month"], ascending=True).reset_index(drop=True)
    return df

def split_chronological(df, train_frac=0.8):
    split_idx = int(len(df) * train_frac)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]
    return train_df, test_df

def train_models(train_X, train_y, test_X, test_y):
    results = {}
    # Logistic Regression (liblinear for small data)
    lr = LogisticRegression(max_iter=1000, solver='liblinear')
    lr.fit(train_X, train_y)
    pred_lr = lr.predict(test_X)
    prob_lr = lr.predict_proba(test_X)[:, 1]
    results["logistic"] = {
        "model": lr,
        "accuracy": accuracy_score(test_y, pred_lr),
        "precision": precision_score(test_y, pred_lr, zero_division=0),
        "recall": recall_score(test_y, pred_lr, zero_division=0),
        "roc_auc": roc_auc_score(test_y, prob_lr),
    }
    # Random Forest
    rf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    rf.fit(train_X, train_y)
    pred_rf = rf.predict(test_X)
    prob_rf = rf.predict_proba(test_X)[:, 1]
    results["random_forest"] = {
        "model": rf,
        "accuracy": accuracy_score(test_y, pred_rf),
        "precision": precision_score(test_y, pred_rf, zero_division=0),
        "recall": recall_score(test_y, pred_rf, zero_division=0),
        "roc_auc": roc_auc_score(test_y, prob_rf),
    }
    return results

def print_report(results):
    print("=== Model Evaluation ===")
    for name, info in results.items():
        print(f"{name}:")
        print(f"  Accuracy : {info['accuracy']:.4f}")
        print(f"  Precision: {info['precision']:.4f}")
        print(f"  Recall   : {info['recall']:.4f}")
        print(f"  ROC‑AUC  : {info['roc_auc']:.4f}\n")

def main():
    csv_path = r'C:\Users\pc\OneDrive\Desktop\smart-health-northeast\ml-service\data\processed\training_features.csv'
    model_dir = Path(r'C:\Users\pc\OneDrive\Desktop\smart-health-northeast\ml-service\models')
    model_dir.mkdir(parents=True, exist_ok=True)

    df = load_data(csv_path)
    if df[TARGET].nunique() < 2:
        print('⚠️ Target column has only one class – cannot train supervised model.')
        sys.exit(0)

    train_df, test_df = split_chronological(df)
    train_X = train_df[FEATURES]
    train_y = train_df[TARGET]
    test_X = test_df[FEATURES]
    test_y = test_df[TARGET]

    results = train_models(train_X, train_y, test_X, test_y)
    print_report(results)

    # Choose best model by ROC‑AUC
    best_name = max(results, key=lambda k: results[k]["roc_auc"])
    best_model = results[best_name]["model"]
    model_path = model_dir / "outbreak_model.joblib"
    joblib.dump(best_model, model_path)
    print(f"✅ Saved best model ({best_name}) to {model_path}")

if __name__ == '__main__':
    main()
