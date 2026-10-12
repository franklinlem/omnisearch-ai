import type { NextConfig } from "next";

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_INTERNAL_URL}/api/:path*`,
      },
      {
        source: "/static/:path*",
        destination: `${BACKEND_INTERNAL_URL}/static/:path*`,
      },
      {
        source: "/health",
        destination: `${BACKEND_INTERNAL_URL}/health`,
      },
      {
        source: "/docs",
        destination: `${BACKEND_INTERNAL_URL}/docs`,
      },
      {
        source: "/openapi.json",
        destination: `${BACKEND_INTERNAL_URL}/openapi.json`,
      },
    ];
  },
};

export default nextConfig;
