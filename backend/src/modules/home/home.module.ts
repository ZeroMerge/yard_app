import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { ScoringService } from './scoring/scoring.service';
import { ProfileSignalsService } from './signals/profile.signals';
import { ApplicationSignalsService } from './signals/application.signals';
import { DeliverableSignalsService } from './signals/deliverable.signals';
import { PaymentSignalsService } from './signals/payment.signals';
import { OpportunitySignalsService } from './signals/opportunity.signals';

@Module({
  controllers: [HomeController],
  providers: [
    HomeService,
    ScoringService,
    ProfileSignalsService,
    ApplicationSignalsService,
    DeliverableSignalsService,
    PaymentSignalsService,
    OpportunitySignalsService,
  ],
})
export class HomeModule {}
