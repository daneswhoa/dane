import { Module, Global } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { EmailService } from '../email.service';
import { AgentModule } from '../agent/agent.module';

@Global()
@Module({
  imports: [AgentModule],
  providers: [RealtimeGateway, RealtimeService, EmailService],
  exports: [RealtimeGateway, RealtimeService],
})
export class RealtimeModule {}

