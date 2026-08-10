import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { CreatorsModule } from './modules/creators/creators.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { DeliverablesModule } from './modules/deliverables/deliverables.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ActivityModule } from './modules/activity/activity.module';
import { FilesModule } from './modules/files/files.module';
import { AuditModule } from './modules/audit/audit.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { GoogleDriveProvider } from './providers/files/GoogleDriveProvider';
import { ApifyProvider } from './providers/analytics/ApifyProvider';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CreatorsModule,
    CampaignsModule,
    ApplicationsModule,
    DeliverablesModule,
    PaymentsModule,
    ActivityModule,
    FilesModule,
    AuditModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    GoogleDriveProvider,
    ApifyProvider,
  ],
  exports: [
    PrismaService,
    GoogleDriveProvider,
    ApifyProvider,
  ],
})
export class AppModule {}
