/**
 * HomeItem — the single unit returned by GET /api/creators/home.
 * This is an additive-only contract. Fields must never be removed or renamed
 * without a version bump. New signal types may be added at any time.
 */
export interface HomeItem {
  /** Stable identifier for this signal instance. Required for future seen/dismiss tracking. */
  id: string;
  /** Additive-only enum. See SIGNAL_BASE_WEIGHTS for all valid values. */
  type: SignalType;
  /** Grouping for frontend zone rendering. Derived from SIGNAL_CATEGORIES. */
  category: 'attention' | 'progress' | 'opportunity';
  /** Computed priority score. Higher = more urgent. Descending sort. */
  priority: number;
  /** The domain entity this signal points to. */
  entity: { type: EntityType; id: string };
  /** ISO 8601 — when this signal became relevant. */
  occurredAt: string;
  /** ISO 8601 or null — hard deadline, if applicable. */
  deadlineAt: string | null;
  /** Deep link into the relevant page (Work / Discover / Profile). Frontend-relative path. */
  actionUrl: string;
  /**
   * Structured, renderable fields only. Never pre-formatted copy strings.
   * Copy and i18n are a frontend concern.
   */
  summary: Record<string, string | number | null>;
}

export interface HomeResponse {
  items: HomeItem[];
}

/**
 * Internal intermediate type used by signal functions before composition.
 * Never exposed to the API layer.
 */
export interface RawSignal {
  /** Deterministic — must be the same on every call for the same logical event. */
  id: string;
  type: SignalType;
  entity: { type: EntityType; id: string };
  occurredAt: Date;
  deadlineAt: Date | null;
  actionUrl: string;
  summary: Record<string, string | number | null>;
}

export type SignalType =
  | 'PROFILE_READINESS'
  | 'INVITATION_RECEIVED'
  | 'REVISION_REQUESTED'
  | 'APPLICATION_RESPONSE'
  | 'DEADLINE_APPROACHING'
  | 'SUBMITTED_UNDER_REVIEW'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_COMPLETED'
  | 'CAMPAIGN_IN_PROGRESS'
  | 'OPPORTUNITY';

export type EntityType =
  | 'creator'
  | 'application'
  | 'deliverable'
  | 'payment'
  | 'campaign';
