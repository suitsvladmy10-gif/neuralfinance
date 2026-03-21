import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#111318",
        foreground: "#e2e2e9",
        primary: "#d0bcff",
        secondary: "#4cd7f6",
        success: "#4cd7f6",
        danger: "#ffb4ab",
        warning: "#facc15",
        surface: "#1a1b21",
        surfaceHover: "#282a2f",
        border: "#282a2f"
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
