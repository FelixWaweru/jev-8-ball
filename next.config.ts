import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // Pin to this app directory so a parent lockfile (C:\Users\HP\pnpm-lock.yaml)
    // does not become the inferred workspace root.
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
