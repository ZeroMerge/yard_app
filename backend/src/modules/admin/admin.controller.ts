import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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

  @Get('payments')
  async getManualPayments() {
    return this.adminService.getManualPaymentsQueue();
  }

  @Post('payments/:id/mark-paid')
  async markPaymentAsPaid(
    @Param('id') id: string,
    @Body('receiptFileId') receiptFileId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.adminService.markPaymentAsPaid(id, receiptFileId, user.id);
  }
}
