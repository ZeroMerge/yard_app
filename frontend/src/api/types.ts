// Generated / Aligned types from backend spec §4 and §8
export type Role = 'brand' | 'creator' | 'admin';

export type CampaignStatus =
  | 'draft'
  | 'open'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'cancelled'
  | 'closed';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export type DeliverableStatus = 'submitted' | 'revision_requested' | 'approved' | 'rejected';

export type PaymentStatus =
  | 'unpaid'
  | 'payment_initiated'
  | 'payment_confirmed'
  | 'creator_payout_pending'
  | 'paid'
  | 'failed'
  | 'retry';

export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'member';
}

export interface CreatorSocialAccount {
  id: string;
  creatorId: string;
  platform: string;
  handle: string;
  profileUrl: string;
}

export interface CreatorRate {
  id: string;
  creatorId: string;
  deliverableType: string;
  amount: number;
  currency: string;
}

export interface CreatorLocation {
  id: string;
  creatorId: string;
  country: string;
  city?: string | null;
}

export interface CreatorCategory {
  creatorId: string;
  category: string;
}

export interface CreatorStats {
  creatorId: string;
  campaignsCompleted: number;
  campaignsCancelled: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  revisionsRequested: number;
  disputes: number;
  repeatHires: number;
}

export interface Creator {
  id: string;
  userId: string;
  displayName: string;
  bio?: string | null;
  profileImageUrl?: string | null;
  verified: boolean;
  payoutAccount?: Record<string, any> | null;
  createdAt: string;
  socialAccounts?: CreatorSocialAccount[];
  categories?: CreatorCategory[];
  locations?: CreatorLocation[];
  rates?: CreatorRate[];
  stats?: CreatorStats | null;
}

export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  goal: string;
  category: string;
  country: string;
  city?: string | null;
  brief: string;
  deliverableType: string;
  quantity: number;
  budgetPerCreator: number;
  currency: string;
  status: CampaignStatus;
  applicationDeadline?: string | null;
  deliveryDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
  applications?: Application[];
  deliverables?: Deliverable[];
  payments?: Payment[];
  activities?: CampaignActivity[];
  files?: FileRecord[];
}

export interface Application {
  id: string;
  campaignId: string;
  creatorId: string;
  source: 'applied' | 'invited';
  status: ApplicationStatus;
  pitch?: string | null;
  createdAt: string;
  decidedAt?: string | null;
  campaign?: Campaign;
  creator?: Creator;
  deliverables?: Deliverable[];
  payments?: Payment[];
}

export interface FileRecord {
  id: string;
  campaignId?: string | null;
  uploadedBy: string;
  provider: string;
  providerFileId: string;
  providerUrl?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  status: 'active' | 'deleted';
  createdAt: string;
}

export interface Deliverable {
  id: string;
  campaignId: string;
  applicationId: string;
  fileId: string;
  status: DeliverableStatus;
  revisionNotes?: string | null;
  version: number;
  submittedAt: string;
  reviewedAt?: string | null;
  file?: FileRecord;
  application?: Application;
  campaign?: Campaign;
}

export interface Payment {
  id: string;
  campaignId: string;
  applicationId: string;
  amount: number;
  currency: string;
  provider: string;
  providerRef?: string | null;
  status: PaymentStatus;
  parentPaymentId?: string | null;
  createdAt: string;
  application?: Application;
}

export interface CampaignActivity {
  id: string;
  campaignId: string;
  actorId?: string | null;
  eventType: string;
  body?: string | null;
  metadata?: any;
  createdAt: string;
  actor?: User | null;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: any;
  createdAt: string;
  actor?: {
    id: string;
    email: string;
    role: string;
  } | null;
}
