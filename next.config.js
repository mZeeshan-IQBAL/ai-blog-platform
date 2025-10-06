/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Silence monorepo/workspace root lockfile warning by pinning tracing root to this project
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Alias for `@` → src/
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },

  // ✅ Force dynamic rendering for any page not safe to pre-render
  experimental: {
    forceSwcTransforms: true, // keeps SWC stable on Windows
  },
  output: 'standalone',
};

module.exports = nextConfig;
