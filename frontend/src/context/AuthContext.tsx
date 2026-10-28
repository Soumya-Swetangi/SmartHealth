import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, OtpRequestResponse } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  requestOtp: (phone: string) => Promise<OtpRequestResponse>;
  verifyOtp: (phone: string, code: string) => Promise<User>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    village: string;
    phone?: string;
    role?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({} as User),
  requestOtp: async () => ({ success: false, message: '' }),
  verifyOtp: async () => ({} as User),
  register: async () => ({} as User),
  logout: async () => {},
  updateUser: () => {}
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const response = await authService.getMe();
          if (response.success && response.data) {
            const resolvedUser = response.data.user || response.data;
            setUser(resolvedUser);
            localStorage.setItem('user', JSON.stringify(resolvedUser));
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await authService.login(email, password);
    if (response.success && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error(response.message || 'Login failed');
  };

  const requestOtp = async (phone: string): Promise<OtpRequestResponse> => {
    return authService.requestOtp(phone);
  };

  const verifyOtp = async (phone: string, code: string): Promise<User> => {
    const response = await authService.verifyOtp(phone, code);
    if (response.success && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error(response.message || 'OTP verification failed');
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    village: string;
    phone?: string;
    role?: string;
  }): Promise<User> => {
    const response = await authService.register(userData);
    if (response.success && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoading: loading,
        isAuthenticated: !!user,
        login,
        requestOtp,
        verifyOtp,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
