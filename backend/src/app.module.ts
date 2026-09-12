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
import { CloudinaryProvider } from './providers/files/CloudinaryProvider';
import { EvolutionApiProvider } from './providers/notifications/EvolutionApiProvider';
import { ApifyProvider } from './providers/analytics/ApifyProvider';
import { SocialAuthService } from './creators/social/SocialAuthService';
import { AdminModule } from './modules/admin/admin.module';
import { HomeModule } from './modules/home/home.module';

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
    AdminModule,
    HomeModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    CloudinaryProvider,
    EvolutionApiProvider,
    SocialAuthService,
    ApifyProvider,
  ],
  exports: [
    PrismaService,
    CloudinaryProvider,
    EvolutionApiProvider,
    SocialAuthService,
    ApifyProvider,
  ],
})
export class AppModule {}
