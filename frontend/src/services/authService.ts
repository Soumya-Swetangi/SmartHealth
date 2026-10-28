import { api } from './api';
import { AuthResponse, OtpRequestResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    village: string;
    phone?: string;
    role?: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    return data;
  },

  async requestOtp(phone: string): Promise<OtpRequestResponse> {
    const { data } = await api.post<OtpRequestResponse>('/auth/request-otp', { phone });
    return data;
  },

  async verifyOtp(phone: string, code: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/verify-otp', { phone, code });
    return data;
  },

  async getMe(): Promise<{ success: boolean; data: User & { user?: User } }> {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
};
