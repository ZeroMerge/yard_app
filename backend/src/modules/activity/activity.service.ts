import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface PostCommentDto {
  body: string;
}

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async getTimelineForCampaign(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    return this.prisma.campaignActivity.findMany({
      where: { campaignId },
      include: { actor: { select: { id: true, email: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addComment(campaignId: string, actorId: string, dto: PostCommentDto) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    return this.prisma.campaignActivity.create({
      data: {
        campaignId,
        actorId,
        eventType: 'comment',
        body: dto.body,
      },
      include: { actor: { select: { id: true, email: true, role: true } } },
    });
  }
}
