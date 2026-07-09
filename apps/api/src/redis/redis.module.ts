import { Module, Global } from '@nestjs/common';
import { UpstashRedisService } from './redis.service';

@Global()
@Module({
  providers: [UpstashRedisService],
  exports: [UpstashRedisService],
})
export class RedisModule {}
