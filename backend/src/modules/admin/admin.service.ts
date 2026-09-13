import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getManualPaymentsQueue() {
    return this.prisma.payment.findMany({
      include: {
        campaign: { select: { name: true, organizationId: true } },
        application: {
          include: {
            creator: {
              select: {
                displayName: true,
                payoutAccount: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markPaymentAsPaid(paymentId: string, receiptNote: string, adminId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        application: {
          include: {
            creator: true,
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'paid',
        providerRef: payment.providerRef || receiptNote || 'manual_bank_transfer',
      },
    });

    if (payment.application?.creatorId) {
      await this.prisma.creatorStats.upsert({
        where: { creatorId: payment.application.creatorId },
        update: { campaignsCompleted: { increment: 1 } },
        create: { creatorId: payment.application.creatorId, campaignsCompleted: 1 },
      });
    }

    await this.prisma.campaignActivity.create({
      data: {
        campaignId: payment.campaignId,
        actorId: adminId,
        eventType: 'payout_completed',
        body: `Payout of ${payment.currency} ${payment.amount} marked as paid by admin (Ref: ${receiptNote || 'Manual transfer'}).`,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'manual_payment_fulfilled',
        actorId: adminId,
        targetType: 'payment',
        targetId: paymentId,
        metadata: { receiptNote, amount: Number(payment.amount), currency: payment.currency },
      },
    });

    return updatedPayment;
  }

  async getStats() {
    const [
      totalUsers,
      creatorsCount,
      verifiedCreatorsCount,
      brandsCount,
      totalCampaigns,
      campaigns,
      payments,
      auditLogsCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.creator.count(),
      this.prisma.creator.count({ where: { verified: true } }),
      this.prisma.organization.count(),
      this.prisma.campaign.count(),
      this.prisma.campaign.findMany({ select: { status: true, budgetPerCreator: true, quantity: true, currency: true } }),
      this.prisma.payment.findMany({ select: { status: true, amount: true, currency: true } }),
      this.prisma.auditLog.count(),
    ]);

    const campaignsByStatus = campaigns.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paymentsByStatus = payments.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalEscrowVolume = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const paidVolume = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
      users: {
        total: totalUsers,
        creators: creatorsCount,
        verifiedCreators: verifiedCreatorsCount,
        brands: brandsCount,
      },
      campaigns: {
        total: totalCampaigns,
        byStatus: campaignsByStatus,
      },
      payments: {
        total: payments.length,
        byStatus: paymentsByStatus,
        totalEscrowVolume,
        paidVolume,
      },
      auditLogsCount,
    };
  }

  async getUsers(params?: { search?: string; role?: string; status?: string }) {
    const where: any = {};
    if (params?.role) where.role = params.role;
    if (params?.status) where.status = params.status;
    if (params?.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { id: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        creators: {
          select: {
            id: true,
            displayName: true,
            verified: true,
            categories: true,
            stats: true,
            payoutAccount: true,
          },
        },
        organizationMembers: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                industry: true,
                website: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      creator: u.creators[0] || null,
      organization: u.organizationMembers[0]?.organization || null,
    }));
  }

  async getAllCampaigns(params?: { status?: string; search?: string }) {
    const where: any = {};
    if (params?.status) where.status = params.status;
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { category: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.campaign.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true, industry: true } },
        _count: {
          select: {
            applications: true,
            deliverables: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}


