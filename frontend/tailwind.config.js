/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-primary-fixed-variant": "#6f3157",
        "surface-container-lowest": "#120f1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "surface-container-high": "#2b233a",
        "tertiary-fixed-dim": "#cec4ca",
        "on-secondary-fixed": "#1b1735",
        "on-primary": "#ffffff",
        "surface-variant": "#3f344e",
        "inverse-surface": "#fbf8ff",
        "on-tertiary": "#ffffff",
        "surface-container-low": "#191425",
        "background": "#0d0a14", // Deep rich dark mode background
        "on-tertiary-fixed-variant": "#4b454a",
        "on-primary-container": "#ffd8ea",
        "on-background": "#f5f2fa",
        "inverse-primary": "#8a486f",
        "on-error-container": "#93000a",
        "tertiary": "#cec4ca",
        "secondary-fixed-dim": "#c8c2e9",
        "surface-tint": "#b97fa3",
        "primary": "#d982b5", // Vibrant blush pink for dark contrast
        "secondary-container": "#474363",
        "surface-dim": "#151121",
        "surface-container-highest": "#332a45",
        "tertiary-fixed": "#eae0e6",
        "inverse-on-surface": "#1a1b22",
        "tertiary-container": "#534d51",
        "on-surface": "#f5f2fa",
        "on-surface-variant": "#d5c1c9",
        "surface": "#161224", // Deep purple-grey glass card surface
        "primary-fixed-dim": "#ffaeda",
        "on-tertiary-container": "#ffd8ea",
        "outline-variant": "#4b3c58",
        "primary-fixed": "#ffd8ea",
        "on-secondary": "#ffffff",
        "on-secondary-fixed-variant": "#474363",
        "primary-container": "#78395f",
        "error": "#ffb4ab",
        "surface-bright": "#221b36",
        "secondary-fixed": "#e5deff",
        "on-primary-fixed": "#3a0329",
        "on-tertiary-fixed": "#1f1a1e",
        "secondary": "#a29dbf", // Soft lavender mist
        "surface-container": "#211a31",
        "outline": "#9c8a9e",
        "on-secondary-container": "#e5deff"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "margin-desktop": "64px",
        "margin-mobile": "20px",
        "container-max": "1280px",
        "unit": "8px",
        "gutter": "24px"
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}
