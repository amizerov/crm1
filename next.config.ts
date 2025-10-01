import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Отключаем ESLint во время production сборки
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Отключаем TypeScript ошибки во время production сборки (опционально)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
