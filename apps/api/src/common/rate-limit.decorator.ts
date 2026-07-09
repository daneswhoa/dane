import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_CATEGORY_KEY = 'rate-limit-category';
export const RateLimitCategory = (category: 'read' | 'write' | 'heavy') => 
  SetMetadata(RATE_LIMIT_CATEGORY_KEY, category);
