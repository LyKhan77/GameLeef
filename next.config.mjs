/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow iframes from local game assets and proper header policies
  async headers() {
    return [
      {
        source: '/games/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
