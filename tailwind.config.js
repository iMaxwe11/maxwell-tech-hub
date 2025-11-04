/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: "hsl(var(--accent))", fg: "hsl(var(--accent-foreground))" },
        bg: { DEFAULT: "hsl(var(--bg))", soft: "hsl(var(--bg-soft))" }
      },
      boxShadow: { glow: "0 0 30px rgba(100, 200, 255, 0.25)" }
    },
  },
  plugins: [],
}
