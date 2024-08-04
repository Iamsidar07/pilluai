/** @type {import('next').NextConfig} */
import path from "path";
const nextConfig = {
  images: {
    domains: [
      "generated.vusercontent.net",
      "res.cloudinary.com",
      "poppyai.vercel.app",
      "lh3.googleusercontent.com",
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
