import { Request, Response } from 'express';
import OutbreakPrediction from '../models/OutbreakPrediction';
import { getOutbreakPrediction, getMlModelInfo } from '../services/mlServiceClient';
import { asyncHandler } from '../utils/asyncHandler';
import { PredictionRequestPayload } from '../types/prediction';

/**
 * POST /api/predictions
 * Validate input features, call the FastAPI ML service, store the result in MongoDB, and return it.
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

    try {
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
    } catch (err: any) {
        const detail =
            err?.response?.data?.detail ||
            err?.message ||
            'Failed to communicate with the FastAPI ML prediction service.';
        res.status(503).json({
            success: false,
            message: `ML Service error: ${detail}. Ensure Terminal 2 (FastAPI ML service on port 8000) is running.`,
        });
    }
});

/**
 * GET /api/predictions/history
 * Retrieve recent outbreak predictions stored in MongoDB.
 */
export const getPredictionHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
 * Retrieve trained ML model metadata and evaluation metrics from FastAPI.
 */
export const getModelInfo = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    try {
        const info = await getMlModelInfo();
        res.status(200).json({
            success: true,
            data: info,
        });
    } catch (err: any) {
        res.status(503).json({
            success: false,
            message:
                'ML service is currently unreachable on port 8000. Start the FastAPI ML service to inspect live model metrics.',
        });
    }
});
