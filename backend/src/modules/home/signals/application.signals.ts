import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { RawSignal } from './signal.types';
import { APPLICATION_RESPONSE_WINDOW_DAYS } from './signal.config';

/**
 * LAYER 1 — Application Signals
 *
 * Emits:
 *   INVITATION_RECEIVED  — brand-initiated application pending creator response
 *   APPLICATION_RESPONSE — brand accepted/rejected within the recency window
 *
 * One query. No N+1.
 * Scoped strictly to the given creatorId at the DB WHERE clause level.
 *
 * NOTE (Q6): There is currently no creator-facing "accept invitation" endpoint.
 * The one-tap action for INVITATION_RECEIVED is blocked until that endpoint exists.
 * The signal is still emitted correctly — the frontend links to Work for now.
 */
@Injectable()
export class ApplicationSignalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getApplicationSignals(creatorId: string): Promise<RawSignal[]> {
    const responseWindowCutoff = new Date(
      Date.now() - APPLICATION_RESPONSE_WINDOW_DAYS * 24 * 3600 * 1000,
    );

    const applications = await this.prisma.application.findMany({
      where: {
        creatorId,
        OR: [
          { source: 'invited', status: 'pending' },
          {
            status: { in: ['accepted', 'rejected'] },
            decidedAt: { gte: responseWindowCutoff },
          },
        ],
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            organization: { select: { name: true } },
          },
        },
      },
    });

    const signals: RawSignal[] = [];

    for (const app of applications) {
      if (app.source === 'invited' && app.status === 'pending') {
        signals.push({
          id: `invitation_${app.id}`,
          type: 'INVITATION_RECEIVED',
          entity: { type: 'application', id: app.id },
          occurredAt: app.createdAt,
          deadlineAt: null,
          // NOTE: actionUrl will link to Work once creator accept endpoint exists (Q6)
          actionUrl: `/creator/work`,
          summary: {
            campaignId: app.campaignId,
            campaignName: app.campaign.name,
            brandName: app.campaign.organization.name,
          },
        });
      } else if (
        (app.status === 'accepted' || app.status === 'rejected') &&
        app.decidedAt
      ) {
        signals.push({
          id: `app_response_${app.id}`,
          type: 'APPLICATION_RESPONSE',
          entity: { type: 'application', id: app.id },
          occurredAt: app.decidedAt,
          deadlineAt: null,
          actionUrl: `/creator/work`,
          summary: {
            campaignId: app.campaignId,
            campaignName: app.campaign.name,
            brandName: app.campaign.organization.name,
            result: app.status, // 'accepted' | 'rejected'
          },
        });
      }
    }

    return signals;
  }
}
