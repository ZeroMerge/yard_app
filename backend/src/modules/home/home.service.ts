import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { HomeItem, HomeResponse, RawSignal } from './signals/signal.types';
import { SIGNAL_BASE_WEIGHTS, SIGNAL_CATEGORIES } from './signals/signal.config';
import { ScoringService } from './scoring/scoring.service';
import { ProfileSignalsService } from './signals/profile.signals';
import { ApplicationSignalsService } from './signals/application.signals';
import { DeliverableSignalsService } from './signals/deliverable.signals';
import { PaymentSignalsService } from './signals/payment.signals';
import { OpportunitySignalsService } from './signals/opportunity.signals';
import { v4 as uuidv4 } from 'uuid';

/**
 * LAYER 2 — Composition Service
 *
 * The single place where "relevance" is determined.
 * Runs all signal sources concurrently via Promise.allSettled.
 * If one source throws, it is logged and omitted — the endpoint never fails entirely.
 *
 * Does NOT truncate or cap the result list.
 * Capping per zone is a frontend concern.
 */
@Injectable()
export class HomeService {
  private readonly logger = new Logger(HomeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: ScoringService,
    private readonly profileSignals: ProfileSignalsService,
    private readonly applicationSignals: ApplicationSignalsService,
    private readonly deliverableSignals: DeliverableSignalsService,
    private readonly paymentSignals: PaymentSignalsService,
    private readonly opportunitySignals: OpportunitySignalsService,
  ) {}

  async getHomeResponse(creatorId: string): Promise<HomeResponse> {
    const startMs = Date.now();

    // Run all 5 signal sources concurrently. Never throws.
    const [profileResult, applicationResult, deliverableResult, paymentResult, opportunityResult] =
      await Promise.allSettled([
        this.profileSignals.getProfileSignals(creatorId),
        this.applicationSignals.getApplicationSignals(creatorId),
        this.deliverableSignals.getDeliverableSignals(creatorId),
        this.paymentSignals.getPaymentSignals(creatorId),
        this.opportunitySignals.getOpportunitySignals(creatorId),
      ]);

    // Collect results, log failures
    const sourceCounts: Record<string, number> = {};

    const extractSignals = (
      result: PromiseSettledResult<RawSignal[]>,
      name: string,
    ): RawSignal[] => {
      if (result.status === 'fulfilled') {
        sourceCounts[name] = result.value.length;
        return result.value;
      } else {
        this.logger.error(
          `[HomeService] Signal source '${name}' failed for creatorId=${creatorId}: ${result.reason?.message ?? result.reason}`,
        );
        sourceCounts[name] = 0;
        return [];
      }
    };

    const allSignals: RawSignal[] = [
      ...extractSignals(profileResult, 'profile'),
      ...extractSignals(applicationResult, 'application'),
      ...extractSignals(deliverableResult, 'deliverable'),
      ...extractSignals(paymentResult, 'payment'),
      ...extractSignals(opportunityResult, 'opportunity'),
    ];

    const now = new Date();

    // Compose into HomeItem[]
    const items: HomeItem[] = allSignals.map((signal): HomeItem => {
      const baseWeight = SIGNAL_BASE_WEIGHTS[signal.type] ?? 0;
      const priority = this.scoring.computePriority(
        baseWeight,
        signal.deadlineAt,
        signal.occurredAt,
        now,
      );

      return {
        id: signal.id,
        type: signal.type,
        category: SIGNAL_CATEGORIES[signal.type],
        priority,
        entity: signal.entity,
        occurredAt: signal.occurredAt.toISOString(),
        deadlineAt: signal.deadlineAt?.toISOString() ?? null,
        actionUrl: signal.actionUrl,
        summary: signal.summary,
      };
    });

    // Sort descending by priority
    items.sort((a, b) => b.priority - a.priority);

    const compositionMs = Date.now() - startMs;
    this.logger.log(
      `[HomeService] creatorId=${creatorId} signals=[profile:${sourceCounts.profile}, application:${sourceCounts.application}, deliverable:${sourceCounts.deliverable}, payment:${sourceCounts.payment}, opportunity:${sourceCounts.opportunity}] total=${items.length} compositionMs=${compositionMs}`,
    );

    return { items };
  }
}
