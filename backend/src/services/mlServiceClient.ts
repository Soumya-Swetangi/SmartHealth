import axios from 'axios';
import { PredictionRequestPayload, PredictionResponsePayload } from '../types/prediction';

function resolveMlBaseUrl(): string {
    const raw = (process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000').trim();
    // Replace localhost with 127.0.0.1 to prevent Windows IPv6 ::1 ECONNREFUSED when uvicorn binds to 127.0.0.1
    return raw.replace('://localhost', '://127.0.0.1').replace(/\/+$/, '');
}

const mlClient = axios.create({
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

export async function getOutbreakPrediction(
    payload: PredictionRequestPayload
): Promise<PredictionResponsePayload> {
    const baseUrl = resolveMlBaseUrl();
    const response = await mlClient.post<PredictionResponsePayload>(`${baseUrl}/predict`, payload);
    return response.data;
}

export async function getMlModelInfo(): Promise<Record<string, any>> {
    const baseUrl = resolveMlBaseUrl();
    const response = await mlClient.get<Record<string, any>>(`${baseUrl}/model/info`);
    return response.data;
}

export async function getMlServiceHealth(): Promise<Record<string, any>> {
    const baseUrl = resolveMlBaseUrl();
    const response = await mlClient.get<Record<string, any>>(`${baseUrl}/health`);
    return response.data;
}
