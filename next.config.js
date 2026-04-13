/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "apod.nasa.gov" },
      { protocol: "http", hostname: "apod.nasa.gov" },
      { protocol: "https", hostname: "mars.nasa.gov" },
      { protocol: "http", hostname: "mars.nasa.gov" },
      { protocol: "https", hostname: "mars.jpl.nasa.gov" },
      { protocol: "http", hostname: "mars.jpl.nasa.gov" },
      { protocol: "https", hostname: "www.nasa.gov" },
      { protocol: "https", hostname: "images-assets.nasa.gov" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

module.exports = nextConfig;
