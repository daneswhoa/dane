import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UpstashRedisService } from '../redis/redis.service';
import { RATE_LIMIT_CATEGORY_KEY } from './rate-limit.decorator';

interface RateLimitRule {
  limit: number;
  ttl: number; // in seconds
}

interface RateLimitConfig {
  read: RateLimitRule;
  write: RateLimitRule;
  heavy: RateLimitRule;
  multipliers: {
    standard: number;
    enterprise: number;
    restricted: number;
  };
}

const DEFAULT_CONFIG: RateLimitConfig = {
  read: { limit: 100, ttl: 60 },
  write: { limit: 30, ttl: 60 },
  heavy: { limit: 5, ttl: 60 },
  multipliers: {
    standard: 1.0,
    enterprise: 3.0,
    restricted: 0.1,
  },
};

// In-memory cache to prevent hitting Redis for config on every request
let cachedConfig: RateLimitConfig | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL_MS = 10000; // 10 seconds

@Injectable()
export class RateLimitGuard implements CanActivate {
  // Simple local in-memory fallback store if Redis is unavailable
  private static localBuckets = new Map<string, { count: number; expiresAt: number }>();

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: UpstashRedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Bypass rate limits for specific internal webhook endpoints if desired
    if (request.url?.includes('campaigns/') && request.url?.includes('/dispatch')) {
      return true;
    }

    const handler = context.getHandler();
    const classRef = context.getClass();

    // 1. Determine rate limit category
    let category = this.reflector.getAllAndOverride<'read' | 'write' | 'heavy'>(
      RATE_LIMIT_CATEGORY_KEY,
      [handler, classRef],
    );

    if (!category) {
      const method = request.method;
      if (method === 'GET') {
        category = 'read';
      } else {
        // Check if this is a known heavy route pattern (Sophia AI or bulk campaigns)
        const url = request.url || '';
        if (url.includes('/agent/') || url.includes('/campaigns') || url.includes('/announcements') || url.includes('/ledger')) {
          category = 'heavy';
        } else {
          category = 'write';
        }
      }
    }

    // 2. Fetch rate limit policies
    const config = await this.getRateLimitConfig();
    const rule = config[category];

    // 3. Determine User Tracker & Multiplier
    const userId = request.user?.id;
    const ip = request.headers['x-forwarded-for']?.split(',')[0].trim() || request.ip || request.socket.remoteAddress || '127.0.0.1';
    const tracker = userId ? `user:${userId}` : `ip:${ip}`;
    
    let multiplier = 1.0;
    let userTier = 'standard';

    const redis = this.redisService.getClient();

    if (userId && redis) {
      try {
        // Check if this user has a custom tier set in Redis
        const storedTier = await redis.get<string>(`system:user-tiers:${userId}`);
        if (storedTier && config.multipliers[storedTier as keyof typeof config.multipliers] !== undefined) {
          userTier = storedTier;
          multiplier = config.multipliers[storedTier as keyof typeof config.multipliers];
        }
      } catch (err) {
        console.warn('Failed to load user tier from Redis:', err);
      }
    }

    const baseLimit = rule.limit;
    const limit = Math.max(1, Math.round(baseLimit * multiplier));
    const ttlSeconds = rule.ttl;

    // 4. Increment and evaluate rate limit
    const key = `rate-limit:${tracker}:${category}`;
    let currentHits = 0;

    if (redis) {
      try {
        const pipeline = redis.pipeline();
        pipeline.incr(key);
        pipeline.ttl(key);
        const [count, currentTtl] = await pipeline.exec() as [number, number];

        if (currentTtl < 0) {
          await redis.expire(key, ttlSeconds);
        }

        currentHits = count;
      } catch (err: any) {
        console.error('Upstash Redis increment failed. Falling back to memory store rate limiting:', err.message);
        currentHits = this.localIncrement(key, ttlSeconds);
      }
    } else {
      currentHits = this.localIncrement(key, ttlSeconds);
    }

    if (currentHits > limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many requests. Limit exceeded for ${category} actions (${limit} per ${ttlSeconds}s).`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private async getRateLimitConfig(): Promise<RateLimitConfig> {
    const now = Date.now();
    if (cachedConfig && now - lastCacheUpdate < CACHE_TTL_MS) {
      return cachedConfig;
    }

    const redis = this.redisService.getClient();
    if (!redis) {
      return DEFAULT_CONFIG;
    }

    try {
      const data = await redis.get<RateLimitConfig>('system:rate-limits');
      if (data) {
        cachedConfig = {
          ...DEFAULT_CONFIG,
          ...data,
          read: { ...DEFAULT_CONFIG.read, ...data.read },
          write: { ...DEFAULT_CONFIG.write, ...data.write },
          heavy: { ...DEFAULT_CONFIG.heavy, ...data.heavy },
          multipliers: { ...DEFAULT_CONFIG.multipliers, ...data.multipliers },
        };
      } else {
        cachedConfig = DEFAULT_CONFIG;
      }
      lastCacheUpdate = now;
      return cachedConfig;
    } catch (err) {
      console.warn('Failed to load rate-limits config from Redis, using defaults:', err);
      return DEFAULT_CONFIG;
    }
  }

  private localIncrement(key: string, ttlSeconds: number): number {
    const now = Date.now();
    const bucket = RateLimitGuard.localBuckets.get(key);

    if (!bucket || now > bucket.expiresAt) {
      RateLimitGuard.localBuckets.set(key, {
        count: 1,
        expiresAt: now + ttlSeconds * 1000,
      });
      return 1;
    }

    bucket.count += 1;
    return bucket.count;
  }
}
