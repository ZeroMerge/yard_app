import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/audit-logs')
  async getAuditLogs() {
    return this.auditService.getAuditLogs();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('users/:id/suspend')
  async suspendUser(
    @Param('id') id: string,
    @Body() body: { suspended: boolean; reason?: string },
    @CurrentUser() user: UserPayload,
  ) {
    return this.auditService.suspendUser(id, body.suspended, user.id, body.reason);
  }
}
