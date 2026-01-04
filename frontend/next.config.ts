import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Image optimization configuration
  images: {
    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/commons/**',
      },
      {
        protocol: 'https',
        hostname: '*.wikimedia.org',
      },
      // Add patterns for avatar/profile images if using external CDN
      // {
      //   protocol: 'https',
      //   hostname: 'cdn.auguria.com',
      //   pathname: '/avatars/**',
      // },
    ],

    // Image formats to support (AVIF provides better compression than WebP)
    formats: ['image/avif', 'image/webp'],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Minimum cache TTL for optimized images (in seconds)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days

    // Disable image optimization during development for faster builds
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Compression
  compress: true,

  // PWA support
  headers: async () => [
    {
      source: '/manifest.json',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/manifest+json',
        },
      ],
    },
  ],
};

export default nextConfig;
