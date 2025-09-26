/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        caveat: ["Caveat", "cursive"],
        indie: ["Indie Flower", "cursive"],
        patrick: ["Patrick Hand", "cursive"],
        gloria: ["Gloria Hallelujah", "cursive"],
        shadows: ["Shadows Into Light", "cursive"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
