import path from 'node:path';
import createMDX from '@next/mdx';
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
  pageExtensions: ['mdx', 'ts', 'tsx'],
  experimental: {
    cssChunking: true,
    viewTransition: true,
  },
  devIndicators: {
    position: 'bottom-right',
  },
  poweredByHeader: false,
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
