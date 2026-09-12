import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getManualPaymentsQueue() {
    return this.prisma.payment.findMany({
      where: {
        provider: 'manual',
        status: { in: ['pending', 'creator_payout_pending', 'paid'] },
      },
      include: {
        campaign: { select: { name: true, organizationId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markPaymentAsPaid(paymentId: string, receiptFileId: string, adminId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'paid',
        receiptFileId: receiptFileId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'manual_payment_fulfilled',
        actorId: adminId,
        targetType: 'payment',
        targetId: paymentId,
        metadata: { receiptFileId },
      },
    });

    return updatedPayment;
  }
}
