import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { RawSignal } from './signal.types';

/**
 * LAYER 1 — Opportunity Signals
 *
 * Emits OPPORTUNITY for up to 3 campaigns that match the creator's categories
 * and country. Campaigns must be in 'open' status.
 *
 * No ML. No Discover service coupling.
 * Simple overlap matching: creator.categories ∩ campaign.category,
 * and creator.locations[0].country = campaign.country.
 *
 * One query per signal function call. Returns at most 3 signals.
 * Scoped to creatorId at the DB WHERE level.
 */
@Injectable()
export class OpportunitySignalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOpportunitySignals(creatorId: string): Promise<RawSignal[]> {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
      select: {
        categories: { select: { category: true } },
        locations: { select: { country: true }, take: 1 },
        applications: { select: { campaignId: true } },
      },
    });

    if (!creator) return [];

    const creatorCategories = creator.categories.map((c) => c.category);
    const creatorCountry = creator.locations[0]?.country ?? null;
    const appliedCampaignIds = creator.applications.map((a) => a.campaignId);

    const campaigns = await this.prisma.campaign.findMany({
      where: {
        status: 'open',
        // Exclude campaigns the creator has already applied to
        id: { notIn: appliedCampaignIds },
        ...(creatorCategories.length > 0
          ? { category: { in: creatorCategories } }
          : {}),
        ...(creatorCountry ? { country: creatorCountry } : {}),
      },
      include: {
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    return campaigns.map((campaign) => ({
      id: `opportunity_${campaign.id}_${creatorId}`,
      type: 'OPPORTUNITY' as const,
      entity: { type: 'campaign' as const, id: campaign.id },
      occurredAt: campaign.createdAt,
      deadlineAt: campaign.applicationDeadline,
      actionUrl: `/creator/campaigns`,
      summary: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        brandName: campaign.organization.name,
        category: campaign.category,
        budgetPerCreator: Number(campaign.budgetPerCreator),
        currency: campaign.currency,
      },
    }));
  }
}
