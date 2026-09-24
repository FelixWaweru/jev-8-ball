import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // Parent directories may contain other lockfiles (e.g. C:\Users\HP\pnpm-lock.yaml).
    // Pin the app root so Next does not infer the wrong workspace.
    root: projectRoot,
  },
};

export default nextConfig;
