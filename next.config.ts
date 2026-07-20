import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves qualities declared here
    qualities: [75, 90],
  },
};

export default nextConfig;
