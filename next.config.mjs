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
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    if (!isServer) {
      // Ensure that all imports of 'yjs' resolve to the same instance
      // config.resolve.alias["yjs"] = path.resolve(__dirname, "node_modules/yjs");
    }
    return config;
  },
};

export default nextConfig;
