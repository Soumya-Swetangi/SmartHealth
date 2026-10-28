import { api } from './api';
import { WaterTest, ApiResponse } from '../types';
import { WaterTestFormData } from '../utils/validators';

export const waterTestService = {
  async createWaterTest(data: WaterTestFormData): Promise<WaterTest> {
    const payload = {
      village: data.village,
      sourceType: data.sourceType,
      reportId: data.reportId || undefined,
      result: data.result,
      parameters: {
        pH: data.pH,
        turbidity: data.turbidity,
        chlorine: data.chlorine,
        coliform: data.coliform,
        ecoli: data.ecoli
      },
      notes: data.notes
    };
    const res = await api.post<ApiResponse<WaterTest>>('/water-tests', payload);
    return res.data.data;
  },

  async getWaterTests(params?: {
    village?: string;
    result?: string;
    sourceType?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<WaterTest[]>> {
    const res = await api.get<ApiResponse<WaterTest[]>>('/water-tests', { params });
    return res.data;
  },

  async getWaterTestById(id: string): Promise<WaterTest> {
    const res = await api.get<ApiResponse<WaterTest>>(`/water-tests/${id}`);
    return res.data.data;
  }
};
