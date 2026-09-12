import { SignalType } from './signal.types';

/**
 * SINGLE SOURCE OF TRUTH for all signal base weights and category assignments.
 *
 * To tune relevance/priority: edit this file only.
 * Signal functions must never hardcode weights.
 * Composition layer reads from here exclusively.
 *
 * Open Question Q1 resolution (confirmed by product owner):
 *   Profile is "ready" when: bio non-null + profileImageUrl non-null + payoutAccount non-null
 *   + at least 1 social account + at least 1 rate + at least 1 location.
 *
 * Open Question Q2 resolution (working default):
 *   APPLICATION_RESPONSE is shown for 7 days after decidedAt.
 *
 * Open Question Q3 resolution (working default):
 *   PAYMENT_COMPLETED is shown for 14 days after payment createdAt.
 *
 * Open Question Q4 resolution (working default):
 *   Past-due deliverables: deadline_proximity_bonus caps at +15. Does not go negative.
 */

export const SIGNAL_BASE_WEIGHTS: Record<SignalType, number> = {
  REVISION_REQUESTED:     100,
  PROFILE_READINESS:       95,
  INVITATION_RECEIVED:     90,
  DEADLINE_APPROACHING:    85,
  APPLICATION_RESPONSE:    80,
  SUBMITTED_UNDER_REVIEW:  40,
  PAYMENT_PROCESSING:      40,
  CAMPAIGN_IN_PROGRESS:    35,
  PAYMENT_COMPLETED:       30,
  OPPORTUNITY:             10,
};

export const SIGNAL_CATEGORIES: Record<SignalType, 'attention' | 'progress' | 'opportunity'> = {
  REVISION_REQUESTED:     'attention',
  PROFILE_READINESS:      'attention',
  INVITATION_RECEIVED:    'attention',
  DEADLINE_APPROACHING:   'attention',
  APPLICATION_RESPONSE:   'attention',
  SUBMITTED_UNDER_REVIEW: 'progress',
  PAYMENT_PROCESSING:     'progress',
  CAMPAIGN_IN_PROGRESS:   'progress',
  PAYMENT_COMPLETED:      'progress',
  OPPORTUNITY:            'opportunity',
};

/** Days after decidedAt to keep APPLICATION_RESPONSE visible. */
export const APPLICATION_RESPONSE_WINDOW_DAYS = 7;

/** Days after payment.createdAt to keep PAYMENT_COMPLETED visible. */
export const PAYMENT_COMPLETED_WINDOW_DAYS = 14;

/** Hours before deliveryDeadline to emit DEADLINE_APPROACHING. */
export const DEADLINE_APPROACHING_HOURS = 48;

/** Max deadline proximity bonus. Caps here even if past-due. */
export const DEADLINE_PROXIMITY_BONUS_MAX = 15;

/** Max recency bonus (applied when occurredAt is <1h ago). Decays to 0 at 7 days. */
export const RECENCY_BONUS_MAX = 5;
export const RECENCY_BONUS_DECAY_DAYS = 7;
