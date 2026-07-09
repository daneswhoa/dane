import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './auth/auth.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AgentModule } from './agent/agent.module';
import { SyndicationModule } from './syndication/syndication.module';
import { PropertiesController } from './properties.controller';
import { TenantsController } from './tenants.controller';
import { FinanceController } from './finance.controller';
import { MaintenanceController } from './maintenance.controller';
import { DashboardController } from './dashboard.controller';
import { ContractorsController } from './contractors.controller';
import { TeamController } from './team.controller';
import { CampaignsController } from './campaigns.controller';
import { SecurityController } from './security.controller';
import { ModerationUsersController } from './moderation-users.controller';
import { ModerationOrgsController } from './moderation-orgs.controller';
import { NotificationsController } from './notifications.controller';
import { AnnouncementsController } from './announcements.controller';
import { VacanciesController } from './vacancies.controller';
import { GcpTasksService } from './gcp-tasks.service';
import { EmailService } from './email.service';

import { R2Module } from './r2/r2.module';
import { RedisModule } from './redis/redis.module';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitGuard } from './common/rate-limit.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    RealtimeModule,
    AgentModule,
    SyndicationModule,
    R2Module,
    RedisModule,
  ],
  controllers: [
    DashboardController,
    PropertiesController,
    TenantsController,
    FinanceController,
    MaintenanceController,
    ContractorsController,
    TeamController,
    CampaignsController,
    SecurityController,
    ModerationUsersController,
    ModerationOrgsController,
    NotificationsController,
    AnnouncementsController,
    VacanciesController,
  ],
  providers: [
    GcpTasksService,
    EmailService,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule {}

