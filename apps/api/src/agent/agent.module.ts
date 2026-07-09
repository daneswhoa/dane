import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentMemoryService } from './agent-memory.service';
import { AgentController } from './agent.controller';
import { CreditLedgerService } from './credit-ledger.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService, AgentMemoryService, CreditLedgerService],
  exports: [AgentService, AgentMemoryService, CreditLedgerService],
})
export class AgentModule {}
