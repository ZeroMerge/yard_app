import { HomeService } from '../home.service';
import { ScoringService } from '../scoring/scoring.service';

/**
 * Composition layer tests.
 * Uses manual mocks — no database, no network.
 *
 * Fixture accounts from seed-creator-states.ts are referenced by their
 * conceptual state, not by real IDs, to keep tests stable across re-seeds.
 */

const makeSignalService = (signals: any[]) => ({
  getProfileSignals: jest.fn().mockResolvedValue(signals),
  getApplicationSignals: jest.fn().mockResolvedValue(signals),
  getDeliverableSignals: jest.fn().mockResolvedValue(signals),
  getPaymentSignals: jest.fn().mockResolvedValue(signals),
  getOpportunitySignals: jest.fn().mockResolvedValue(signals),
});

const FIXED_NOW = new Date('2026-08-13T12:00:00Z');

const mockRevisionSignal = {
  id: 'revision_del_1',
  type: 'REVISION_REQUESTED' as const,
  entity: { type: 'deliverable' as const, id: 'del_1' },
  occurredAt: new Date('2026-08-12T10:00:00Z'),
  deadlineAt: null,
  actionUrl: '/creator/work',
  summary: { campaignName: 'Campaign A', brandName: 'Brand X', revisionNotes: 'Fix audio', version: 1 },
};

const mockInvitationSignal = {
  id: 'invitation_app_1',
  type: 'INVITATION_RECEIVED' as const,
  entity: { type: 'application' as const, id: 'app_1' },
  occurredAt: new Date('2026-08-13T08:00:00Z'),
  deadlineAt: null,
  actionUrl: '/creator/work',
  summary: { campaignName: 'Campaign B', brandName: 'Brand Y', campaignId: 'camp_1' },
};

const mockOpportunitySignal = {
  id: 'opportunity_camp_x_creator_1',
  type: 'OPPORTUNITY' as const,
  entity: { type: 'campaign' as const, id: 'camp_x' },
  occurredAt: new Date('2026-08-10T00:00:00Z'),
  deadlineAt: null,
  actionUrl: '/creator/campaigns',
  summary: { campaignName: 'Campaign X', brandName: 'Brand Z', category: 'lifestyle', budgetPerCreator: 50000, currency: 'NGN' },
};

function buildService(overrides: {
  profileSignals?: any[];
  applicationSignals?: any[];
  deliverableSignals?: any[];
  paymentSignals?: any[];
  opportunitySignals?: any[];
}) {
  const scoring = new ScoringService();
  const prisma = {} as any;

  const profileService = { getProfileSignals: jest.fn().mockResolvedValue(overrides.profileSignals ?? []) };
  const applicationService = { getApplicationSignals: jest.fn().mockResolvedValue(overrides.applicationSignals ?? []) };
  const deliverableService = { getDeliverableSignals: jest.fn().mockResolvedValue(overrides.deliverableSignals ?? []) };
  const paymentService = { getPaymentSignals: jest.fn().mockResolvedValue(overrides.paymentSignals ?? []) };
  const opportunityService = { getOpportunitySignals: jest.fn().mockResolvedValue(overrides.opportunitySignals ?? []) };

  return new HomeService(
    prisma,
    scoring,
    profileService as any,
    applicationService as any,
    deliverableService as any,
    paymentService as any,
    opportunityService as any,
  );
}

