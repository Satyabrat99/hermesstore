import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next resolves node_modules correctly when a
  // stray lockfile exists in the home directory (e.g. C:\Users\satya).
  outputFileTracingRoot: path.join(__dirname, "..", "..", "frontend"),
  // Thin-client proxy: same-origin /hermes/* -> Hermes API server (:8642).
  // Avoids browser CORS issues; no custom business logic (still a thin client).
  async rewrites() {
    const hermesUrl =
      process.env.NEXT_PUBLIC_HERMES_URL || "http://localhost:8642";
    return [
      {
        source: "/hermes/:path*",
        destination: `${hermesUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
