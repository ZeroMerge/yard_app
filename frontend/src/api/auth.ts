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

  logout: () => {
    setAuthToken(null);
  },
};
