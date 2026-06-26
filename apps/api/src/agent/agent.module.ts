import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AIAdapterService } from './ai-adapter.service';
import { AgentToolsService } from './agent-tools.service';
import { AgentMemoryService } from './agent-memory.service';
import { EmailService } from '../email.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AgentController],
  providers: [
    AgentService,
    AIAdapterService,
    AgentToolsService,
    AgentMemoryService,
    EmailService,
  ],
  exports: [AgentService, AgentMemoryService],
})
export class AgentModule {}
