/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.nasa.gov', 'apod.nasa.gov'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.nasa.gov',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
