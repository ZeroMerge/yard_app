import { apiClient, setAuthToken } from './client';
import { User } from './types';

export interface RegisterPayload {
  email: string;
  password?: string;
  role: 'brand' | 'creator';
  name: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  user: User & { organizationId?: string; creatorId?: string };
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const token = res.token || res.accessToken;
    if (token) {
      setAuthToken(token);
    }
    return { ...res, token: token || '' };
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const token = res.token || res.accessToken;
    if (token) {
      setAuthToken(token);
    }
    return { ...res, token: token || '' };
  },

  getMe: async (): Promise<User & { organizationId?: string; creatorId?: string }> => {
    return apiClient<User & { organizationId?: string; creatorId?: string }>('/auth/me');
  },

  forgotPassword: async (email: string): Promise<{ message: string; resetUrl?: string }> => {
    return apiClient<{ message: string; resetUrl?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  logout: () => {
    setAuthToken(null);
  },
};

