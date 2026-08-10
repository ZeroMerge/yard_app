import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PaymentsService } from '../payments/payments.service';

export interface SubmitDeliverableDto {
  providerFileId: string;
  providerUrl?: string;
  provider?: string;
  fileType?: string;
  fileSize?: number;
}

export interface RequestRevisionDto {
  revisionNotes: string;
}

@Injectable()
export class DeliverablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async submit(applicationId: string, creatorId: string, userId: string, dto: SubmitDeliverableDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { campaign: true, deliverables: true },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    if (application.creatorId !== creatorId) {
      throw new ForbiddenException('Not authorized to submit deliverables for this application');
    }

    if (application.status !== 'accepted') {
      throw new BadRequestException(`Cannot submit deliverable for application in status '${application.status}'`);
    }

    // Version calculation
    const existingCount = application.deliverables.length;
    const version = existingCount + 1;

    // Create file record
    const file = await this.prisma.file.create({
      data: {
        campaignId: application.campaignId,
        uploadedBy: userId,
        provider: dto.provider || 'google_drive',
        providerFileId: dto.providerFileId,
        providerUrl: dto.providerUrl || `https://drive.google.com/file/d/${dto.providerFileId}/view`,
        fileType: dto.fileType || 'video/mp4',
        fileSize: dto.fileSize || 10485760,
        status: 'active',
      },
    });

    const deliverable = await this.prisma.deliverable.create({
      data: {
        campaignId: application.campaignId,
        applicationId,
        fileId: file.id,
        status: 'submitted',
        version,
        submittedAt: new Date(),
      },
      include: { file: true, application: { include: { creator: true } } },
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: application.campaignId,
        actorId: userId,
        eventType: 'deliverable_submitted',
        body: `Creator '${deliverable.application.creator.displayName}' submitted deliverable (v${version}).`,
        metadata: { fileId: file.id, providerUrl: file.providerUrl },
      },
    });

    return deliverable;
  }

  async approve(id: string, organizationId: string, userId: string) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id },
      include: { campaign: true, application: { include: { creator: true } } },
    });

    if (!deliverable) {
      throw new NotFoundException(`Deliverable with ID ${id} not found`);
    }

    if (deliverable.campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to review deliverables for this campaign');
    }

    if (deliverable.status === 'approved') {
      throw new BadRequestException('Deliverable is already approved');
    }

    const updated = await this.prisma.deliverable.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedAt: new Date(),
      },
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: deliverable.campaignId,
        actorId: userId,
        eventType: 'deliverable_approved',
        body: `Deliverable (v${deliverable.version}) approved for creator '${deliverable.application.creator.displayName}'.`,
      },
    });

    // Automatically trigger payout job initiation
    await this.paymentsService.initiatePayoutForApprovedDeliverable(
      deliverable.campaignId,
      deliverable.applicationId,
      Number(deliverable.campaign.budgetPerCreator),
      deliverable.campaign.currency,
      userId,
    );

    return updated;
  }

  async requestRevision(id: string, organizationId: string, userId: string, dto: RequestRevisionDto) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id },
      include: { campaign: true, application: { include: { creator: true } } },
    });

    if (!deliverable) {
      throw new NotFoundException(`Deliverable with ID ${id} not found`);
    }

    if (deliverable.campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Not authorized to review deliverables for this campaign');
    }

    const updated = await this.prisma.deliverable.update({
      where: { id },
      data: {
        status: 'revision_requested',
        revisionNotes: dto.revisionNotes,
        reviewedAt: new Date(),
      },
    });

    // Update revision counter in stats
    await this.prisma.creatorStats.upsert({
      where: { creatorId: deliverable.application.creatorId },
      update: { revisionsRequested: { increment: 1 } },
      create: { creatorId: deliverable.application.creatorId, revisionsRequested: 1 },
    });

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: deliverable.campaignId,
        actorId: userId,
        eventType: 'revision_requested',
        body: `Revision requested for deliverable (v${deliverable.version}): "${dto.revisionNotes}"`,
      },
    });

    return updated;
  }
}
