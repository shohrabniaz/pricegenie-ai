import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output only for Docker images (see Dockerfile)
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
};

export default nextConfig;
