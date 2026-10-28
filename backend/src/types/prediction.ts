export interface PredictionRequestPayload {
    state: string;
    district: string;
    village?: string;
    rainfall_mm: number;
    temperature_c: number;
    humidity_percent: number;
    water_ph: number;
    turbidity_ntu: number;
    water_contamination: number;
    sanitation_risk_score: number;
    population_density: number;
    recent_diarrheal_cases: number;
    historical_outbreak_count: number;
    monsoon_indicator: number;
    model_choice?: 'best_model' | 'random_forest' | 'xgboost';
}

export interface PredictedDisease {
    disease: string;
    probability: number;
}

export interface ContributingFactor {
    factor: string;
    impact: string;
    detail: string;
}

export interface PredictionResponsePayload {
    state: string;
    district: string;
    village: string;
    model: string;
    model_choice: string;
    modelVersion: string;
    risk_probability: number;
    riskScore: number;
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    risk_classification: 'Low' | 'Moderate' | 'High' | 'Critical';
    predicted_outbreak: boolean;
    prediction_horizon: string;
    confidence: number;
    rf_probability: number;
    xgb_probability: number;
    predictionDate: string;
    targetWeekStart: string;
    targetWeekEnd: string;
    features: Record<string, any>;
    predictedDiseases: PredictedDisease[];
    contributing_factors: ContributingFactor[];
    training_data_type: string;
    isDataSynthetic: boolean;
    disclaimer: string;
}
