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
  isPrivate?: boolean;
  publishImmediately?: boolean;
  allowReApplication?: boolean;
  reApplicationCooldownDays?: number;
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

    // Creators see open public campaigns, OR private campaigns they are explicitly applied/invited to
    return this.prisma.campaign.findMany({
      where: {
        OR: [
          { status: 'open', isPrivate: false },
          { applications: { some: { creator: { userId } } } },
        ],
      },
      include: {
        organization: true,
        platforms: { include: { platform: true } },
        applications: {
          where: { creator: { userId } },
          include: {
            deliverables: { orderBy: { version: 'desc' }, include: { file: true } },
            payments: true,
          },
        },
        deliverables: {
          where: { application: { creator: { userId } } },
          include: { file: true },
          orderBy: { version: 'desc' },
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
          include: {
            creator: {
              include: {
                user: { select: { email: true } },
                socialAccounts: true,
                stats: true,
              },
            },
            deliverables: {
              include: { file: true },
              orderBy: { version: 'asc' },
            },
            payments: true,
            parentApplication: true,
            childApplications: true,
          },
        },
        deliverables: {
          include: {
            file: true,
            application: {
              include: {
                creator: {
                  include: {
                    user: { select: { email: true } },
                    socialAccounts: true,
                  },
                },
              },
            },
          },
          orderBy: { version: 'asc' },
        },
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

    if (!dto.quantity || dto.quantity < 1) {
      throw new BadRequestException('Campaign creator slots (quantity) must be at least 1');
    }

    if (!dto.budgetPerCreator || Number(dto.budgetPerCreator) <= 0) {
      throw new BadRequestException('Campaign budget per creator must be greater than 0');
    }

    const now = new Date();
    if (dto.deliveryDeadline && new Date(dto.deliveryDeadline) <= now) {
      throw new BadRequestException('Campaign delivery deadline must be in the future');
    }

    if (dto.applicationDeadline && new Date(dto.applicationDeadline) <= now) {
      throw new BadRequestException('Campaign application deadline must be in the future');
    }

    const status = dto.publishImmediately ? 'open' : 'draft';
    const isPrivate = Boolean(dto.isPrivate);

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
        status,
        isPrivate,
        allowReApplication: dto.allowReApplication !== undefined ? Boolean(dto.allowReApplication) : true,
        reApplicationCooldownDays: dto.reApplicationCooldownDays !== undefined ? Number(dto.reApplicationCooldownDays) : 3,
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
        eventType: status === 'open' ? 'campaign_published' : 'campaign_created',
        body: status === 'open'
          ? `Campaign '${campaign.name}' published (${isPrivate ? 'Private / Invitation-Only' : 'Public'}).`
          : `Campaign '${campaign.name}' created as draft.`,
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

    if (!campaign.quantity || campaign.quantity < 1) {
      throw new BadRequestException('Cannot publish a campaign with less than 1 creator slot');
    }

    if (!campaign.budgetPerCreator || Number(campaign.budgetPerCreator) <= 0) {
      throw new BadRequestException('Cannot publish a campaign with a zero or negative budget per creator');
    }

    const now = new Date();
    if (campaign.deliveryDeadline && new Date(campaign.deliveryDeadline) <= now) {
      throw new BadRequestException('Cannot publish a campaign with a delivery deadline in the past');
    }

    if (campaign.applicationDeadline && new Date(campaign.applicationDeadline) <= now) {
      throw new BadRequestException('Cannot publish a campaign with an application deadline in the past');
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

  async close(id: string, organizationId: string, userId: string) {
    const campaign = await this.findOne(id);

    if (campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to close this campaign');
    }

    if (['completed', 'closed', 'cancelled'].includes(campaign.status)) {
      throw new BadRequestException(`Cannot close campaign that is already in status '${campaign.status}'`);
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: { status: 'closed' },
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: id,
        actorId: userId,
        eventType: 'campaign_closed',
        body: `Campaign '${campaign.name}' intake has closed. No new creator applications are accepted.`,
      },
    });

    return updated;
  }

  async archive(id: string, organizationId: string, userId: string) {
    const campaign = await this.findOne(id);

    if (campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to archive this campaign');
    }

    if (!['completed', 'closed', 'cancelled'].includes(campaign.status)) {
      throw new BadRequestException(
        `Only completed, closed, or cancelled campaigns can be archived. Current status: '${campaign.status}'`,
      );
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: { isArchived: true },
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: id,
        actorId: userId,
        eventType: 'campaign_archived',
        body: `Campaign '${campaign.name}' was archived.`,
      },
    });

    return updated;
  }

  async unarchive(id: string, organizationId: string, userId: string) {
    const campaign = await this.findOne(id);

    if (campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to unarchive this campaign');
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: { isArchived: false },
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: id,
        actorId: userId,
        eventType: 'campaign_unarchived',
        body: `Campaign '${campaign.name}' was restored from archives.`,
      },
    });

    return updated;
  }

  async updateReApplicationSettings(
    id: string,
    organizationId: string,
    userId: string,
    dto: { allowReApplication?: boolean; reApplicationCooldownDays?: number },
  ) {
    const campaign = await this.findOne(id);
    if (campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to update settings for this campaign');
    }

    const data: any = {};
    if (dto.allowReApplication !== undefined) data.allowReApplication = Boolean(dto.allowReApplication);
    if (dto.reApplicationCooldownDays !== undefined) data.reApplicationCooldownDays = Math.max(0, Math.min(30, Number(dto.reApplicationCooldownDays)));

    const updated = await this.prisma.campaign.update({
      where: { id },
      data,
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: id,
        actorId: userId,
        eventType: 'campaign_settings_updated',
        body: `Campaign '${campaign.name}' re-application settings updated.`,
      },
    });

    return updated;
  }

  async deleteDraft(id: string, organizationId: string, userId: string) {
    const campaign = await this.findOne(id);

    if (campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to delete this campaign');
    }

    if (campaign.status !== 'draft') {
      throw new BadRequestException(
        'Only unpublished draft campaigns can be deleted. Active or completed campaigns must be closed or archived.',
      );
    }

    if (campaign.applications && campaign.applications.length > 0) {
      throw new BadRequestException('Cannot delete draft with active applications.');
    }

    await this.prisma.campaign.delete({
      where: { id },
    });

    return { success: true, message: `Draft campaign '${campaign.name}' was deleted.` };
  }
}
