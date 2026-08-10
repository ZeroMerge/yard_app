import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ActivityService, PostCommentDto } from './activity.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('campaigns/:id/activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTimeline(@Param('id') campaignId: string) {
    return this.activityService.getTimelineForCampaign(campaignId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async addComment(
    @Param('id') campaignId: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: PostCommentDto,
  ) {
    return this.activityService.addComment(campaignId, user.id, dto);
  }
}
