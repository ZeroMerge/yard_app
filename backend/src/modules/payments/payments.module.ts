import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { FlutterwaveProvider } from '../../providers/payments/FlutterwaveProvider';
import { PaystackProvider } from '../../providers/payments/PaystackProvider';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, FlutterwaveProvider, PaystackProvider],
  exports: [PaymentsService, FlutterwaveProvider, PaystackProvider],
})
export class PaymentsModule {}
