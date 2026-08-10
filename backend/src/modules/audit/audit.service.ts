import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(actorId: string | undefined, action: string, targetType: string, targetId: string, metadata?: any) {
    return this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        metadata,
      },
    });
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      include: { actor: { select: { id: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async suspendUser(userId: string, suspended: boolean, adminUserId: string, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: suspended ? 'suspended' : 'active' },
    });

    await this.logAction(
      adminUserId,
      suspended ? 'user_suspended' : 'user_unsuspended',
      'user',
      userId,
      { reason: reason || 'Admin moderation action' },
    );

    return updated;
  }
}
