import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './auth/auth.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AgentModule } from './agent/agent.module';
import { PropertiesController } from './properties.controller';
import { TenantsController } from './tenants.controller';
import { FinanceController } from './finance.controller';
import { MaintenanceController } from './maintenance.controller';
import { DashboardController } from './dashboard.controller';
import { ContractorsController } from './contractors.controller';
import { TeamController } from './team.controller';
import { CampaignsController } from './campaigns.controller';
import { SecurityController } from './security.controller';
import { NotificationsController } from './notifications.controller';
import { GcpTasksService } from './gcp-tasks.service';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    RealtimeModule,
    AgentModule,
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
    NotificationsController,
  ],
  providers: [
    GcpTasksService,
    EmailService,
  ],
})
export class AppModule {}
