import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { SyndicationController } from './syndication.controller';
import { SyndicationService } from './syndication.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SyndicationController],
  providers: [SyndicationService],
  exports: [SyndicationService],
})
export class SyndicationModule {}
