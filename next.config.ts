import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder photography for now — see design-reference README for
    // what needs to be swapped for real clinic/patient photos.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
