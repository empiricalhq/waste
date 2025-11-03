import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
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
