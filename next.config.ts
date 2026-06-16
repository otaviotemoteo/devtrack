import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  // Keep the document/zip parsers out of the bundle — they use dynamic requires
  // and must run as real Node modules inside the route handlers.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth", "adm-zip"],
};

export default nextConfig;
