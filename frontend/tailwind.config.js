/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#030712",
          dark: "#090d16",
          card: "rgba(17, 24, 39, 0.7)",
          cardSolid: "#111827",
          green: "#00ff66",
          blue: "#00e5ff",
          purple: "#d946ef",
          red: "#ff3b30",
          border: "rgba(31, 41, 55, 0.8)",
          text: "#f3f4f6",
          muted: "#9ca3af"
        }
      },
      boxShadow: {
        'neon-green': '0 0 15px rgba(0, 255, 102, 0.4)',
        'neon-blue': '0 0 15px rgba(0, 229, 255, 0.4)',
        'neon-purple': '0 0 15px rgba(217, 70, 239, 0.4)',
      }
    },
  },
  plugins: [],
}
