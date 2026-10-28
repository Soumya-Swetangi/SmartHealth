import json
import pathlib
from functools import lru_cache
from typing import Any, Dict

import joblib

# Path relative to this file -> smart-health-northeast/ml-service/models/
MODEL_DIR = pathlib.Path(__file__).resolve().parent / "models"


class ModelNotReadyError(RuntimeError):
    """Raised when required model artifacts are missing."""


@lru_cache(maxsize=1)
def get_ml_bundle() -> Dict[str, Any]:
    """Load and cache preprocessor, trained models, and evaluation metrics."""
    preprocessor_path = MODEL_DIR / "preprocessor.joblib"
    best_model_path = MODEL_DIR / "best_model.joblib"
    rf_path = MODEL_DIR / "random_forest.joblib"
    xgb_path = MODEL_DIR / "xgboost.joblib"
    eval_path = MODEL_DIR / "evaluation.json"

    if not preprocessor_path.is_file() or not best_model_path.is_file():
        raise ModelNotReadyError(
            f"Model files not found at {MODEL_DIR}. "
            "Run `python -m scripts.generate_synthetic_data` and `python -m scripts.train_model` first."
        )

    preprocessor = joblib.load(preprocessor_path)
    best_model = joblib.load(best_model_path)
    rf_model = joblib.load(rf_path) if rf_path.is_file() else best_model
    xgb_model = joblib.load(xgb_path) if xgb_path.is_file() else best_model

    evaluation: Dict[str, Any] = {}
    if eval_path.is_file():
        with open(eval_path, "r", encoding="utf-8") as fh:
            evaluation = json.load(fh)

    return {
        "preprocessor": preprocessor,
        "best_model": best_model,
        "random_forest": rf_model,
        "xgboost": xgb_model,
        "evaluation": evaluation,
        "model_dir": str(MODEL_DIR),
    }


@lru_cache(maxsize=1)
def get_model():
    """Return the primary best_model estimator for backward compatibility."""
    bundle = get_ml_bundle()
    return bundle["best_model"]
