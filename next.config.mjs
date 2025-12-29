/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack config (empty to allow webpack)
  turbopack: {},
  // Webpack configuration for better compatibility with Stacks packages
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  // Ensure proper module resolution
  transpilePackages: ['@stacks/connect', '@stacks/transactions', '@stacks/network'],
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'SP2MT5CDNVWS10W834069Q3GZWVDT9ATB91GTZPBV.checkin',
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK || 'mainnet',
  },
};

export default nextConfig;

