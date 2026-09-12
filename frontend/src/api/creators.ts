import { apiClient } from './client';
import { Creator } from './types';

export interface CreatorFilterParams {
  category?: string;
  country?: string;
  minRate?: number;
  maxRate?: number;
}

export const creatorsApi = {
  list: async (filters?: CreatorFilterParams): Promise<Creator[]> => {
    let url = '/creators';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.country) params.append('country', filters.country);
      if (filters.minRate) params.append('minRate', filters.minRate.toString());
      if (filters.maxRate) params.append('maxRate', filters.maxRate.toString());
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    return apiClient<Creator[]>(url);
  },

  getById: async (id: string): Promise<Creator> => {
    return apiClient<Creator>(`/creators/${id}`);
  },

  getMe: async (): Promise<Creator> => {
    return apiClient<Creator>('/creators/me');
  },

  getHome: async (): Promise<any> => {
    return apiClient<any>('/home');
  },

  acceptInvitation: async (applicationId: string): Promise<any> => {
    return apiClient<any>(`/applications/${applicationId}/accept-invitation`, { method: 'PATCH' });
  },

  declineInvitation: async (applicationId: string): Promise<any> => {
    return apiClient<any>(`/applications/${applicationId}/decline-invitation`, { method: 'PATCH' });
  },
};