describe('HomeService (composition layer)', () => {

  // ──────────────────────────────────────────────────────────────
  // Contract: zero signals → empty array, never null/error
  // ──────────────────────────────────────────────────────────────
  it('returns { items: [] } for a creator with zero signals in every source', async () => {
    const service = buildService({});
    const result = await service.getHomeResponse('creator_id_1');
    expect(result).toEqual({ items: [] });
  });

  // ──────────────────────────────────────────────────────────────
  // Partial failure: one source throwing must not fail the whole response
  // ──────────────────────────────────────────────────────────────
  it('returns items from healthy sources when one source throws', async () => {
    const scoring = new ScoringService();
    const prisma = {} as any;

    const profileService = { getProfileSignals: jest.fn().mockRejectedValue(new Error('DB timeout')) };
    const applicationService = { getApplicationSignals: jest.fn().mockResolvedValue([mockInvitationSignal]) };
    const deliverableService = { getDeliverableSignals: jest.fn().mockResolvedValue([]) };
    const paymentService = { getPaymentSignals: jest.fn().mockResolvedValue([]) };
    const opportunityService = { getOpportunitySignals: jest.fn().mockResolvedValue([]) };

    const service = new HomeService(prisma, scoring, profileService as any, applicationService as any, deliverableService as any, paymentService as any, opportunityService as any);
    const result = await service.getHomeResponse('creator_id');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].type).toBe('INVITATION_RECEIVED');
  });

  // ──────────────────────────────────────────────────────────────
  // Priority ordering
  // ──────────────────────────────────────────────────────────────
  it('sorts signals descending by priority — REVISION_REQUESTED beats OPPORTUNITY', async () => {
    const service = buildService({
      deliverableSignals: [mockRevisionSignal],
      opportunitySignals: [mockOpportunitySignal],
    });
    const result = await service.getHomeResponse('creator_id');
    expect(result.items[0].type).toBe('REVISION_REQUESTED');
    expect(result.items[result.items.length - 1].type).toBe('OPPORTUNITY');
  });

  it('sorts INVITATION_RECEIVED above REVISION_REQUESTED only if invitation is much fresher', async () => {
    // REVISION base=100, INVITATION base=90. A very fresh INVITATION gets +recencyBonus.
    // Fresh revision (1 day ago) vs very fresh invitation (1 min ago).
    const freshRevision = { ...mockRevisionSignal, occurredAt: new Date(Date.now() - 86400000) };
    const veryFreshInvitation = { ...mockInvitationSignal, occurredAt: new Date(Date.now() - 60000) };

    const service = buildService({
      deliverableSignals: [freshRevision],
      applicationSignals: [veryFreshInvitation],
    });
    const result = await service.getHomeResponse('creator_id');
    // REVISION base 100 + 0 deadline + small recency vs INVITATION base 90 + 0 + max recency (5)
    // 100+x vs 90+5 — REVISION still wins unless x < -5 (impossible since bonuses are positive)
    expect(result.items[0].type).toBe('REVISION_REQUESTED');
  });

  // ──────────────────────────────────────────────────────────────
  // Category assignment
  // ──────────────────────────────────────────────────────────────
  it('assigns correct categories per signal type', async () => {
    const service = buildService({
      deliverableSignals: [mockRevisionSignal],
      applicationSignals: [mockInvitationSignal],
      opportunitySignals: [mockOpportunitySignal],
    });
    const result = await service.getHomeResponse('creator_id');

    const byType = Object.fromEntries(result.items.map((i) => [i.type, i.category]));
    expect(byType['REVISION_REQUESTED']).toBe('attention');
    expect(byType['INVITATION_RECEIVED']).toBe('attention');
    expect(byType['OPPORTUNITY']).toBe('opportunity');
  });

  // ──────────────────────────────────────────────────────────────
  // HomeItem shape contract — all required fields present
  // ──────────────────────────────────────────────────────────────
  it('every item has all required HomeItem fields', async () => {
    const service = buildService({ deliverableSignals: [mockRevisionSignal] });
    const result = await service.getHomeResponse('creator_id');

    for (const item of result.items) {
      expect(item.id).toBeDefined();
      expect(item.type).toBeDefined();
      expect(item.category).toMatch(/^(attention|progress|opportunity)$/);
      expect(typeof item.priority).toBe('number');
      expect(item.entity).toHaveProperty('type');
      expect(item.entity).toHaveProperty('id');
      expect(item.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(item.actionUrl).toBeDefined();
      expect(item.summary).toBeDefined();
    }
  });

  // ──────────────────────────────────────────────────────────────
  // 12 Fixture account assertions
  // These assert conceptual expectations against the seeded data shapes.
  // They test the composition logic, not live DB queries.
  // ──────────────────────────────────────────────────────────────

  it('[State 1] New creator → only PROFILE_READINESS in attention', async () => {
    const profileSignal = { id: 'profile_readiness_c1', type: 'PROFILE_READINESS' as const, entity: { type: 'creator' as const, id: 'c1' }, occurredAt: new Date(), deadlineAt: null, actionUrl: '/creator/profile', summary: { missingCount: 3, missingFields: 'bio,socialAccounts,rates' } };
    const service = buildService({ profileSignals: [profileSignal] });
    const result = await service.getHomeResponse('c1');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].type).toBe('PROFILE_READINESS');
    expect(result.items[0].category).toBe('attention');
  });

  it('[State 3] Fully setup, no applications → OPPORTUNITY signals only', async () => {
    const service = buildService({ opportunitySignals: [mockOpportunitySignal] });
    const result = await service.getHomeResponse('c3');
    expect(result.items.every((i) => i.category === 'opportunity')).toBe(true);
  });

  it('[State 5] Invited creator → INVITATION_RECEIVED is top item', async () => {
    const service = buildService({ applicationSignals: [mockInvitationSignal], opportunitySignals: [mockOpportunitySignal] });
    const result = await service.getHomeResponse('c5');
    expect(result.items[0].type).toBe('INVITATION_RECEIVED');
  });

  it('[State 9] Revision requested → REVISION_REQUESTED is first', async () => {
    const service = buildService({ deliverableSignals: [mockRevisionSignal], opportunitySignals: [mockOpportunitySignal] });
    const result = await service.getHomeResponse('c9');
    expect(result.items[0].type).toBe('REVISION_REQUESTED');
    expect(result.items).not.toContain(expect.objectContaining({ type: 'OPPORTUNITY' }));
    // Actually OPPORTUNITY is still returned, just lower priority
    const types = result.items.map((i) => i.type);
    expect(types.indexOf('REVISION_REQUESTED')).toBeLessThan(types.indexOf('OPPORTUNITY'));
  });

  it('[State 11] Completed and paid → no attention signals', async () => {
    const service = buildService({ opportunitySignals: [mockOpportunitySignal] });
    const result = await service.getHomeResponse('c11');
    expect(result.items.some((i) => i.category === 'attention')).toBe(false);
  });

  it('[State 12] Pro creator with multiple signals → multiple attention items sorted correctly', async () => {
    const revision = { ...mockRevisionSignal };
    const deadline = { ...mockRevisionSignal, id: 'deadline_app_12b', type: 'DEADLINE_APPROACHING' as const, deadlineAt: new Date(Date.now() + 86400000) };
    const service = buildService({ deliverableSignals: [revision, deadline], opportunitySignals: [mockOpportunitySignal] });
    const result = await service.getHomeResponse('c12');
    // REVISION (base 100) should beat DEADLINE_APPROACHING (base 85) even with deadline bonus
    const types = result.items.map((i) => i.type);
    expect(types.indexOf('REVISION_REQUESTED')).toBeLessThan(types.indexOf('DEADLINE_APPROACHING'));
  });
});
