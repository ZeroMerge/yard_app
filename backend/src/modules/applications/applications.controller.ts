import { Controller, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApplicationsService, ApplyDto } from './applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @Post('campaigns/:id/applications')
  async apply(
    @Param('id') campaignId: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: ApplyDto,
  ) {
    return this.applicationsService.apply(campaignId, user.creatorId, user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Patch('applications/:id/accept')
  async accept(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.applicationsService.accept(id, user.organizationId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Patch('applications/:id/reject')
  async reject(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.applicationsService.reject(id, user.organizationId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @Patch('applications/:id/withdraw')
  async withdraw(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.applicationsService.withdraw(id, user.creatorId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @Patch('applications/:id/accept-invitation')
  async acceptInvitation(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.applicationsService.creatorAcceptInvitation(id, user.creatorId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @Patch('applications/:id/decline-invitation')
  async declineInvitation(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.applicationsService.creatorDeclineInvitation(id, user.creatorId, user.id);
  }
}
