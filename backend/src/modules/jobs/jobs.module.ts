import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsService } from './jobs.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [ScheduleModule.forRoot(), PaymentsModule],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
