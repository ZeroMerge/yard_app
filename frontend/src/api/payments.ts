import { apiClient } from './client';
import { Payment } from './types';

export const paymentsApi = {
  getPayments: async (campaignId: string): Promise<Payment[]> => {
    return apiClient<Payment[]>(`/payments/${campaignId}`);
  },
};
