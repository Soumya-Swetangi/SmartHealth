import { api } from './api';
import { Report, ApiResponse, ReportStatus } from '../types';

export const reportService = {
  async submitReport(payload: {
    village: string;
    sourceType: string;
    symptoms: string[];
    description?: string;
    location?: { type: 'Point'; coordinates: [number, number] };
  }): Promise<Report> {
    const res = await api.post<ApiResponse<Report>>('/reports', payload);
    return res.data.data;
  },

  async getReports(params?: {
    village?: string;
    status?: string;
    sourceType?: string;
    symptom?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Report[]>> {
    const res = await api.get<ApiResponse<Report[]>>('/reports', { params });
    return res.data;
  },

  async getMyReports(page = 1, limit = 10): Promise<ApiResponse<Report[]>> {
    const res = await api.get<ApiResponse<Report[]>>('/reports/my', {
      params: { page, limit }
    });
    return res.data;
  },

  async getReportById(id: string): Promise<Report> {
    const res = await api.get<ApiResponse<Report>>(`/reports/${id}`);
    return res.data.data;
  },

  async updateReportStatus(
    id: string,
    payload: { status?: ReportStatus; assignedTo?: string; resolutionNotes?: string }
  ): Promise<Report> {
    const res = await api.patch<ApiResponse<Report>>(`/reports/${id}/status`, payload);
    return res.data.data;
  }
};
