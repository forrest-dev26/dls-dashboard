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
        bg: "#FAF7F2",
        "bg-elev": "#FFFFFF",
        "bg-soft": "#F3EEE6",
        "bg-card": "#FAF8F4",
        "sidebar-bg": "#1F2421",
        "sidebar-hover": "#2A302A",
        "sidebar-active": "rgba(74, 139, 130, 0.18)",

        // Ink / text
        ink: "#1A1A1A",
        "ink-2": "#4A4A4A",
        "ink-3": "#8A8A8A",
        "ink-4": "#B7B0A6",

        // Borders
        line: "#EAE3D7",
        "line-2": "#D9D0BF",

        // Primary accent: muted teal
        accent: "#4A8B82",
        "accent-deep": "#356B63",
        "accent-soft": "#E3EEEC",

        // Gold
        gold: "#C9A96E",
        "gold-soft": "#F4ECDB",
        "gold-deep": "#7A5A1F",

        // Status: Good (sage-green)
        good: "#5B9D6E",
        "good-soft": "#E2EFE5",

        // Status: Warn
        warn: "#D6A150",
        "warn-soft": "#F6EBD6",

        // Status: Bad
        bad: "#C57064",
        "bad-soft": "#F4DEDA",

        // Info blue
        blue: "#6F9FB0",
        "blue-soft": "#E0EDF2",

        // Legacy aliases (kept for existing component compat)
        sage: "#5B9D6E",
        "sage-soft": "#E2EFE5",
        "sage-deep": "#2D6B40",
        rose: "#C57064",
        "rose-soft": "#F4DEDA",
        "rose-deep": "#8B3A30",

        // Legacy DLS colors
        burgundy: "#6E1F23",
        "burgundy-deep": "#4A1418",
        "burgundy-soft": "#F2E0DE",

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
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(26,26,26,0.04), 0 1px 1px rgba(26,26,26,0.03)",
        md: "0 4px 12px rgba(26,26,26,0.06), 0 2px 4px rgba(26,26,26,0.03)",
        lg: "0 12px 32px rgba(26,26,26,0.08), 0 4px 8px rgba(26,26,26,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
