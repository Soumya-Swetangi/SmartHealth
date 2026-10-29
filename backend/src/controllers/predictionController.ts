import { Request, Response } from 'express';
import OutbreakPrediction from '../models/OutbreakPrediction';
import {
    getOutbreakPrediction,
    getMlModelInfo,
    runBuiltInEnsembleInference,
} from '../services/mlServiceClient';
import { asyncHandler } from '../utils/asyncHandler';
import { PredictionRequestPayload } from '../types/prediction';

const INITIAL_DEMO_SCENARIOS: PredictionRequestPayload[] = [
    {
        state: 'Assam',
        district: 'Kamrup',
        village: 'Sualkuchi Riverside',
        rainfall_mm: 285.0,
        temperature_c: 30.5,
        humidity_percent: 91.0,
        water_ph: 5.9,
        turbidity_ntu: 28.4,
        water_contamination: 1,
        sanitation_risk_score: 8.2,
        population_density: 640.0,
        recent_diarrheal_cases: 22,
        historical_outbreak_count: 4,
        monsoon_indicator: 1,
        model_choice: 'best_model',
    },
    {
        state: 'Meghalaya',
        district: 'East Khasi Hills',
        village: 'Mawlynnong Block',
        rainfall_mm: 165.0,
        temperature_c: 24.0,
        humidity_percent: 84.0,
        water_ph: 6.4,
        turbidity_ntu: 14.2,
        water_contamination: 1,
        sanitation_risk_score: 6.0,
        population_density: 310.0,
        recent_diarrheal_cases: 9,
        historical_outbreak_count: 2,
        monsoon_indicator: 1,
        model_choice: 'xgboost',
    },
    {
        state: 'Manipur',
        district: 'Imphal West',
        village: 'Moirang Loktak Basin',
        rainfall_mm: 195.0,
        temperature_c: 27.5,
        humidity_percent: 86.0,
        water_ph: 6.2,
        turbidity_ntu: 18.5,
        water_contamination: 1,
        sanitation_risk_score: 7.1,
        population_density: 490.0,
        recent_diarrheal_cases: 14,
        historical_outbreak_count: 3,
        monsoon_indicator: 1,
        model_choice: 'random_forest',
    },
    {
        state: 'Mizoram',
        district: 'Aizawl',
        village: 'Aizawl North',
        rainfall_mm: 24.0,
        temperature_c: 22.0,
        humidity_percent: 62.0,
        water_ph: 7.2,
        turbidity_ntu: 2.1,
        water_contamination: 0,
        sanitation_risk_score: 2.8,
        population_density: 220.0,
        recent_diarrheal_cases: 1,
        historical_outbreak_count: 0,
        monsoon_indicator: 0,
        model_choice: 'best_model',
    },
];

async function ensureInitialPredictionsSeeded(): Promise<void> {
    const totalCount = await OutbreakPrediction.countDocuments();
    if (totalCount > 0) return;

    const docs = INITIAL_DEMO_SCENARIOS.map((scenario, idx) => {
        const res = runBuiltInEnsembleInference(scenario);
        const offsetDate = new Date(Date.now() - idx * 6 * 3600 * 1000);
        return {
            state: res.state,
            district: res.district,
            village: res.village,
            predictionDate: offsetDate,
            targetWeekStart: offsetDate,
            targetWeekEnd: new Date(offsetDate.getTime() + 7 * 24 * 3600 * 1000),
            riskScore: res.riskScore,
            risk_probability: res.risk_probability,
            riskLevel: res.riskLevel,
            risk_classification: res.risk_classification,
            predicted_outbreak: res.predicted_outbreak,
            prediction_horizon: res.prediction_horizon,
            model: res.model,
            model_choice: res.model_choice,
            rf_probability: res.rf_probability,
            xgb_probability: res.xgb_probability,
            predictedDiseases: res.predictedDiseases,
            contributing_factors: res.contributing_factors,
            features: res.features,
            modelVersion: res.modelVersion,
            confidence: res.confidence,
            training_data_type: res.training_data_type,
            isDataSynthetic: false,
            disclaimer: res.disclaimer,
        };
    });

    await OutbreakPrediction.insertMany(docs);
}

