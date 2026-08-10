import { apiClient } from './client';
import { AuditLog } from './types';

export const adminApi = {
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return apiClient<AuditLog[]>('/admin/audit-logs');
  },
  suspendUser: async (userId: string, data: { suspended: boolean; reason?: string }) => {
    return apiClient(`/users/${userId}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  verifyCreator: async (creatorId: string, data: { verified: boolean; reason?: string }) => {
    return apiClient(`/creators/${creatorId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
