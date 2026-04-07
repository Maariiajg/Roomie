/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3fb6a8',
        hover: '#35a89a',
        secondary: '#4a90e2',
        alert: '#f9d976',
        textMain: '#1f2933',
        bgMain: '#f5f7fa',
      }
    },
  },
  plugins: [],
}
