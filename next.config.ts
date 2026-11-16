import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` writes the finished site to out/, which a
  // Cloudflare Worker serves as static assets (see wrangler.jsonc). Every page
  // reads the blockchain in the browser, so no server is needed.
  output: "export",
  experimental: {
    agentFeedback: true,
  },
  // cacheComponents and partialPrefetching (from the Create Next App template)
  // were removed: they need a running Next.js server, can't be combined with
  // static export, and nothing in the app used them.
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
