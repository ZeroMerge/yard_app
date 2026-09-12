import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { RawSignal } from './signal.types';

/**
 * LAYER 1 — Profile Signals
 *
 * Emits PROFILE_READINESS if the creator's profile is missing fields
 * required for brand discoverability.
 *
 * "Ready" definition (Q1 working default):
 *   - bio is non-null
 *   - at least 1 CreatorSocialAccount
 *   - at least 1 CreatorRate
 *
 * One query. No N+1.
 * Scoped strictly to the given creatorId.
 */
@Injectable()
export class ProfileSignalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileSignals(creatorId: string): Promise<RawSignal[]> {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        bio: true,
        profileImageUrl: true,
        payoutAccount: true,
        createdAt: true,
        socialAccounts: { select: { id: true }, take: 1 },
        rates: { select: { id: true }, take: 1 },
        locations: { select: { id: true }, take: 1 },
      },
    });

    if (!creator) return [];

    const missingFields: string[] = [];
    if (!creator.bio) missingFields.push('bio');
    if (!creator.profileImageUrl) missingFields.push('profileImage');
    if (!creator.payoutAccount) missingFields.push('payoutAccount');
    if (creator.socialAccounts.length === 0) missingFields.push('socialAccounts');
    if (creator.rates.length === 0) missingFields.push('rates');
    if (creator.locations.length === 0) missingFields.push('location');

    if (missingFields.length === 0) return [];

    return [
      {
        id: `profile_readiness_${creatorId}`,
        type: 'PROFILE_READINESS',
        entity: { type: 'creator', id: creatorId },
        occurredAt: creator.createdAt,
        deadlineAt: null,
        actionUrl: '/creator/profile',
        summary: {
          missingCount: missingFields.length,
          missingFields: missingFields.join(','),
        },
      },
    ];
  }
}
