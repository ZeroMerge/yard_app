import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ManualPaymentProvider } from '../../providers/payments/ManualPaymentProvider';
import { PaystackProvider } from '../../providers/payments/PaystackProvider';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ManualPaymentProvider, PaystackProvider],
  exports: [PaymentsService, ManualPaymentProvider, PaystackProvider],
})
export class PaymentsModule {}
