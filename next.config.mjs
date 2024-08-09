/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "firebasestorage.googleapis.com", protocol: "https" },
      {
        hostname: "lh3.googleusercontent.com",
      },
      {
        hostname: "cdn.loom.com",
      },
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
