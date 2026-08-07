import type { Config } from "tailwindcss";

// Palette pulled from the Kiwi Cove Roleplay crest: near-black shield,
// cream/khaki border, moss-green rule lines and "ROLEPLAY" text, bone-white
// "KIWI COVE" lettering and kiwi silhouette. `gold` is a kauri-amber accent
// added alongside it purely so gradients/highlights have a second stop -
// same crest mood, just enough contrast for glow effects and gradient text.
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
          300: "#aebd82",
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
        gold: {
          DEFAULT: "#c9a53b",
          300: "#e0c777",
          400: "#d3b654",
          500: "#c9a53b",
          600: "#a8842a",
        },
        bone: "#efece2",
        muted: "#9b9686",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
      backgroundImage: {
        "radial-fade": "radial-gradient(circle at top, rgba(124,143,74,0.16), transparent 60%)",
        "hero-glow":
          "radial-gradient(circle at 20% 0%, rgba(124,143,74,0.22), transparent 55%), "
          + "radial-gradient(circle at 85% 15%, rgba(201,165,59,0.14), transparent 45%)",
        "gradient-brand": "linear-gradient(90deg, #96a866 0%, #d9cfa8 55%, #d3b654 100%)",
        "gradient-primary": "linear-gradient(135deg, #7c8f4a 0%, #67793a 100%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,143,74,0.4), 0 8px 30px -8px rgba(124,143,74,0.55)",
        "glow-sm": "0 0 0 1px rgba(124,143,74,0.35), 0 4px 16px -6px rgba(124,143,74,0.5)",
        card: "0 8px 30px -12px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
} satisfies Config;
