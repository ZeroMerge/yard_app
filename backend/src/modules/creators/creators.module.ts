import { Module } from '@nestjs/common';
import { CreatorsController } from './creators.controller';
import { CreatorsService } from './creators.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [CreatorsController],
  providers: [CreatorsService],
  exports: [CreatorsService],
})
export class CreatorsModule {}
