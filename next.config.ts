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

  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            /*
             * Content-Security-Policy
             * Explicitly whitelist all ad-network domains so browsers in every
             * region allow the scripts, frames, and XHR connections to load.
             * Without this, strict browsers (Firefox, Safari, EU regions) silently
             * block third-party ad scripts.
             */
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + all ad networks + inline (required for atOptions)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'" +
                " *.effectivecpmnetwork.com" +
                " www.effectivecpmnetwork.com" +
                " *.highperformanceformat.com" +
                " www.highperformanceformat.com",
              // Frames: ad iframes
              "frame-src 'self'" +
                " *.effectivecpmnetwork.com" +
                " *.highperformanceformat.com",
              // Connections: ad tracking beacons
              "connect-src 'self'" +
                " *.effectivecpmnetwork.com" +
                " *.highperformanceformat.com",
              // Images from all sources (unsplash, cloudinary, ad creative)
              "img-src 'self' data: blob: https:",
              // Styles: self + inline (glassmorphism uses inline styles)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Media
              "media-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

