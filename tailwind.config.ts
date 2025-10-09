import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Включаем dark mode через класс
  theme: {
    extend: {
      // Здесь можно расширить тему Tailwind
    },
  },
  plugins: [],
}

export default config