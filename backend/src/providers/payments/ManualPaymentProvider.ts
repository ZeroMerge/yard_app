import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider, PaymentInitiateResult, PaymentVerifyResult, PayoutResult, RefundResult } from './PaymentProvider';

@Injectable()
export class ManualPaymentProvider implements PaymentProvider {
  public readonly name = 'manual';
  private readonly logger = new Logger(ManualPaymentProvider.name);

  async initiateCharge(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentInitiateResult> {
    const ref = `manual_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[ManualPayment] Initiating manual charge request of ${currency} ${amount} (ref: ${ref})`);
    
    // In manual mode, the brand is instructed to pay into a Yard bank account via invoice/bank transfer.
    return {
      ref,
      checkoutUrl: `/dashboard/campaigns/${metadata.campaignId}/payment/instructions`,
      rawResponse: { status: 'manual_instructions_provided', ref },
    };
  }

  async verifyCharge(ref: string): Promise<PaymentVerifyResult> {
    this.logger.log(`[ManualPayment] Verifying charge ref: ${ref}`);
    // Manual payments cannot be automatically verified via an API call.
    // They are verified when a Yard Admin marks them as received.
    // By default, this returns pending unless overridden in the DB.
    return {
      status: 'pending',
      amount: 0,
      currency: 'NGN',
      rawResponse: { status: 'manual_verification_required' },
    };
  }

  async payout(accountDetails: Record<string, any>, amount: number, currency: string = 'NGN'): Promise<PayoutResult> {
    const ref = `manual_payout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[ManualPayment] Initiating manual payout of ${currency} ${amount} to account ${accountDetails?.account_number} (ref: ${ref})`);
    
    // In manual mode, payouts are logged and then Yard staff fulfill them manually via a bank transfer.
    // The status is immediately 'pending' or 'creator_payout_pending'.
    return {
      ref,
      status: 'pending',
      rawResponse: { status: 'manual_payout_logged', ref },
    };
  }

  async refund(ref: string, amount: number): Promise<RefundResult> {
    this.logger.log(`[ManualPayment] Refunding manual transaction ref: ${ref}, amount: ${amount}`);
    return {
      ref: `refund_manual_${ref}`,
      status: 'success',
      rawResponse: { status: 'manual_refund_logged' },
    };
  }
}
