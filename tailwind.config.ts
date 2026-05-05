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
        // Canvas & surfaces
        bg: "#F6F0E7",
        "bg-elev": "#FFFFFF",
        "bg-soft": "#EDE5D8",
        "bg-card": "#FAF8F4",
        "sidebar-bg": "#20251F",
        "sidebar-hover": "#2A302A",
        "sidebar-active": "#343C34",

        // Ink / text
        ink: "#23211E",
        "ink-2": "#3F362E",
        "ink-3": "#7A736A",
        "ink-4": "#B7B0A6",

        // Borders
        line: "#E4DDD3",
        "line-2": "#D1C9BC",

        // Sage accent (positive / active)
        sage: "#6E9E7B",
        "sage-soft": "#E2ECDF",
        "sage-deep": "#4E7A59",

        // Gold accent (warning / trial)
        gold: "#D2B06D",
        "gold-soft": "#F4ECDB",
        "gold-deep": "#A68B4B",

        // Rose accent (risk / churn)
        rose: "#C97A6A",
        "rose-soft": "#F2DBD6",
        "rose-deep": "#A85549",

        // Muted blue (info / schedule)
        blue: "#6F9FB0",
        "blue-soft": "#E0EDF2",

        // Legacy DLS colors
        burgundy: "#6E1F23",
        "burgundy-deep": "#4A1418",
        "burgundy-soft": "#F2E0DE",

        // Semantic
        good: "#5B7D55",
        "good-soft": "#E2ECDF",
        warn: "#C29050",
        "warn-soft": "#F4E5CC",
        bad: "#A85549",
        "bad-soft": "#F2DBD6",

        // DLS series
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
        xl: "16px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(35,33,30,0.04), 0 1px 1px rgba(35,33,30,0.02)",
        md: "0 4px 12px rgba(35,33,30,0.06), 0 2px 4px rgba(35,33,30,0.03)",
        lg: "0 12px 32px rgba(35,33,30,0.08), 0 4px 8px rgba(35,33,30,0.03)",
      },
    },
  },
  plugins: [],
};

export default config;
