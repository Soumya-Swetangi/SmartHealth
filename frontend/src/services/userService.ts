import { api } from './api';
import { User, NotificationItem, ApiResponse } from '../types';

export const userService = {
  async getUsers(params?: {
    role?: string;
    village?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<User[]>> {
    const res = await api.get<ApiResponse<User[]>>('/users', { params });
    return res.data;
  },

  async updateUser(id: string, payload: { role?: string; isActive?: boolean; village?: string; phone?: string }): Promise<User> {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}`, payload);
    return res.data.data;
  },

  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const res = await api.get<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>>('/users/notifications');
    return res.data.data;
  },

  async markNotificationRead(id: string): Promise<void> {
    await api.patch(`/users/notifications/${id}/read`);
  },

  async seedDemoDatabase(): Promise<void> {
    await api.post('/seed');
  }
};
