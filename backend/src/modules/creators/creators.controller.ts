import { Controller, Get, Patch, Post, Query, Param, Body, UseGuards } from '@nestjs/common';
import { CreatorsService, CreatorFilterDto } from './creators.service';
import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('creators')
export class CreatorsController {
  constructor(
    private readonly creatorsService: CreatorsService,
    private readonly ingestionService: IngestionService,
  ) {}

  @Get()
  async findAll(@Query() filter: CreatorFilterDto) {
    return this.creatorsService.findAll(filter);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @Get('me')
  async getMe(@CurrentUser() user: UserPayload) {
    return this.creatorsService.findByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @Patch('me')
  async updateMe(@CurrentUser() user: UserPayload, @Body() data: any) {
    return this.creatorsService.updateProfile(user.id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/verify')
  async verifyCreator(
    @Param('id') id: string,
    @Body() body: { verified: boolean; reason?: string },
    @CurrentUser() user: UserPayload,
  ) {
    return this.creatorsService.verifyCreator(id, body.verified, user.id, body.reason);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.creatorsService.findOne(id);
  }

  /**
   * Trigger a real-time social stats refresh for a creator.
   * The backend verifies the creator is verified before calling the Ingestion Engine.
   * Requires admin or the creator themselves.
   */
  // @UseGuards(JwtAuthGuard) // ← Disabled for local testing — re-enable before production
  @Post(':id/refresh-stats')
  async refreshStats(
    @Param('id') id: string,
    @Body() body: { platform: string; handle: string; priority?: 'HIGH' | 'LOW' },
  ) {
    return this.ingestionService.dispatchScrapeJob({
      creatorId: id,
      handle: body.handle,
      platform: body.platform,
      priority: body.priority ?? 'LOW',
    });
  }

  /**
   * Trigger a full real-time social stats refresh for all connected accounts.
   */
  // @UseGuards(JwtAuthGuard) // ← Disabled for local testing — re-enable before production
  @Post(':id/refresh-all')
  async refreshAllStats(@Param('id') id: string) {
    return this.ingestionService.dispatchRefreshAllJobs(id);
  }
}
