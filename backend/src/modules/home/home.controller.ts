import { Controller, Get, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../common/prisma.service';
import { NotFoundException } from '@nestjs/common';

/**
 * LAYER 3 — API Endpoint
 *
 * GET /home
 * Auth: JwtAuthGuard + RolesGuard (identical pattern to other creator endpoints).
 * Read-only. No side effects. Safe to call repeatedly.
 *
 * Returns { items: HomeItem[] } — full ranked list, no server-side cap.
 * Zero items → { items: [] }, never null, never an error.
 */
@Controller('home')
export class HomeController {
  constructor(
    private readonly homeService: HomeService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @Get()
  async getHome(@CurrentUser() user: UserPayload) {
    // Resolve userId → creatorId (auth gives us userId, signals need creatorId)
    const creator = await this.prisma.creator.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!creator) {
      throw new NotFoundException('Creator profile not found');
    }

    return this.homeService.getHomeResponse(creator.id);
  }
}
