import type { Config } from "tailwindcss";

// Palette pulled from the Kiwi Cove Roleplay crest: near-black shield,
// cream/khaki border, moss-green rule lines and "ROLEPLAY" text, bone-white
// "KIWI COVE" lettering and kiwi silhouette.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0b0c09",
          50: "#f5f5f2",
          900: "#0b0c09",
          950: "#060704",
        },
        surface: {
          DEFAULT: "#15170f",
          raised: "#1c1f15",
        },
        line: "#2a2c1f",
        moss: {
          DEFAULT: "#7c8f4a",
          400: "#96a866",
          500: "#7c8f4a",
          600: "#67793a",
          700: "#526030",
        },
        sand: {
          DEFAULT: "#d9cfa8",
          300: "#e7e0c4",
          600: "#b8ac80",
        },
        bone: "#efece2",
        muted: "#9b9686",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
      backgroundImage: {
        "radial-fade": "radial-gradient(circle at top, rgba(124,143,74,0.12), transparent 60%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
