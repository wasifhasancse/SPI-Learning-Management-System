import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  env: {
    SERVER_URL: process.env.SERVER_URL,
  },
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
