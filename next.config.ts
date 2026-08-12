import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      // Cloudinary — for AI-generated cover images
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      // Cloudflare Worker image responses (if worker returns direct URLs)
      {
        protocol: "https",
        hostname: "imagegeneration.reconditeali.workers.dev",
        port: "",
        pathname: "/**",
      },
    ],
    // Serve all images at 100% quality — no Next.js re-compression
    qualities: [100],
    // Cache images for 1 year (Cloudinary URLs are content-addressed)
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
