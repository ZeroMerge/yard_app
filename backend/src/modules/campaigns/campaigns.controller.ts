import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { CampaignsService, CreateCampaignDto } from './campaigns.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@CurrentUser() user: UserPayload) {
    return this.campaignsService.findAll(user.role, user.id, user.organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Post()
  async create(@CurrentUser() user: UserPayload, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(user.organizationId, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Patch(':id/publish')
  async publish(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.campaignsService.publish(id, user.organizationId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.campaignsService.cancel(id, user.organizationId, user.id);
  }
}
