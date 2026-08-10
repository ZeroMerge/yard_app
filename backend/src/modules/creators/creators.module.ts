import { Module } from '@nestjs/common';
import { CreatorsController } from './creators.controller';
import { CreatorsService } from './creators.service';
import { IngestionService } from './ingestion.service';
import { WebhooksController } from './webhooks.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [CreatorsController, WebhooksController],
  providers: [CreatorsService, IngestionService],
  exports: [CreatorsService, IngestionService],
})
export class CreatorsModule {}
