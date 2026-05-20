import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "page-cream": "#faf7f2",
        "page-warm": "#f3efe8",
        "page-sand": "#ede4d9",
        "ink-primary": "#2c2416",
        "ink-secondary": "#6b5e4f",
        "ink-muted": "#9b9284",
        "sage": "#7a9a7e",
        "sage-soft": "#e8f0e4",
        "terracotta": "#c17d5e",
        "terracotta-soft": "#faf0e8",
        "lavender": "#b8a5c2",
        "lavender-soft": "#f4f0f7",
      },
      fontFamily: {
        serif: ["Georgia", "'Noto Serif SC'", "'Source Han Serif SC'", "serif"],
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        display: [
          "clamp(2rem, 5vw, 2.5rem)",
          { lineHeight: "1.2", fontWeight: "600", letterSpacing: "-0.02em" },
        ],
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
