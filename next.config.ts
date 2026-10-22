import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disabled: nearly every route here is personalized (auth-gated student/
  // parent data via cookies()), so static prerendering/Cache Components adds
  // no value and forces per-route opt-outs everywhere.
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
