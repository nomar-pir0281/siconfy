/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "Siconfy Premium"
        primary: {
          600: '#4F46E5', // Indigo vibrante para acciones principales
          700: '#4338CA',
          800: '#3730A3',
        },
        background: '#F9F6F0', // Blanco Hueso (Tu color base)
        surface: '#FFFFFF',
        slate: {
          850: '#1e293b', // Texto oscuro profesional
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      }
    },
  },
  plugins: [],
}