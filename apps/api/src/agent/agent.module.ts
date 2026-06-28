import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentMemoryService } from './agent-memory.service';
import { AgentController } from './agent.controller';

@Module({
  controllers: [AgentController],
  providers: [AgentService, AgentMemoryService],
  exports: [AgentService, AgentMemoryService],
})
export class AgentModule {}
