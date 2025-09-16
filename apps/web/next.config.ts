import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    cssChunking: true,
    useLightningcss: true,
    viewTransition: true,
  },
  devIndicators: {
    position: 'bottom-right',
  },
  poweredByHeader: false,
};

export default nextConfig;
