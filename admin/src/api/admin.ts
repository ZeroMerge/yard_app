import { adminFetch } from "./client";
import { AuditLog } from "@yard/shared";

export interface PlatformStats {
  users: {
    total: number;
    creators: number;
    verifiedCreators: number;
    brands: number;
  };
  campaigns: {
    total: number;
    byStatus: Record<string, number>;
  };
  payments: {
    total: number;
    byStatus: Record<string, number>;
    totalEscrowVolume: number;
    paidVolume: number;
  };
  auditLogsCount: number;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  creator?: {
    id: string;
    displayName: string;
    verified: boolean;
    categories?: any[];
    stats?: any;
    payoutAccount?: any;
  } | null;
  organization?: {
    id: string;
    name: string;
    industry?: string;
    website?: string;
  } | null;
}

export interface AdminCampaignRecord {
  id: string;
  name: string;
  category: string;
  country: string;
  city?: string;
  deliverableType: string;
  budgetPerCreator: number;
  quantity: number;
  currency: string;
  status: string;
  isPrivate: boolean;
  isArchived: boolean;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
    industry?: string;
  };
  _count?: {
    applications: number;
    deliverables: number;
  };
}

export interface AdminPaymentRecord {
  id: string;
  campaignId: string;
  applicationId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerRef?: string;
  createdAt: string;
  campaign?: {
    name: string;
    organizationId: string;
  };
  application?: {
    creator?: {
      displayName: string;
      payoutAccount?: {
        bankName?: string;
        bankCode?: string;
        accountNumber?: string;
        accountName?: string;
      };
    };
  };
}

export const adminApi = {
  getStats: () => adminFetch<PlatformStats>("/admin/stats"),

  getUsers: (params?: { search?: string; role?: string; status?: string }) =>
    adminFetch<AdminUserRecord[]>("/admin/users", { params }),

  getCampaigns: (params?: { search?: string; status?: string }) =>
    adminFetch<AdminCampaignRecord[]>("/admin/campaigns", { params }),

  getManualPaymentsQueue: () => adminFetch<AdminPaymentRecord[]>("/admin/payments"),

  markPaymentAsPaid: (id: string, receiptNote: string) =>
    adminFetch<any>(`/admin/payments/${id}/mark-paid`, {
      method: "POST",
      body: JSON.stringify({ receiptNote }),
    }),

  getAuditLogs: () => adminFetch<AuditLog[]>("/admin/audit-logs"),

  verifyCreator: (creatorId: string, payload: { verified: boolean; reason: string }) =>
    adminFetch<any>(`/creators/${creatorId}/verify`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  suspendUser: (userId: string, payload: { suspended: boolean; reason: string }) =>
    adminFetch<any>(`/users/${userId}/suspend`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
