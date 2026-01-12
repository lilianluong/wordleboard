import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly use webpack for next-pwa compatibility
  webpack: (config, { isServer }) => {
    return config;
  },
};

const pwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
});

export default pwa(nextConfig);
