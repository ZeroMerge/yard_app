import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getUsers({ search, role, status });
  }

  @Get('campaigns')
  async getAllCampaigns(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllCampaigns({ search, status });
  }

  @Get('payments')
  async getManualPayments() {
    return this.adminService.getManualPaymentsQueue();
  }

  @Post('payments/:id/mark-paid')
  async markPaymentAsPaid(
    @Param('id') id: string,
    @Body() body: { receiptNote?: string; receiptFileId?: string },
    @CurrentUser() user: UserPayload,
  ) {
    const receipt = body?.receiptNote || body?.receiptFileId || '';
    return this.adminService.markPaymentAsPaid(id, receipt, user.id);
  }
}

