/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
        },
        secondary: {
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
      }
    },
  },
  plugins: [],
}
