import { apiClient } from './client';
import { Application } from './types';

export interface ApplyPayload {
  pitch?: string;
  source?: 'applied' | 'invited';
}

export const applicationsApi = {
  apply: async (campaignId: string, payload: ApplyPayload): Promise<Application> => {
    return apiClient<Application>(`/campaigns/${campaignId}/applications`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  accept: async (applicationId: string): Promise<Application> => {
    return apiClient<Application>(`/applications/${applicationId}/accept`, {
      method: 'PATCH',
    });
  },

  reject: async (applicationId: string): Promise<Application> => {
    return apiClient<Application>(`/applications/${applicationId}/reject`, {
      method: 'PATCH',
    });
  },

  withdraw: async (applicationId: string): Promise<Application> => {
    return apiClient<Application>(`/applications/${applicationId}/withdraw`, {
      method: 'PATCH',
    });
  },
};
