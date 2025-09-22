/** @type {import('next').NextConfig} */
const nextConfig = {
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
    config.resolve.alias = {
      '@': require('path').resolve(__dirname, 'src'),
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