import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface CreatorFilterDto {
  category?: string;
  country?: string;
  city?: string;
  platform?: string;
  minFollowers?: number;
  maxRate?: number;
}

@Injectable()
export class CreatorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(filter: CreatorFilterDto) {
    const where: any = {};

    if (filter.category) {
      where.categories = {
        some: { category: filter.category.toLowerCase() },
      };
    }

    if (filter.country) {
      where.locations = {
        some: { country: { contains: filter.country, mode: 'insensitive' } },
      };
    }

    if (filter.platform) {
      where.socialAccounts = {
        some: { platform: filter.platform.toLowerCase() },
      };
    }

    if (filter.maxRate) {
      where.rates = {
        some: { amount: { lte: filter.maxRate } },
      };
    }

    return this.prisma.creator.findMany({
      where,
      include: {
        socialAccounts: true,
        categories: true,
        locations: true,
        rates: true,
        stats: true,
      },
    });
  }

  async findOne(id: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { id },
      include: {
        socialAccounts: true,
        categories: true,
        languages: true,
        locations: true,
        rates: true,
        portfolioItems: { include: { file: true } },
        stats: true,
      },
    });
    if (!creator) {
      throw new NotFoundException(`Creator with ID ${id} not found`);
    }
    return creator;
  }

  async findByUserId(userId: string) {
    const creator = await this.prisma.creator.findFirst({
      where: { userId },
      include: {
        socialAccounts: true,
        categories: true,
        languages: true,
        locations: true,
        rates: true,
        portfolioItems: { include: { file: true } },
        stats: true,
      },
    });
    if (!creator) {
      throw new NotFoundException(`Creator profile for user ${userId} not found`);
    }
    return creator;
  }

  async updateProfile(userId: string, data: any) {
    const creator = await this.findByUserId(userId);
    return this.prisma.creator.update({
      where: { id: creator.id },
      data: {
        displayName: data.displayName || creator.displayName,
        bio: data.bio !== undefined ? data.bio : creator.bio,
        profileImageUrl: data.profileImageUrl || creator.profileImageUrl,
        payoutAccount: data.payoutAccount ? data.payoutAccount : creator.payoutAccount,
      },
    });
  }

  async verifyCreator(id: string, verified: boolean, adminUserId: string, reason?: string) {
    const updated = await this.prisma.creator.update({
      where: { id },
      data: { verified },
    });

    await this.auditService.logAction(
      adminUserId,
      verified ? 'creator_verified' : 'creator_unverified',
      'creator',
      id,
      { reason: reason || 'Admin action in Founders Console' },
    );

    return updated;
  }
}
