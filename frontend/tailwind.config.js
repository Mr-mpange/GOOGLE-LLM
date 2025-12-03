/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        datadog: {
          purple: '#632CA6',
          pink: '#F653A6',
        }
      }
    },
  },
  plugins: [],
}
