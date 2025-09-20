/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { scrollRestoration: false },
  images: {
    domains: ["res.cloudinary.com"],
  },
  webpack: (config) => config,
};

module.exports = nextConfig;
