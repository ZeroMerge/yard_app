import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PaymentsService } from '../payments/payments.service';

export interface SubmitDeliverableDto {
  providerFileId?: string;
  providerUrl: string;
  provider?: string;
  fileType?: string;
  fileSize?: number;
  notes?: string;
}

export interface RequestRevisionDto {
  revisionNotes: string;
}

// Nigerian Commercial & Digital Bank CBN/Paystack Codes Allowlist
export const KNOWN_NIGERIAN_BANK_CODES = [
  '044', // Access Bank
  '023', // Citibank
  '063', // Diamond Bank (Access)
  '050', // Ecobank
  '070', // Fidelity Bank
  '011', // First Bank of Nigeria
  '214', // FCMB
  '058', // GTBank
  '030', // Heritage Bank
  '301', // Jaiz Bank
  '082', // Keystone Bank
  '101', // Providus Bank
  '076', // Polaris Bank
  '221', // Stanbic IBTC
  '068', // Standard Chartered
  '232', // Sterling Bank
  '100', // Suntrust Bank
  '032', // Union Bank
  '033', // UBA
  '215', // Unity Bank
  '035', // Wema Bank
  '057', // Zenith Bank
  '090110', // VFD MFB
  '090267', // Kuda MFB
  '090115', // TC MFB
  '100004', // OPay / Paycom
  '090405', // Moniepoint MFB
  '090328', // FairMoney MFB
  '090551', // FairMoney
  '090175', // Rubies MFB
];

@Injectable()
export class DeliverablesService {
  private readonly logger = new Logger(DeliverablesService.name);

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

    if (application.campaign.status === 'cancelled') {
      throw new BadRequestException('Cannot submit deliverable to a cancelled campaign.');
    }

    // Version calculation
    const existingCount = application.deliverables.length;
    const version = existingCount + 1;

    const providerFileId = dto.providerFileId || `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const providerUrl = dto.providerUrl || `https://drive.google.com/file/d/${providerFileId}/view`;

    // Create file record
    const file = await this.prisma.file.create({
      data: {
        campaignId: application.campaignId,
        uploadedBy: userId,
        provider: dto.provider || 'cloud_link',
        providerFileId,
        providerUrl,
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
        notes: dto.notes,
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

    const payoutAccount = deliverable.application.creator?.payoutAccount as any;
    const accountNumber = payoutAccount?.account_number || payoutAccount?.accountNumber;
    const bankCode = payoutAccount?.bank_code || payoutAccount?.bankCode;

    if (
      !payoutAccount ||
      !accountNumber ||
      accountNumber === '0123456789' ||
      !/^\d{10}$/.test(String(accountNumber))
    ) {
      throw new BadRequestException(
        'Creator has not set up a valid 10-digit NUBAN account number. Payout cannot proceed.',
      );
    }

    if (!bankCode || !KNOWN_NIGERIAN_BANK_CODES.includes(String(bankCode))) {
      throw new BadRequestException(
        `Creator bank code '${bankCode}' is not a recognized Nigerian bank code. Payout cannot proceed.`,
      );
    }

    // Multiple deliverable version payment guard: check if another deliverable for this application was already approved
    const existingApproved = await this.prisma.deliverable.findFirst({
      where: {
        applicationId: deliverable.applicationId,
        status: 'approved',
        id: { not: id },
      },
    });

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

    // Only initiate payout if no prior deliverable version was already approved for this application
    if (!existingApproved) {
      await this.paymentsService.initiatePayoutForApprovedDeliverable(
        deliverable.campaignId,
        deliverable.applicationId,
        Number(deliverable.campaign.budgetPerCreator),
        deliverable.campaign.currency,
        userId,
      );
    } else {
      this.logger.log(
        `[DeliverablesService] Skipping payout initiation for applicationId ${deliverable.applicationId}: revision was approved, but an approved deliverable (${existingApproved.id}) already initiated payout.`,
      );
    }

    // Check if all accepted applications have at least one approved deliverable
    const acceptedApps = await this.prisma.application.findMany({
      where: {
        campaignId: deliverable.campaignId,
        status: 'accepted',
      },
      include: { deliverables: true },
    });

    const allApproved =
      acceptedApps.length > 0 &&
      acceptedApps.every((app) =>
        app.id === deliverable.applicationId
          ? true
          : app.deliverables.some((d) => d.status === 'approved'),
      );

    if (allApproved) {
      await this.prisma.campaign.update({
        where: { id: deliverable.campaignId },
        data: { status: 'completed' },
      });

      await this.prisma.campaignActivity.create({
        data: {
          campaignId: deliverable.campaignId,
          actorId: userId,
          eventType: 'campaign_completed',
          body: `All creator deliverables approved. Campaign '${deliverable.campaign.name}' marked as completed.`,
        },
      });
    }

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
