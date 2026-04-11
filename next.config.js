/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

const nextConfig = withNextIntl({
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  experimental: {
    optimizeCss: true
  },
  images: {
    loader: 'custom',
    loaderFile: 'src/utils/r2Loader.ts',
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com'
      },
      {
        protocol: 'https',
        hostname: 'pub-0934a1d749124b68b6fc5e4428ccc952.r2.dev'
      },
      {
        protocol: 'https',
        hostname: '3cb73da2669637aaf8ec61edce1d29aa.r2.cloudflarestorage.com'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*.pdf',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/pdf',
          },
          {
            key: 'Content-Disposition',
            value: 'inline', // Ensure the browser displays instead of downloading
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/files/:path*',
        destination: 'https://pub-0934a1d749124b68b6fc5e4428ccc952.r2.dev/:path*'
      }
    ];
  }
});

module.exports = nextConfig;
