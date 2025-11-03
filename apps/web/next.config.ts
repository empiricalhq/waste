import path from 'node:path';
import type { NextConfig } from 'next';

// For Cloudflare CI:
// TODO: I need to stabilize this better.
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
