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
        background: "#0F1014",
        foreground: "#FFFFFF",
        primary: "#7C3AED", // Electric purple
        secondary: "#3B82F6", // Blue accent
        success: "#10B981", // Vibrant green
        danger: "#EF4444", // Red warning
        warning: "#F59E0B", // Orange warning
        surface: "#1A1C23", // Dark grey surface
        surfaceHover: "#252830", // Slightly lighter for hover
        border: "#2E323E"
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