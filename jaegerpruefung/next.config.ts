import type { NextConfig } from "next";

// This app lives in a sub-folder of a repo that has its own lockfile; pin the
// root so Next doesn't pick the parent folder as the workspace root.
const projectRoot = process.cwd();

const nextConfig: NextConfig = {
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  // Content files are read at request time and rewritten by the collector
  // agent, so ship them with the server output.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*.json"],
  },
  async headers() {
    return [
      {
        // The service worker must always be re-checked so updates reach phones.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
