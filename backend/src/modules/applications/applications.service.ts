import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface ApplyDto {
  pitch?: string;
  source?: 'applied' | 'invited';
  creatorId?: string;
}

export interface RejectDto {
  blockReApply?: boolean;
}

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── helpers ──────────────────────────────────────────────────────────────

  private async findLiveApplication(campaignId: string, creatorId: string) {
    return this.prisma.application.findFirst({
      where: { campaignId, creatorId, status: { notIn: ['rejected', 'withdrawn', 'declined'] } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findLatestRejectedApplication(campaignId: string, creatorId: string) {
    return this.prisma.application.findFirst({
      where: { campaignId, creatorId, status: 'rejected' },
      include: { campaign: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── APPLY ────────────────────────────────────────────────────────────────

  async apply(campaignId: string, creatorId: string, userId: string, dto: ApplyDto) {
    if (!creatorId) throw new BadRequestException('User does not have a creator profile');

    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException(`Campaign with ID ${campaignId} not found`);

    if (!['open', 'in_progress'].includes(campaign.status)) {
      throw new BadRequestException(`Cannot apply to campaign in status '${campaign.status}'`);
    }

    if (campaign.applicationDeadline && new Date() > campaign.applicationDeadline) {
      throw new BadRequestException('The application deadline for this campaign has passed.');
    }

    if (campaign.isPrivate && dto.source !== 'invited') {
      throw new ForbiddenException('This campaign is invitation-only. Creators cannot self-apply.');
    }

    const live = await this.findLiveApplication(campaignId, creatorId);
    if (live) throw new ConflictException('Creator already has an active application for this campaign');

    const latestRejected = await this.findLatestRejectedApplication(campaignId, creatorId);
    let parentApplicationId: string | null = null;
    let reApplicationCount = 0;

    if (latestRejected) {
      if (!campaign.allowReApplication) throw new ForbiddenException('Re-application is not permitted for this campaign.');
      if (latestRejected.blockedFromReApply) throw new ForbiddenException('You are not permitted to re-apply to this campaign.');

      const cooldownDays = latestRejected.rejectedCooldownDays ?? campaign.reApplicationCooldownDays;
      if (latestRejected.rejectedAt && cooldownDays > 0) {
        const canReApplyAt = new Date(latestRejected.rejectedAt);
        canReApplyAt.setDate(canReApplyAt.getDate() + cooldownDays);
        if (new Date() < canReApplyAt) {
          throw new BadRequestException(JSON.stringify({ message: 'Re-application cooldown active.', canReApplyAt }));
        }
      }

      const acceptedCount = await this.prisma.application.count({ where: { campaignId, status: 'accepted' } });
      if (acceptedCount >= campaign.quantity) throw new BadRequestException('All creator slots for this campaign are filled.');

      parentApplicationId = latestRejected.id;
      reApplicationCount = latestRejected.reApplicationCount + 1;
    }

    const application = await this.prisma.application.create({
      data: { campaignId, creatorId, source: dto.source || 'applied', status: 'pending', pitch: dto.pitch, parentApplicationId, reApplicationCount },
      include: { creator: true, campaign: true },
    });

    const isReApply = reApplicationCount > 0;
    await this.prisma.campaignActivity.create({
      data: {
        campaignId,
        actorId: userId,
        eventType: dto.source === 'invited' ? 'creator_invited' : isReApply ? 'application_resubmitted' : 'application_submitted',
        body: dto.source === 'invited'
          ? `Creator '${application.creator.displayName}' was invited to campaign.`
          : isReApply
            ? `Creator '${application.creator.displayName}' re-applied to campaign (attempt #${reApplicationCount + 1}).`
            : `Creator '${application.creator.displayName}' applied to campaign.`,
      },
    });

    return application;
  }

  // ─── INVITE ───────────────────────────────────────────────────────────────

  async invite(campaignId: string, creatorId: string, organizationId: string, userId: string, pitch?: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    if (campaign.organizationId !== organizationId) throw new ForbiddenException('Not authorized to invite creators to this campaign');
    if (!['open', 'in_progress'].includes(campaign.status)) throw new BadRequestException(`Cannot invite creators to campaign in status '${campaign.status}'`);

    const creator = await this.prisma.creator.findUnique({ where: { id: creatorId } });
    if (!creator) throw new NotFoundException(`Creator with ID ${creatorId} not found`);

    const live = await this.findLiveApplication(campaignId, creatorId);
    if (live) throw new ConflictException('Creator has already applied or been invited to this campaign');

    const application = await this.prisma.application.create({
      data: { campaignId, creatorId, source: 'invited', status: 'pending', pitch: pitch || 'Brand invitation' },
      include: { creator: true, campaign: true },
    });

    await this.prisma.campaignActivity.create({
      data: { campaignId, actorId: userId, eventType: 'creator_invited', body: `Creator '${application.creator.displayName}' was invited to campaign.` },
    });

    return application;
  }

  // ─── ACCEPT ───────────────────────────────────────────────────────────────

  async accept(id: string, organizationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({ where: { id }, include: { campaign: true, creator: true } });
    if (!application) throw new NotFoundException(`Application with ID ${id} not found`);
    if (application.campaign.organizationId !== organizationId) throw new ForbiddenException('Not authorized to manage applications for this campaign');
    if (application.status !== 'pending') throw new BadRequestException(`Cannot accept application in status '${application.status}'`);

    const acceptedCount = await this.prisma.application.count({ where: { campaignId: application.campaignId, status: 'accepted' } });
    if (acceptedCount >= application.campaign.quantity) throw new BadRequestException('All creator slots for this campaign are filled.');

    const updated = await this.prisma.application.update({ where: { id }, data: { status: 'accepted', decidedAt: new Date() } });

    if (application.campaign.status === 'open') {
      await this.prisma.campaign.update({ where: { id: application.campaignId }, data: { status: 'in_progress' } });
    }

    await this.prisma.campaignActivity.create({
      data: { campaignId: application.campaignId, actorId: userId, eventType: 'creator_accepted', body: `Creator '${application.creator.displayName}' application was accepted.` },
    });

    return updated;
  }

  // ─── REJECT ───────────────────────────────────────────────────────────────

  async reject(id: string, organizationId: string, userId: string, dto: RejectDto = {}) {
    const application = await this.prisma.application.findUnique({ where: { id }, include: { campaign: true, creator: true } });
    if (!application) throw new NotFoundException(`Application with ID ${id} not found`);
    if (application.campaign.organizationId !== organizationId) throw new ForbiddenException('Not authorized to manage applications for this campaign');
    if (application.status !== 'pending') throw new BadRequestException(`Cannot reject application in status '${application.status}'`);

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: 'rejected',
        decidedAt: new Date(),
        rejectedAt: new Date(),
        rejectedCooldownDays: application.campaign.reApplicationCooldownDays,
        blockedFromReApply: dto.blockReApply ?? false,
      },
    });

    await this.prisma.campaignActivity.create({
      data: { campaignId: application.campaignId, actorId: userId, eventType: 'application_rejected', body: `Creator '${application.creator.displayName}' application was not moved forward.` },
    });

    return updated;
  }

  // ─── RECONSIDER ───────────────────────────────────────────────────────────

  async reconsider(id: string, organizationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({ where: { id }, include: { campaign: true, creator: true } });
    if (!application) throw new NotFoundException(`Application with ID ${id} not found`);
    if (application.campaign.organizationId !== organizationId) throw new ForbiddenException('Not authorized to manage applications for this campaign');
    if (application.status !== 'rejected') throw new BadRequestException(`Can only reconsider rejected applications. Current status: '${application.status}'`);
    if (application.source === 'invited') throw new BadRequestException('Cannot reconsider an invitation declined by the creator.');

    const acceptedCount = await this.prisma.application.count({ where: { campaignId: application.campaignId, status: 'accepted' } });
    if (acceptedCount >= application.campaign.quantity) throw new BadRequestException('Cannot reconsider — all creator slots are filled.');

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: 'pending', decidedAt: null, rejectedAt: null, blockedFromReApply: false },
    });

    await this.prisma.campaignActivity.create({
      data: { campaignId: application.campaignId, actorId: userId, eventType: 'application_reconsidered', body: `Creator '${application.creator.displayName}' application was reconsidered and returned to pending review.` },
    });

    return updated;
  }

  // ─── RE-APPLY ELIGIBILITY ─────────────────────────────────────────────────

  async getReApplyEligibility(campaignId: string, creatorId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException(`Campaign with ID ${campaignId} not found`);

    if (campaign.isPrivate) return { eligible: false, reason: 'private_campaign' as const };

    const latestRejected = await this.findLatestRejectedApplication(campaignId, creatorId);
    if (!latestRejected) return { eligible: false, reason: 'no_prior_rejection' as const };

    if (campaign.status !== 'open') return { eligible: false, reason: 'campaign_closed' as const };
    if (!campaign.allowReApplication) return { eligible: false, reason: 'blocked' as const };
    if (latestRejected.blockedFromReApply) return { eligible: false, reason: 'blocked' as const };

    const acceptedCount = await this.prisma.application.count({ where: { campaignId, status: 'accepted' } });
    if (acceptedCount >= campaign.quantity) return { eligible: false, reason: 'slots_full' as const };

    const live = await this.findLiveApplication(campaignId, creatorId);
    if (live) return { eligible: false, reason: 'already_applied' as const };

    const cooldownDays = latestRejected.rejectedCooldownDays ?? campaign.reApplicationCooldownDays;
    if (latestRejected.rejectedAt && cooldownDays > 0) {
      const canReApplyAt = new Date(latestRejected.rejectedAt);
      canReApplyAt.setDate(canReApplyAt.getDate() + cooldownDays);
      if (new Date() < canReApplyAt) {
        return { eligible: false, reason: 'in_cooldown' as const, canReApplyAt, previousApplicationId: latestRejected.id };
      }
    }

    return { eligible: true, previousApplicationId: latestRejected.id, previousPitch: latestRejected.pitch, reApplicationCount: latestRejected.reApplicationCount + 1 };
  }

  // ─── WITHDRAW ─────────────────────────────────────────────────────────────

  async withdraw(id: string, creatorId: string, userId: string) {
    const application = await this.prisma.application.findUnique({ where: { id }, include: { creator: true } });
    if (!application) throw new NotFoundException(`Application with ID ${id} not found`);
    if (application.creatorId !== creatorId) throw new ForbiddenException('Not authorized to withdraw this application');
    if (application.status !== 'pending') throw new BadRequestException(`Cannot withdraw application in status '${application.status}'`);

    const updated = await this.prisma.application.update({ where: { id }, data: { status: 'withdrawn' } });

    await this.prisma.campaignActivity.create({
      data: { campaignId: application.campaignId, actorId: userId, eventType: 'application_withdrawn', body: `Creator '${application.creator.displayName}' withdrew application.` },
    });

    return updated;
  }

  // ─── CREATOR ACCEPT INVITATION ────────────────────────────────────────────

  async creatorAcceptInvitation(id: string, creatorId: string, userId: string) {
    const application = await this.prisma.application.findUnique({ where: { id }, include: { campaign: true, creator: true } });
    if (!application) throw new NotFoundException(`Application with ID ${id} not found`);
    if (application.creatorId !== creatorId) throw new ForbiddenException('Not authorized to respond to this invitation');
    if (application.source !== 'invited') throw new BadRequestException('This endpoint is only for brand invitations');
    if (application.status !== 'pending') throw new BadRequestException(`Cannot accept invitation in status '${application.status}'`);

    const acceptedCount = await this.prisma.application.count({ where: { campaignId: application.campaignId, status: 'accepted' } });
    if (acceptedCount >= application.campaign.quantity) throw new BadRequestException('All creator slots for this campaign are filled.');

    const updated = await this.prisma.application.update({ where: { id }, data: { status: 'accepted', decidedAt: new Date() } });

    if (application.campaign.status === 'open') {
      await this.prisma.campaign.update({ where: { id: application.campaignId }, data: { status: 'in_progress' } });
    }

    await this.prisma.campaignActivity.create({
      data: { campaignId: application.campaignId, actorId: userId, eventType: 'invitation_accepted', body: `Creator '${application.creator.displayName}' accepted the brand invitation.` },
    });

    return updated;
  }

  // ─── CREATOR DECLINE INVITATION ───────────────────────────────────────────

  async creatorDeclineInvitation(id: string, creatorId: string, userId: string) {
    const application = await this.prisma.application.findUnique({ where: { id }, include: { campaign: true, creator: true } });
    if (!application) throw new NotFoundException(`Application with ID ${id} not found`);
    if (application.creatorId !== creatorId) throw new ForbiddenException('Not authorized to respond to this invitation');
    if (application.source !== 'invited') throw new BadRequestException('This endpoint is only for brand invitations');
    if (application.status !== 'pending') throw new BadRequestException(`Cannot decline invitation in status '${application.status}'`);

    // Use 'declined' (not 'rejected') so we can distinguish creator-declined from brand-rejected
    const updated = await this.prisma.application.update({ where: { id }, data: { status: 'declined', decidedAt: new Date() } });

    await this.prisma.campaignActivity.create({
      data: { campaignId: application.campaignId, actorId: userId, eventType: 'invitation_declined', body: `Creator '${application.creator.displayName}' declined the brand invitation.` },
    });

    return updated;
  }
}
