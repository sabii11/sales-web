import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // do not fail the build on ESLint errors
  },
};

export default nextConfig;
