import sys
import pathlib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

ML_ROOT = pathlib.Path(__file__).resolve().parent.parent
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from model_loader import ModelNotReadyError, get_ml_bundle
from .prediction import FEATURE_COLUMNS, MODEL_DISCLAIMER, router as prediction_router

app = FastAPI(
    title="SmartHealth NE — Outbreak Prediction Service",
    description="FastAPI service running trained Random Forest and XGBoost classifiers for 7-day water-borne disease outbreak risk in Northeast India.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    try:
        bundle = get_ml_bundle()
        best_name = bundle.get("evaluation", {}).get("best_model", "xgboost")
        return {
            "status": "ok",
            "models_loaded": True,
            "best_model": best_name,
            "training_data_type": "Northeast India District-Week Surveillance Data",
        }
    except Exception as exc:
        return {
            "status": "degraded",
            "models_loaded": False,
            "error": str(exc),
        }


@app.get("/model/info")
async def model_info():
    try:
        bundle = get_ml_bundle()
    except ModelNotReadyError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    return {
        "status": "ready",
        "modelVersion": "1.0.0-ne",
        "training_data_type": "Northeast India District-Week Surveillance Data",
        "isDataSynthetic": False,
        "disclaimer": MODEL_DISCLAIMER,
        "feature_columns": FEATURE_COLUMNS,
        "evaluation": bundle.get("evaluation", {}),
    }


app.include_router(prediction_router, prefix="/predict", tags=["prediction"])
