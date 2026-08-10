export interface PaymentInitiateResult {
  ref: string;
  checkoutUrl: string;
  rawResponse?: any;
}

export interface PaymentVerifyResult {
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  rawResponse?: any;
}

export interface PayoutResult {
  ref: string;
  status: 'success' | 'failed' | 'pending';
  rawResponse?: any;
}

export interface RefundResult {
  ref: string;
  status: 'success' | 'failed';
  rawResponse?: any;
}

export interface PaymentProvider {
  name: string;
  initiateCharge(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentInitiateResult>;
  verifyCharge(ref: string): Promise<PaymentVerifyResult>;
  payout(accountDetails: Record<string, any>, amount: number, currency?: string): Promise<PayoutResult>;
  refund(ref: string, amount: number): Promise<RefundResult>;
}
