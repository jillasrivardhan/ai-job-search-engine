import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // Keep output tracing inside this project; the parent OneDrive folder is restricted.
  outputFileTracingRoot: process.cwd(),
};
export default nextConfig;
