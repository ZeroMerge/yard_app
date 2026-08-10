import { Controller, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { DeliverablesService, SubmitDeliverableDto, RequestRevisionDto } from './deliverables.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller()
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @Post('applications/:id/deliverables')
  async submit(
    @Param('id') applicationId: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: SubmitDeliverableDto,
  ) {
    return this.deliverablesService.submit(applicationId, user.creatorId, user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Patch('deliverables/:id/approve')
  async approve(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.deliverablesService.approve(id, user.organizationId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Patch('deliverables/:id/request-revision')
  async requestRevision(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: RequestRevisionDto,
  ) {
    return this.deliverablesService.requestRevision(id, user.organizationId, user.id, dto);
  }
}
