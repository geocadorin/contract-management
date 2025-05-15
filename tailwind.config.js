/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  extend: {
    colors: {
      primary: '#742851',
      accent: '#0067B1',
      'accent-dark': '#00487A',
      highlight: '#F39200',
      light: '#FFFFFF',
    },
  },
  plugins: [],
}
