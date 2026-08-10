import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('campaigns/:campaignId/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':fileId')
  async getFile(
    @Param('campaignId') campaignId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.filesService.getFileWithAuthorization(campaignId, fileId, user);
  }
}
