import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface CreateCampaignDto {
  name: string;
  goal: string;
  category: string;
  country: string;
  city?: string;
  brief: string;
  deliverableType: string;
  quantity: number;
  budgetPerCreator: number;
  currency?: string;
  applicationDeadline?: string;
  deliveryDeadline?: string;
  minFollowers?: number;
  platforms?: string[]; // platform names e.g. ['instagram', 'tiktok']
}

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userRole: string, userId: string, organizationId?: string) {
    if (userRole === 'admin') {
      return this.prisma.campaign.findMany({
        include: { organization: true, applications: true, platforms: { include: { platform: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (userRole === 'brand') {
      if (!organizationId) {
        return [];
      }
      return this.prisma.campaign.findMany({
        where: { organizationId },
        include: { organization: true, applications: true, platforms: { include: { platform: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Creators see open campaigns plus any campaigns they applied to (with applications, deliverables, payments)
    return this.prisma.campaign.findMany({
      where: {
        OR: [
          { status: 'open' },
          { applications: { some: { creator: { userId } } } },
        ],
      },
      include: {
        organization: true,
        platforms: { include: { platform: true } },
        applications: {
          where: { creator: { userId } },
          include: { deliverables: true, payments: true },
        },
        deliverables: {
          where: { application: { creator: { userId } } },
          include: { file: true },
        },
        payments: {
          where: { application: { creator: { userId } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        organization: true,
        platforms: { include: { platform: true } },
        requirements: true,
        applications: {
          include: { creator: true, deliverables: true, payments: true },
        },
        deliverables: { include: { file: true } },
        payments: true,
        activities: { include: { actor: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async create(organizationId: string, dto: CreateCampaignDto, userId: string) {
    if (!organizationId) {
      throw new BadRequestException('User does not belong to a brand organization');
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        organizationId,
        name: dto.name,
        goal: dto.goal,
        category: dto.category.toLowerCase(),
        country: dto.country,
        city: dto.city,
        brief: dto.brief,
        deliverableType: dto.deliverableType,
        quantity: dto.quantity,
        budgetPerCreator: dto.budgetPerCreator,
        currency: dto.currency || 'NGN',
        status: 'draft',
        applicationDeadline: dto.applicationDeadline ? new Date(dto.applicationDeadline) : null,
        deliveryDeadline: dto.deliveryDeadline ? new Date(dto.deliveryDeadline) : null,
        requirements: dto.minFollowers
          ? { create: { minFollowers: dto.minFollowers, category: dto.category, country: dto.country } }
          : undefined,
      },
    });

    // Record initial timeline event
    await this.prisma.campaignActivity.create({
      data: {
        campaignId: campaign.id,
        actorId: userId,
        eventType: 'campaign_created',
        body: `Campaign '${campaign.name}' created as draft.`,
      },
    });

    return campaign;
  }

  async publish(id: string, organizationId: string, userId: string) {
    const campaign = await this.findOne(id);

    if (campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to publish this campaign');
    }

    if (campaign.status !== 'draft') {
      throw new BadRequestException(`Cannot publish campaign in status '${campaign.status}'`);
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: { status: 'open' },
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: id,
        actorId: userId,
        eventType: 'campaign_published',
        body: `Campaign '${campaign.name}' is now open for creator applications.`,
      },
    });

    return updated;
  }

  async cancel(id: string, organizationId: string, userId: string) {
    const campaign = await this.findOne(id);

    if (campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to cancel this campaign');
    }

    if (['completed', 'closed', 'cancelled'].includes(campaign.status)) {
      throw new BadRequestException(`Cannot cancel campaign in terminal status '${campaign.status}'`);
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: id,
        actorId: userId,
        eventType: 'campaign_cancelled',
        body: `Campaign '${campaign.name}' was cancelled.`,
      },
    });

    return updated;
  }
}
