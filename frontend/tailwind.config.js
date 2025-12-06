export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
        "3xl": "48rem",
        "4xl": "56rem",
        "5xl": "64rem",
        "6xl": "72rem",
        "7xl": "80rem"
      },
      colors: {
        brand: {
          50:  "#f5faff",
          100: "#e0f0ff",
          200: "#b8dcff",
          300: "#8cc7ff",
          400: "#57aaff",
          500: "#1d8cff",
          600: "#0066cc",
          700: "#004c99",
          800: "#003366",
          900: "#001a33"
        }
      }
    },
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px"
      }
    }
  },
  plugins: [require("@tailwindcss/line-clamp")]
};
