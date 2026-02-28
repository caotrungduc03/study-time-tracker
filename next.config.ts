import type { NextConfig } from "next";

import { envConfig } from "./config/envConfig";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: envConfig.NODE_ENV === "production" ? envConfig.ASSETS_PATH : undefined,
  reactCompiler: true,
};

export default nextConfig;
