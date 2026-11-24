import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        "surface-3": "rgb(var(--surface-3) / <alpha-value>)",
        ink: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        line: "rgb(var(--border) / <alpha-value>)",
        "line-strong": "rgb(var(--border-strong) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        positive: "rgb(var(--positive) / <alpha-value>)",
        negative: "rgb(var(--negative) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter Variable", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono Variable", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.06em" }],
        xs: ["11.5px", { lineHeight: "17px" }],
        sm: ["13px", { lineHeight: "20px" }],
        base: ["14px", { lineHeight: "22px" }],
        md: ["15px", { lineHeight: "24px" }],
        lg: ["17px", { lineHeight: "26px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["25px", { lineHeight: "32px", letterSpacing: "-0.02em" }],
        "3xl": ["32px", { lineHeight: "38px", letterSpacing: "-0.03em" }],
        "4xl": ["42px", { lineHeight: "46px", letterSpacing: "-0.04em" }],
        "5xl": ["56px", { lineHeight: "58px", letterSpacing: "-0.045em" }],
      },
      maxWidth: {
        shell: "1360px",
      },
      borderRadius: {
        xs: "3px",
        sm: "4px",
        DEFAULT: "5px",
        md: "6px",
        lg: "8px",
        xl: "10px",
      },
      boxShadow: {
        pop: "0 10px 40px -12px rgb(15 23 30 / 0.18), 0 2px 8px -4px rgb(15 23 30 / 0.08)",
        "pop-dark": "0 16px 48px -12px rgb(0 0 0 / 0.6)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.985)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "draw-line": {
          from: { strokeDashoffset: "1" },
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 160ms ease-out both",
        "fade-up": "fade-up 220ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "scale-in": "scale-in 150ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
