import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class UpstashRedisService implements OnModuleInit {
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const token = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (url && token) {
      try {
        this.client = new Redis({ url, token });
        console.log('Upstash Redis successfully initialized.');
      } catch (err: any) {
        console.error('Failed to initialize Upstash Redis:', err.message);
      }
    } else {
      console.warn('Upstash Redis credentials missing. Falling back to in-memory mode.');
    }
  }

  getClient(): Redis | null {
    return this.client;
  }
}
