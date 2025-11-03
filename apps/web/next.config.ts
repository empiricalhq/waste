import path from 'node:path';
import type { NextConfig } from 'next';

// Only use monorepo paths in development or when explicitly set
// In CI with isolated build, these won't work anyway
const useMonorepoPaths = process.env.NODE_ENV === 'development' || process.env.USE_MONOREPO_PATHS === 'true';
const monorepoRoot = path.join(__dirname, '..', '..');

const nextConfig: NextConfig = {
  ...(useMonorepoPaths && {
    outputFileTracingRoot: monorepoRoot,
    turbopack: {
      root: monorepoRoot,
    },
  }),
  experimental: {
    cssChunking: true,
    viewTransition: true,
  },
  devIndicators: {
    position: 'bottom-right',
  },
  poweredByHeader: false,
};

export default nextConfig;
