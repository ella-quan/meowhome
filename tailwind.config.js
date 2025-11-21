/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff0f5',
          100: '#ffdee9',
          200: '#ffc0d6',
          300: '#ff94ba',
          400: '#ff7eb6',
          500: '#ff5c96',
          600: '#e61462',
        },
        secondary: {
          50: '#f0f8ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
        },
        accent: {
          50: '#fffaeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
        },
        mint: {
          100: '#d1fae5',
          200: '#a7f3d0',
          400: '#34d399',
          500: '#10b981',
        },
        lavender: {
          100: '#f3e8ff',
          200: '#e9d5ff',
          400: '#c084fc',
        },
        candy: {
          cream: '#fffdf7',
          dark: '#4a4a4a',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        handwriting: ['Nunito', 'cursive'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(192, 164, 192, 0.2)',
        'pop': '4px 4px 0px 0px rgba(0,0,0,0.05)',
        'card': '0 8px 20px -4px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
