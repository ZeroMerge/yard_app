import { apiClient } from './client';
import { FileRecord } from './types';

export const filesApi = {
  getAuthorizedFileUrl: async (campaignId: string, fileId: string): Promise<FileRecord> => {
    return apiClient<FileRecord>(`/campaigns/${campaignId}/files/${fileId}`);
  },
};
