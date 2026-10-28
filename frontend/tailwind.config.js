/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'twilight-indigo': 'var(--twilight-indigo)',
        'powder-petal': 'var(--powder-petal)',
        'powder-blue': 'var(--powder-blue)',
        'powder-blush': 'var(--powder-blush)',
        'ash-brown': 'var(--ash-brown)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
