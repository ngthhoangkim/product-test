import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://lifosoft-api.devforce.one/:path*",
      },
    ];
  },
};

export default nextConfig;
