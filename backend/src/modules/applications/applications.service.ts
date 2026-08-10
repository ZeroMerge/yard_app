import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface ApplyDto {
  pitch?: string;
  source?: 'applied' | 'invited';
}

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(campaignId: string, creatorId: string, userId: string, dto: ApplyDto) {
    if (!creatorId) {
      throw new BadRequestException('User does not have a creator profile');
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    if (!['open', 'in_progress'].includes(campaign.status)) {
      throw new BadRequestException(`Cannot apply to campaign in status '${campaign.status}'`);
    }

    const existing = await this.prisma.application.findUnique({
      where: { campaignId_creatorId: { campaignId, creatorId } },
    });

    if (existing) {
      throw new ConflictException('Creator has already applied to this campaign');
    }

    const application = await this.prisma.application.create({
      data: {
        campaignId,
        creatorId,
        source: dto.source || 'applied',
        status: 'pending',
        pitch: dto.pitch,
      },
      include: { creator: true, campaign: true },
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId,
        actorId: userId,
        eventType: dto.source === 'invited' ? 'creator_invited' : 'application_submitted',
        body: `Creator '${application.creator.displayName}' ${dto.source === 'invited' ? 'was invited to' : 'applied to'} campaign.`,
      },
    });

    return application;
  }

  async accept(id: string, organizationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { campaign: true, creator: true },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    if (application.campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to manage applications for this campaign');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException(`Cannot accept application in status '${application.status}'`);
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: 'accepted',
        decidedAt: new Date(),
      },
    });

    // Move campaign status to in_progress if currently open
    if (application.campaign.status === 'open') {
      await this.prisma.campaign.update({
        where: { id: application.campaignId },
        data: { status: 'in_progress' },
      });
    }

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: application.campaignId,
        actorId: userId,
        eventType: 'creator_accepted',
        body: `Creator '${application.creator.displayName}' application was accepted.`,
      },
    });

    return updated;
  }

  async reject(id: string, organizationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { campaign: true, creator: true },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    if (application.campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to manage applications for this campaign');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException(`Cannot reject application in status '${application.status}'`);
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: 'rejected',
        decidedAt: new Date(),
      },
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: application.campaignId,
        actorId: userId,
        eventType: 'application_rejected',
        body: `Creator '${application.creator.displayName}' application was rejected.`,
      },
    });

    return updated;
  }

  async withdraw(id: string, creatorId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { creator: true },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    if (application.creatorId !== creatorId) {
      throw new ForbiddenException('Not authorized to withdraw this application');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException(`Cannot withdraw application in status '${application.status}'`);
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: 'withdrawn' },
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: application.campaignId,
        actorId: userId,
        eventType: 'application_withdrawn',
        body: `Creator '${application.creator.displayName}' withdrew application.`,
      },
    });

    return updated;
  }
}
