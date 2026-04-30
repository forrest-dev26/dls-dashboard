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
        // DLS brand palette
        bg: "#F6F1E7",
        "bg-elev": "#FFFFFF",
        "bg-soft": "#EDE5D3",
        "bg-card": "#FBF7EE",
        ink: "#1A1410",
        "ink-2": "#3F362E",
        "ink-3": "#847467",
        "ink-4": "#B5A795",
        line: "#DFD5C2",
        "line-2": "#C7BAA0",
        burgundy: "#6E1F23",
        "burgundy-deep": "#4A1418",
        "burgundy-soft": "#F2E0DE",
        gold: "#C9A96E",
        "gold-soft": "#F4ECDB",
        "gold-deep": "#927a47",
        good: "#5B7D55",
        "good-soft": "#E2ECDF",
        warn: "#C29050",
        "warn-soft": "#F4E5CC",
        bad: "#A85549",
        "bad-soft": "#F2DBD6",
        // Series colors
        "series-salem": "#4A2E2A",
        "series-titanic": "#1F2A40",
        "series-asylum": "#3D2F44",
        "series-raven": "#1A1410",
      },
      fontFamily: {
        ui: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-lora)", "Georgia", "serif"],
        mono: ["var(--font-ibm-plex-mono)", "Menlo", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "18px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(26,20,16,0.05), 0 1px 1px rgba(26,20,16,0.03)",
        md: "0 4px 14px rgba(26,20,16,0.07), 0 2px 4px rgba(26,20,16,0.04)",
        lg: "0 14px 38px rgba(26,20,16,0.10), 0 4px 8px rgba(26,20,16,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
