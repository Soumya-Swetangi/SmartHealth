from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class PredictionInput(BaseModel):
    state: str = Field(
        default="Assam",
        description="Northeast Indian state name (e.g., Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, Sikkim)",
    )
    district: str = Field(
        default="Kamrup",
        description="District name within the state",
    )
    village: Optional[str] = Field(
        default="Central Village",
        description="Optional village or locality label for record keeping",
    )
    rainfall_mm: float = Field(
        default=185.0,
        ge=0.0,
        le=2000.0,
        description="Weekly rainfall in millimeters (mm)",
    )
    temperature_c: float = Field(
        default=28.5,
        ge=-10.0,
        le=55.0,
        description="Average ambient temperature in degrees Celsius",
    )
    humidity_percent: float = Field(
        default=82.0,
        ge=0.0,
        le=100.0,
        description="Relative humidity percentage (0-100)",
    )
    water_ph: float = Field(
        default=6.4,
        ge=0.0,
        le=14.0,
        description="Measured drinking water pH level (0-14)",
    )
    turbidity_ntu: float = Field(
        default=14.5,
        ge=0.0,
        le=1000.0,
        description="Water turbidity in Nephelometric Turbidity Units (NTU)",
    )
    water_contamination: int = Field(
        default=1,
        ge=0,
        le=1,
        description="Binary indicator (0 or 1) for bacterial/coliform water contamination",
    )
    sanitation_risk_score: float = Field(
        default=6.8,
        ge=1.0,
        le=10.0,
        description="Community sanitation risk score from 1 (best) to 10 (highest risk)",
    )
    population_density: float = Field(
        default=420.0,
        ge=1.0,
        le=50000.0,
        description="Population density (persons per sq km)",
    )
    recent_diarrheal_cases: int = Field(
        default=12,
        ge=0,
        le=10000,
        description="Number of diarrheal cases reported in the past 7 days",
    )
    historical_outbreak_count: int = Field(
        default=2,
        ge=0,
        le=100,
        description="Count of historical water-borne outbreaks in this district",
    )
    monsoon_indicator: int = Field(
        default=1,
        ge=0,
        le=1,
        description="1 if current week is during monsoon season (May-Sep), else 0",
    )
    model_choice: Literal["best_model", "random_forest", "xgboost"] = Field(
        default="best_model",
        description="Which trained artifact to use for primary classification",
    )


class PredictedDiseaseItem(BaseModel):
    disease: str
    probability: float


class ContributingFactorItem(BaseModel):
    factor: str
    impact: str
    detail: str


class PredictionResponse(BaseModel):
    state: str
    district: str
    village: str
    model: str
    model_choice: str
    modelVersion: str
    risk_probability: float
    riskScore: float
    riskLevel: Literal["low", "moderate", "high", "critical"]
    risk_classification: Literal["Low", "Moderate", "High", "Critical"]
    predicted_outbreak: bool
    prediction_horizon: str
    confidence: float
    rf_probability: float
    xgb_probability: float
    predictionDate: str
    targetWeekStart: str
    targetWeekEnd: str
    features: Dict[str, Any]
    predictedDiseases: List[PredictedDiseaseItem]
    contributing_factors: List[ContributingFactorItem]
    training_data_type: str
    isDataSynthetic: bool
    disclaimer: str
