import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/img-proxy/:path*",
        destination: "https://cdn.nearbyonly.com/:path*",
      },
    ];
  },
};

export default nextConfig;
