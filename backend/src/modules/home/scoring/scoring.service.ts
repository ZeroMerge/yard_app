import { Injectable } from '@nestjs/common';
import {
  DEADLINE_PROXIMITY_BONUS_MAX,
  RECENCY_BONUS_MAX,
  RECENCY_BONUS_DECAY_DAYS,
} from '../signals/signal.config';

@Injectable()
export class ScoringService {
  /**
   * Computes an additive bonus based on how close the deadline is.
   * Returns a value between 0 and DEADLINE_PROXIMITY_BONUS_MAX.
   *
   * - No deadline → 0
   * - Deadline >7 days away → 0
   * - Deadline exactly at 48h → small bonus
   * - Deadline <1h away or already past → max bonus (caps, never goes negative)
   */
  deadlineProximityBonus(deadlineAt: Date | null, now: Date = new Date()): number {
    if (!deadlineAt) return 0;

    const hoursLeft = (deadlineAt.getTime() - now.getTime()) / (1000 * 3600);

    // Past due or <1h: max urgency
    if (hoursLeft <= 1) return DEADLINE_PROXIMITY_BONUS_MAX;

    // >7 days away: not yet relevant
    if (hoursLeft > 7 * 24) return 0;

    // Linear interpolation: 168h → 0, 1h → max
    const fraction = 1 - (hoursLeft - 1) / (7 * 24 - 1);
    return Math.min(DEADLINE_PROXIMITY_BONUS_MAX, Math.round(fraction * DEADLINE_PROXIMITY_BONUS_MAX));
  }

  /**
   * Computes an additive bonus based on how recently this signal occurred.
   * Decays linearly from RECENCY_BONUS_MAX at t=0 to 0 at RECENCY_BONUS_DECAY_DAYS.
   * Old events get 0 (never negative).
   */
  recencyBonus(occurredAt: Date, now: Date = new Date()): number {
    const ageMs = now.getTime() - occurredAt.getTime();
    const ageDays = ageMs / (1000 * 3600 * 24);

    if (ageDays >= RECENCY_BONUS_DECAY_DAYS) return 0;
    if (ageDays < 0) return 0; // clock skew guard

    const fraction = 1 - ageDays / RECENCY_BONUS_DECAY_DAYS;
    return Math.min(RECENCY_BONUS_MAX, Math.round(fraction * RECENCY_BONUS_MAX));
  }

  /**
   * Final priority score for a signal.
   * dismissed_penalty = 0 for this build (no dismissal persistence yet).
   */
  computePriority(
    baseWeight: number,
    deadlineAt: Date | null,
    occurredAt: Date,
    now: Date = new Date(),
  ): number {
    return (
      baseWeight +
      this.deadlineProximityBonus(deadlineAt, now) +
      this.recencyBonus(occurredAt, now)
    );
  }
}
