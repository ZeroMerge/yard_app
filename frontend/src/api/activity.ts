import { apiClient } from './client';
import { CampaignActivity } from './types';

export const activityApi = {
  getActivity: async (campaignId: string): Promise<CampaignActivity[]> => {
    return apiClient<CampaignActivity[]>(`/campaigns/${campaignId}/activity`);
  },

  postComment: async (campaignId: string, body: string): Promise<CampaignActivity> => {
    return apiClient<CampaignActivity>(`/campaigns/${campaignId}/activity`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  },
};
