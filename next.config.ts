import type { NextConfig } from "next";

const isDev = process.env.npm_lifecycle_event === "dev";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  // Evita EPERM do OneDrive na pasta .next durante desenvolvimento
  distDir: isDev ? "node_modules/.cache/next" : ".next",
};

export default nextConfig;
