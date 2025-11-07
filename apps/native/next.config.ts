import type { NextConfig } from "next";
import createNextIntlPlugin from "@workspace/i18n/plugin";

// For Tauri static export, configure next-intl without server-side request config
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: false, // Tauri currently has issues with Strict Mode
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  distDir: "dist",
  transpilePackages: ["@workspace/ui", "@workspace/i18n"],
};

export default withNextIntl(nextConfig);
