import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { RawSignal } from './signal.types';
import { DEADLINE_APPROACHING_HOURS } from './signal.config';

/**
 * LAYER 1 — Deliverable Signals
 *
 * Emits:
 *   REVISION_REQUESTED      — deliverable status = 'revision_requested'
 *   DEADLINE_APPROACHING    — accepted application, no submitted deliverable, deadline within 48h
 *   SUBMITTED_UNDER_REVIEW  — deliverable status = 'submitted'
 *   CAMPAIGN_IN_PROGRESS    — accepted application, campaign in_progress, no approved deliverable yet
 *
 * One query via application join. No N+1.
 * Scoped strictly to the given creatorId at the DB WHERE clause level.
 *
 * Schema note: delivery deadline lives on Campaign.deliveryDeadline, not on Deliverable.
 */
@Injectable()
export class DeliverableSignalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDeliverableSignals(creatorId: string): Promise<RawSignal[]> {
    const deadlineCutoff = new Date(
      Date.now() + DEADLINE_APPROACHING_HOURS * 3600 * 1000,
    );

    const applications = await this.prisma.application.findMany({
      where: {
        creatorId,
        status: 'accepted',
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
            deliveryDeadline: true,
            organization: { select: { name: true } },
          },
        },
        deliverables: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    const signals: RawSignal[] = [];
    const now = new Date();

    for (const app of applications) {
      const campaign = app.campaign;
      const latestDeliverable = app.deliverables[0] ?? null;

      if (latestDeliverable) {
        // REVISION_REQUESTED
        if (latestDeliverable.status === 'revision_requested') {
          signals.push({
            id: `revision_${latestDeliverable.id}`,
            type: 'REVISION_REQUESTED',
            entity: { type: 'deliverable', id: latestDeliverable.id },
            occurredAt: latestDeliverable.reviewedAt ?? latestDeliverable.submittedAt,
            deadlineAt: campaign.deliveryDeadline,
            actionUrl: `/creator/work`,
            summary: {
              campaignId: campaign.id,
              campaignName: campaign.name,
              brandName: campaign.organization.name,
              revisionNotes: latestDeliverable.revisionNotes,
              version: latestDeliverable.version,
            },
          });
        }

        // SUBMITTED_UNDER_REVIEW
        if (latestDeliverable.status === 'submitted') {
          signals.push({
            id: `submitted_${latestDeliverable.id}`,
            type: 'SUBMITTED_UNDER_REVIEW',
            entity: { type: 'deliverable', id: latestDeliverable.id },
            occurredAt: latestDeliverable.submittedAt,
            deadlineAt: null,
            actionUrl: `/creator/work`,
            summary: {
              campaignId: campaign.id,
              campaignName: campaign.name,
              brandName: campaign.organization.name,
              version: latestDeliverable.version,
            },
          });
        }
      } else {
        // No deliverable submitted yet

        // DEADLINE_APPROACHING — campaign deadline within 48h
        if (
          campaign.deliveryDeadline &&
          campaign.deliveryDeadline <= deadlineCutoff &&
          campaign.status === 'in_progress'
        ) {
          signals.push({
            id: `deadline_${app.id}`,
            type: 'DEADLINE_APPROACHING',
            entity: { type: 'application', id: app.id },
            occurredAt: app.createdAt,
            deadlineAt: campaign.deliveryDeadline,
            actionUrl: `/creator/work`,
            summary: {
              campaignId: campaign.id,
              campaignName: campaign.name,
              brandName: campaign.organization.name,
              dueDate: campaign.deliveryDeadline.toISOString(),
            },
          });
        }

        // CAMPAIGN_IN_PROGRESS — accepted, active, nothing submitted
        if (campaign.status === 'in_progress') {
          // Only emit if deadline is NOT approaching (to avoid duplicate with above)
          const isApproaching =
            campaign.deliveryDeadline &&
            campaign.deliveryDeadline <= deadlineCutoff;

          if (!isApproaching) {
            signals.push({
              id: `in_progress_${app.id}`,
              type: 'CAMPAIGN_IN_PROGRESS',
              entity: { type: 'application', id: app.id },
              occurredAt: app.createdAt,
              deadlineAt: campaign.deliveryDeadline,
              actionUrl: `/creator/work`,
              summary: {
                campaignId: campaign.id,
                campaignName: campaign.name,
                brandName: campaign.organization.name,
                dueDate: campaign.deliveryDeadline?.toISOString() ?? null,
              },
            });
          }
        }
      }
    }

    return signals;
  }
}
