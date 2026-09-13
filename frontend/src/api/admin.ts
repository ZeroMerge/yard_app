import { apiClient } from './client';
import { AuditLog } from './types';

export interface AdminPaymentItem {
  id: string;
  campaignId: string;
  applicationId: string;
  amount: number | string;
  currency: string;
  provider: string;
  providerRef?: string | null;
  status: string;
  createdAt: string;
  campaign?: {
    name: string;
    organizationId: string;
  };
  application?: {
    creator?: {
      displayName: string;
      payoutBankCode?: string | null;
      payoutAccountNumber?: string | null;
      payoutAccountName?: string | null;
    };
  };
}

export const adminApi = {
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return apiClient<AuditLog[]>('/admin/audit-logs');
  },
  getManualPaymentsQueue: async (): Promise<AdminPaymentItem[]> => {
    return apiClient<AdminPaymentItem[]>('/admin/payments');
  },
  markPaymentAsPaid: async (paymentId: string, receiptNote?: string) => {
    return apiClient(`/admin/payments/${paymentId}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify({ receiptNote }),
    });
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

