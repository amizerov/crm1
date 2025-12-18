import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Отключаем TypeScript ошибки во время production сборки (опционально)
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Увеличен лимит для загрузки больших объёмов данных (задачи, история, медиатека)
    },
  },
};

export default nextConfig;
