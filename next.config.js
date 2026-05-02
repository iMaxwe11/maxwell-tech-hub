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
  // Short, shareable URLs for common assets.
  async redirects() {
    return [
      {
        source: "/resume",
        destination: "/Maxwell_Nixon_Resume.docx",
        permanent: false, // 307 — easy to swap to PDF later without breaking the URL
      },
      {
        source: "/cv",
        destination: "/Maxwell_Nixon_Resume.docx",
        permanent: false,
      },
      {
        source: "/arcade",
        destination: "/play",
        permanent: true,
      },
      // Friendly aliases for inbound links from other surfaces.
      {
        source: "/github",
        destination: "https://github.com/iMaxwe11",
        permanent: false,
      },
      {
        source: "/linkedin",
        destination: "https://linkedin.com/in/maxwell-nixon-90351627a",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
