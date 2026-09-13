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

  invite: async (campaignId: string, creatorId: string, pitch?: string): Promise<Application> => {
    return apiClient<Application>(`/campaigns/${campaignId}/applications`, {
      method: 'POST',
      body: JSON.stringify({ source: 'invited', creatorId, pitch }),
    });
  },

  accept: async (applicationId: string): Promise<Application> => {
    return apiClient<Application>(`/applications/${applicationId}/accept`, {
      method: 'PATCH',
    });
  },

  reject: async (applicationId: string, blockReApply: boolean = false): Promise<Application> => {
    return apiClient<Application>(`/applications/${applicationId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ blockReApply }),
    });
  },

  reconsider: async (applicationId: string): Promise<Application> => {
    return apiClient<Application>(`/applications/${applicationId}/reconsider`, {
      method: 'PATCH',
    });
  },

  getReApplyEligibility: async (campaignId: string): Promise<{
    eligible: boolean;
    reason?: 'no_prior_rejection' | 'blocked' | 'in_cooldown' | 'campaign_closed' | 'private_campaign' | 'slots_full' | 'already_applied';
    canReApplyAt?: string;
    previousApplicationId?: string;
    previousPitch?: string;
    reApplicationCount?: number;
  }> => {
    return apiClient(`/campaigns/${campaignId}/reapply-eligibility`);
  },

  withdraw: async (applicationId: string): Promise<Application> => {
    return apiClient<Application>(`/applications/${applicationId}/withdraw`, {
      method: 'PATCH',
    });
  },

  acceptInvitation: async (applicationId: string): Promise<Application> => {
    return apiClient<Application>(`/applications/${applicationId}/accept-invitation`, {
      method: 'PATCH',
    });
  },

  declineInvitation: async (applicationId: string): Promise<Application> => {
    return apiClient<Application>(`/applications/${applicationId}/decline-invitation`, {
      method: 'PATCH',
    });
  },
};
