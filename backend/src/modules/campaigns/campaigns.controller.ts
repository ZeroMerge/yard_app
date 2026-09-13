import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Patch(':id/close')
  async close(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.campaignsService.close(id, user.organizationId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Patch(':id/archive')
  async archive(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.campaignsService.archive(id, user.organizationId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Patch(':id/unarchive')
  async unarchive(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.campaignsService.unarchive(id, user.organizationId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Patch(':id/reapplication-settings')
  async updateReApplicationSettings(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: { allowReApplication?: boolean; reApplicationCooldownDays?: number },
  ) {
    return this.campaignsService.updateReApplicationSettings(id, user.organizationId, user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('brand')
  @Delete(':id')
  async deleteDraft(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.campaignsService.deleteDraft(id, user.organizationId, user.id);
  }
}
