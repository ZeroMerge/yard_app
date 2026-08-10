import { Module } from '@nestjs/common';
import { DeliverablesController } from './deliverables.controller';
import { DeliverablesService } from './deliverables.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [DeliverablesController],
  providers: [DeliverablesService],
  exports: [DeliverablesService],
})
export class DeliverablesModule {}
