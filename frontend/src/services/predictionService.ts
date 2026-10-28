import api from './api';
import { ModelInfoResponse, OutbreakPrediction, SmartPredictInput } from '../types';

export const predictionService = {
    async createPrediction(
        payload: SmartPredictInput
    ): Promise<{ success: boolean; data: OutbreakPrediction }> {
        const { data } = await api.post<{ success: boolean; data: OutbreakPrediction }>(
            '/predictions',
            payload
        );
        return data;
    },

    async getPredictionHistory(params?: {
        state?: string;
        district?: string;
        village?: string;
        limit?: number;
    }): Promise<{ success: boolean; data: OutbreakPrediction[] }> {
        const { data } = await api.get<{ success: boolean; data: OutbreakPrediction[] }>(
            '/predictions/history',
            { params }
        );
        return data;
    },

    async getModelInfo(): Promise<{ success: boolean; data: ModelInfoResponse }> {
        const { data } = await api.get<{ success: boolean; data: ModelInfoResponse }>(
            '/predictions/model-info'
        );
        return data;
    },
};
