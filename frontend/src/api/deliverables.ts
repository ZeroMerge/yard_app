import { apiClient } from './client';
import { Deliverable } from './types';

export interface SubmitDeliverablePayload {
  providerFileId: string;
  providerUrl?: string;
  provider?: string;
  fileType?: string;
  fileSize?: number;
}

export interface RequestRevisionPayload {
  revisionNotes: string;
}

export const deliverablesApi = {
  submit: async (applicationId: string, payload: SubmitDeliverablePayload): Promise<Deliverable> => {
    return apiClient<Deliverable>(`/applications/${applicationId}/deliverables`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  approve: async (deliverableId: string): Promise<Deliverable> => {
    return apiClient<Deliverable>(`/deliverables/${deliverableId}/approve`, {
      method: 'PATCH',
    });
  },

  requestRevision: async (deliverableId: string, payload: RequestRevisionPayload): Promise<Deliverable> => {
    return apiClient<Deliverable>(`/deliverables/${deliverableId}/request-revision`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
