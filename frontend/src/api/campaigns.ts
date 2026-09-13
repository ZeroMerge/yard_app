import { apiClient } from './client';
import { Campaign } from './types';

export interface CreateCampaignPayload {
  name: string;
  goal: string;
  category: string;
  country: string;
  city?: string;
  brief: string;
  deliverableType: string;
  quantity: number;
  budgetPerCreator: number;
  currency?: string;
  applicationDeadline?: string;
  deliveryDeadline?: string;
  minFollowers?: number;
  platforms?: string[];
  isPrivate?: boolean;
  publishImmediately?: boolean;
}

export const campaignsApi = {
  list: async (): Promise<Campaign[]> => {
    return apiClient<Campaign[]>('/campaigns');
  },

  getById: async (id: string): Promise<Campaign> => {
    return apiClient<Campaign>(`/campaigns/${id}`);
  },

  create: async (payload: CreateCampaignPayload): Promise<Campaign> => {
    return apiClient<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  publish: async (id: string): Promise<Campaign> => {
    return apiClient<Campaign>(`/campaigns/${id}/publish`, {
      method: 'PATCH',
    });
  },

  cancel: async (id: string): Promise<Campaign> => {
    return apiClient<Campaign>(`/campaigns/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  close: async (id: string): Promise<Campaign> => {
    return apiClient<Campaign>(`/campaigns/${id}/close`, {
      method: 'PATCH',
    });
  },

  archive: async (id: string): Promise<Campaign> => {
    return apiClient<Campaign>(`/campaigns/${id}/archive`, {
      method: 'PATCH',
    });
  },

  unarchive: async (id: string): Promise<Campaign> => {
    return apiClient<Campaign>(`/campaigns/${id}/unarchive`, {
      method: 'PATCH',
    });
  },

  updateReApplicationSettings: async (
    id: string,
    payload: { allowReApplication?: boolean; reApplicationCooldownDays?: number },
  ): Promise<Campaign> => {
    return apiClient<Campaign>(`/campaigns/${id}/reapplication-settings`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteDraft: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  },
};
