import type { NextConfig } from "next";
// @ts-ignore - next-pwa doesn't have type definitions
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly use webpack for next-pwa compatibility
  webpack: (config, { isServer }) => {
    return config;
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
};

const pwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
  // Import custom push notification handlers
  scope: '/',
  sw: 'sw.js',
  // Additional configuration for push notifications
  additionalManifestEntries: [],
});

export default pwa(nextConfig);
