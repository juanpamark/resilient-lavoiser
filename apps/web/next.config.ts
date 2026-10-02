import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@platform/core', '@platform/ai', '@platform/tools', '@platform/channels'],
};

export default nextConfig;
