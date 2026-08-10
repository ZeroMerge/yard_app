import { Controller, Get, Post, Param, Body, Headers, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('payments/:campaignId')
  async getPaymentsForCampaign(@Param('campaignId') campaignId: string) {
    return this.paymentsService.getPaymentsForCampaign(campaignId);
  }

  @Post(['webhooks/flutterwave', 'payments/webhook/flutterwave'])
  async handleFlutterwaveWebhook(
    @Headers('verif-hash') verifHash: string,
    @Body() payload: any,
  ) {
    return this.paymentsService.handleWebhook('flutterwave', verifHash, payload);
  }

  @Post(['webhooks/paystack', 'payments/webhook/paystack'])
  async handlePaystackWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() payload: any,
  ) {
    return this.paymentsService.handleWebhook('paystack', signature, payload);
  }
}
