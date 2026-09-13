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

    if (filter.minFollowers) {
      const min = Number(filter.minFollowers);
      if (!isNaN(min) && min > 0) {
        where.socialMetricSnapshots = {
          some: {
            followers: { gte: min },
          },
        };
      }
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
        socialMetricSnapshots: true,
        categories: true,
        languages: true,
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

    await this.prisma.creator.update({
      where: { id: creator.id },
      data: {
        displayName: data.displayName || creator.displayName,
        bio: data.bio !== undefined ? data.bio : creator.bio,
        profileImageUrl: data.profileImageUrl || creator.profileImageUrl,
        payoutAccount: data.payoutAccount ? data.payoutAccount : creator.payoutAccount,
      },
    });

    // Handle rates if provided
    if (Array.isArray(data.rates)) {
      await this.prisma.creatorRate.deleteMany({
        where: { creatorId: creator.id },
      });
      if (data.rates.length > 0) {
        await this.prisma.creatorRate.createMany({
          data: data.rates.map((r: any) => ({
            creatorId: creator.id,
            deliverableType: r.deliverableType,
            amount: Number(r.amount),
            currency: r.currency || 'NGN',
          })),
        });
      }
    }

    // Handle categories if provided
    if (Array.isArray(data.categories)) {
      await this.prisma.creatorCategory.deleteMany({
        where: { creatorId: creator.id },
      });
      if (data.categories.length > 0) {
        await this.prisma.creatorCategory.createMany({
          data: data.categories.map((cat: any) => ({
            creatorId: creator.id,
            category: (typeof cat === 'string' ? cat : cat.category).toLowerCase().trim(),
          })),
          skipDuplicates: true,
        });
      }
    }

    // Handle languages if provided
    if (Array.isArray(data.languages)) {
      await this.prisma.creatorLanguage.deleteMany({
        where: { creatorId: creator.id },
      });
      if (data.languages.length > 0) {
        await this.prisma.creatorLanguage.createMany({
          data: data.languages.map((lang: any) => ({
            creatorId: creator.id,
            language: (typeof lang === 'string' ? lang : lang.language).trim(),
          })),
          skipDuplicates: true,
        });
      }
    }

    return this.findOne(creator.id);
  }

  async getHomeState(userId: string) {
    const creator = await this.prisma.creator.findFirst({
      where: { userId },
      include: {
        socialAccounts: true,
        rates: true,
        applications: {
          include: {
            campaign: true,
            deliverables: true,
            payments: true,
          }
        }
      },
    });

    if (!creator) {
      throw new NotFoundException(`Creator profile for user ${userId} not found`);
    }

    // Determine Profile Completeness
    const missingFields: string[] = [];
    if (!creator.bio) missingFields.push('bio');
    if (!creator.socialAccounts || creator.socialAccounts.length === 0) missingFields.push('socialAccounts');
    if (!creator.rates || creator.rates.length === 0) missingFields.push('rates');
    
    const isProfileReady = missingFields.length === 0;

    // Categorize Urgent Actions and Active Work
    const urgentActions = [];
    const activeWork = [];
    
    const now = new Date();

    for (const app of creator.applications) {
      const camp = app.campaign;

      // 1. Invitations
      if (app.source === 'invited' && app.status === 'pending') {
        urgentActions.push({
          type: 'INVITATION',
          campaignName: camp.name,
          applicationId: app.id,
          campaignId: camp.id
        });
      }

      // 2. Accepted campaigns (Active Work)
      if (app.status === 'accepted') {
        const deliverables = app.deliverables;
        let workStatus = 'ACCEPTED';

        if (deliverables.length > 0) {
          const d = deliverables[0]; // Simplification for MVP (1 deliverable)
          
          if (d.status === 'revision_requested') {
            urgentActions.push({
              type: 'REVISION_REQUESTED',
              campaignName: camp.name,
              deliverableId: d.id,
              notes: d.revisionNotes
            });
            workStatus = 'REVISION_REQUESTED';
          } else if (d.status === 'submitted') {
            workStatus = 'SUBMITTED_UNDER_REVIEW';
          } else if (d.status === 'approved') {
             const payment = app.payments[0];
             if (payment && payment.status === 'paid') {
               workStatus = 'PAYMENT_COMPLETED';
             } else {
               workStatus = 'APPROVED_PENDING_PAYMENT';
             }
          }
        } else {
          // No deliverable submitted yet. Check deadline.
          if (camp.deliveryDeadline) {
             const daysLeft = (camp.deliveryDeadline.getTime() - now.getTime()) / (1000 * 3600 * 24);
             if (daysLeft <= 3 && daysLeft >= 0) {
                urgentActions.push({
                  type: 'DELIVERABLE_DUE_SOON',
                  campaignName: camp.name,
                  dueDate: camp.deliveryDeadline,
                  applicationId: app.id
                });
             } else if (daysLeft < 0) {
                urgentActions.push({
                  type: 'DELIVERABLE_OVERDUE',
                  campaignName: camp.name,
                  dueDate: camp.deliveryDeadline,
                  applicationId: app.id
                });
             }
          }
        }

        // Only add to active work if not fully closed
        if (workStatus !== 'PAYMENT_COMPLETED' && camp.status !== 'closed') {
          activeWork.push({
            campaignName: camp.name,
            campaignId: camp.id,
            applicationId: app.id,
            status: workStatus,
          });
        }
      }
    }

    return {
      profileCompletion: {
        isReady: isProfileReady,
        missingFields,
      },
      urgentActions,
      activeWork,
      opportunities: [], // Future: fetch suggested campaigns
    };
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
