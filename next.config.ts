import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Admin book/cover uploads go through Server Actions; saveUploadedImage() allows up to 8MB,
    // but the Next.js default body limit is 1MB. Leave headroom for the other form fields.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
