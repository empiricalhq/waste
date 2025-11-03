import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..', '..'),
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
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