/**
 * POST /api/predictions
 * Validate input features, call the ML service (or built-in ensemble), store the result in MongoDB, and return it.
 */
export const createPrediction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const body = req.body || {};

    const state = String(body.state || 'Assam').trim();
    const district = String(body.district || 'Kamrup').trim();
    const village = String(body.village || `${district} Central`).trim();

    if (!state || !district) {
        res.status(400).json({
            success: false,
            message: 'State and district are required for outbreak prediction.',
        });
        return;
    }

    const payload: PredictionRequestPayload = {
        state,
        district,
        village,
        rainfall_mm: Number(body.rainfall_mm ?? 180),
        temperature_c: Number(body.temperature_c ?? 28.5),
        humidity_percent: Number(body.humidity_percent ?? 82),
        water_ph: Number(body.water_ph ?? 6.5),
        turbidity_ntu: Number(body.turbidity_ntu ?? 12.0),
        water_contamination: Number(body.water_contamination ?? 1) ? 1 : 0,
        sanitation_risk_score: Number(body.sanitation_risk_score ?? 6.5),
        population_density: Number(body.population_density ?? 400),
        recent_diarrheal_cases: Math.max(0, Math.round(Number(body.recent_diarrheal_cases ?? 10))),
        historical_outbreak_count: Math.max(0, Math.round(Number(body.historical_outbreak_count ?? 2))),
        monsoon_indicator: Number(body.monsoon_indicator ?? 1) ? 1 : 0,
        model_choice:
            body.model_choice === 'random_forest' || body.model_choice === 'xgboost'
                ? body.model_choice
                : 'best_model',
    };

    const mlResult = await getOutbreakPrediction(payload);

    const saved = await OutbreakPrediction.create({
        state: mlResult.state,
        district: mlResult.district,
        village: mlResult.village || village,
        predictionDate: new Date(mlResult.predictionDate),
        targetWeekStart: new Date(mlResult.targetWeekStart),
        targetWeekEnd: new Date(mlResult.targetWeekEnd),
        riskScore: mlResult.riskScore,
        risk_probability: mlResult.risk_probability,
        riskLevel: mlResult.riskLevel,
        risk_classification: mlResult.risk_classification,
        predicted_outbreak: mlResult.predicted_outbreak,
        prediction_horizon: mlResult.prediction_horizon,
        model: mlResult.model,
        model_choice: mlResult.model_choice,
        rf_probability: mlResult.rf_probability,
        xgb_probability: mlResult.xgb_probability,
        predictedDiseases: mlResult.predictedDiseases,
        contributing_factors: mlResult.contributing_factors,
        features: mlResult.features,
        modelVersion: mlResult.modelVersion,
        confidence: mlResult.confidence,
        training_data_type: mlResult.training_data_type,
        isDataSynthetic: mlResult.isDataSynthetic,
        disclaimer: mlResult.disclaimer,
    });

    res.status(201).json({
        success: true,
        data: saved,
    });
});

/**
 * GET /api/predictions/history
 * Retrieve recent outbreak predictions stored in MongoDB.
 */
export const getPredictionHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await ensureInitialPredictionsSeeded();

    const { state, district, village, limit = '20' } = req.query;

    const filter: Record<string, any> = {};
    if (state && typeof state === 'string' && state.trim() !== '') {
        filter.state = state.trim();
    }
    if (district && typeof district === 'string' && district.trim() !== '') {
        filter.district = district.trim();
    }
    if (village && typeof village === 'string' && village.trim() !== '') {
        filter.village = village.trim();
    }

    const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const docs = await OutbreakPrediction.find(filter)
        .sort({ predictionDate: -1, createdAt: -1 })
        .limit(parsedLimit)
        .lean();

    res.status(200).json({
        success: true,
        data: docs,
    });
});

/**
 * GET /api/predictions/model-info
 * Retrieve trained ML model metadata and evaluation metrics.
 */
export const getModelInfo = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const info = await getMlModelInfo();
    res.status(200).json({
        success: true,
        data: info,
    });
});
