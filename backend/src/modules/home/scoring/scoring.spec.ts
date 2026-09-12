import { ScoringService } from './scoring.service';
import { DEADLINE_PROXIMITY_BONUS_MAX, RECENCY_BONUS_MAX } from '../signals/signal.config';

describe('ScoringService', () => {
  let scoring: ScoringService;
  const now = new Date('2026-08-13T12:00:00Z');

  beforeEach(() => {
    scoring = new ScoringService();
  });

  // ──────────────────────────────────────────────────────────────
  // deadlineProximityBonus
  // ──────────────────────────────────────────────────────────────
  describe('deadlineProximityBonus', () => {
    it('returns 0 when there is no deadline', () => {
      expect(scoring.deadlineProximityBonus(null, now)).toBe(0);
    });

    it('returns 0 when deadline is more than 7 days away', () => {
      const farDeadline = new Date(now.getTime() + 8 * 24 * 3600 * 1000);
      expect(scoring.deadlineProximityBonus(farDeadline, now)).toBe(0);
    });

    it('returns a positive bonus when deadline is exactly 48h away', () => {
      const deadline48h = new Date(now.getTime() + 48 * 3600 * 1000);
      const bonus = scoring.deadlineProximityBonus(deadline48h, now);
      expect(bonus).toBeGreaterThan(0);
      expect(bonus).toBeLessThanOrEqual(DEADLINE_PROXIMITY_BONUS_MAX);
    });

    it('returns max bonus when deadline is <1h away', () => {
      const imminentDeadline = new Date(now.getTime() + 30 * 60 * 1000);
      expect(scoring.deadlineProximityBonus(imminentDeadline, now)).toBe(DEADLINE_PROXIMITY_BONUS_MAX);
    });

    it('returns max bonus (not negative) when past-due', () => {
      const pastDeadline = new Date(now.getTime() - 24 * 3600 * 1000);
      const bonus = scoring.deadlineProximityBonus(pastDeadline, now);
      expect(bonus).toBe(DEADLINE_PROXIMITY_BONUS_MAX);
    });

    it('returns max bonus when deadline is exactly now', () => {
      expect(scoring.deadlineProximityBonus(now, now)).toBe(DEADLINE_PROXIMITY_BONUS_MAX);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // recencyBonus
  // ──────────────────────────────────────────────────────────────
  describe('recencyBonus', () => {
    it('returns max bonus for a very fresh event (<1h ago)', () => {
      const veryFresh = new Date(now.getTime() - 30 * 60 * 1000);
      const bonus = scoring.recencyBonus(veryFresh, now);
      expect(bonus).toBe(RECENCY_BONUS_MAX);
    });

    it('returns a positive bonus for a moderately recent event (3 days ago)', () => {
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 3600 * 1000);
      const bonus = scoring.recencyBonus(threeDaysAgo, now);
      expect(bonus).toBeGreaterThan(0);
      expect(bonus).toBeLessThan(RECENCY_BONUS_MAX);
    });

    it('returns 0 for an old event (beyond decay window)', () => {
      const veryOld = new Date(now.getTime() - 8 * 24 * 3600 * 1000);
      expect(scoring.recencyBonus(veryOld, now)).toBe(0);
    });

    it('returns 0 for an event exactly at the decay boundary', () => {
      const boundary = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      expect(scoring.recencyBonus(boundary, now)).toBe(0);
    });

    it('handles clock skew (future occurredAt) gracefully — returns 0', () => {
      const future = new Date(now.getTime() + 3600 * 1000);
      expect(scoring.recencyBonus(future, now)).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // computePriority
  // ──────────────────────────────────────────────────────────────
  describe('computePriority', () => {
    it('equals baseWeight when there is no deadline and event is old', () => {
      const oldEvent = new Date(now.getTime() - 10 * 24 * 3600 * 1000);
      const priority = scoring.computePriority(100, null, oldEvent, now);
      expect(priority).toBe(100);
    });

    it('exceeds baseWeight when event is fresh', () => {
      const freshEvent = new Date(now.getTime() - 60 * 1000);
      const priority = scoring.computePriority(100, null, freshEvent, now);
      expect(priority).toBeGreaterThan(100);
    });

    it('reaches maximum when imminent deadline + fresh event', () => {
      const freshEvent = new Date(now.getTime() - 60 * 1000);
      const imminentDeadline = new Date(now.getTime() + 30 * 60 * 1000);
      const priority = scoring.computePriority(100, imminentDeadline, freshEvent, now);
      expect(priority).toBe(100 + DEADLINE_PROXIMITY_BONUS_MAX + RECENCY_BONUS_MAX);
    });
  });
});
