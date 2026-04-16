import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-assets.nasa.gov",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "apod.nasa.gov",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
