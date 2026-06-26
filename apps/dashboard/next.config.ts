import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/types', '@repo/auth'],
};

export default nextConfig;
