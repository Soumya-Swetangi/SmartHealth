import { api } from './api';
import { Alert, ApiResponse } from '../types';

export const alertService = {
  async getAlerts(params?: {
    status?: string;
    riskLevel?: string;
    village?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Alert[]>> {
    const res = await api.get<ApiResponse<Alert[]>>('/alerts', { params });
    return res.data;
  },

  async updateAlertStatus(id: string, payload: { status: 'acknowledged' | 'resolved'; notes?: string }): Promise<Alert> {
    const res = await api.patch<ApiResponse<Alert>>(`/alerts/${id}`, payload);
    return res.data.data;
  },

  async triggerEvaluation(village?: string): Promise<any> {
    const res = await api.post('/alerts/evaluate', { village });
    return res.data;
  }
};
