import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getFileWithAuthorization(campaignId: string, fileId: string, user: { id: string; role: string; organizationId?: string; creatorId?: string }) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { applications: true },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.campaignId !== campaignId) {
      throw new NotFoundException(`File with ID ${fileId} not found in this campaign`);
    }

    // Check authorization:
    // Admin has full access
    if (user.role === 'admin') {
      return file;
    }

    // Brand owning the campaign has access
    if (user.role === 'brand' && campaign.organizationId === user.organizationId) {
      return file;
    }

    // Creator participating in the campaign (accepted application or file uploader) has access
    if (user.role === 'creator') {
      const isParticipant = campaign.applications.some(
        (app) => app.creatorId === user.creatorId && ['accepted', 'pending'].includes(app.status),
      );
      const isUploader = file.uploadedBy === user.id;

      if (isParticipant || isUploader) {
        return file;
      }
    }

    throw new ForbiddenException('Not authorized to access this file');
  }
}
