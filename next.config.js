/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

const nextConfig = withNextIntl({
  reactStrictMode: true,
  experimental: {
    optimizeCss: true
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com'
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/files/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:86'}/files/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:86'}/api/:path*`,
      }
    ];
  }
});

module.exports = nextConfig;
