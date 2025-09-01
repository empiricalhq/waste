const { theme } = require('tailwindcss/defaultConfig');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        secondary: '#64748B',
        background: '#F8FAFC',
        text: '#0F172A',
      },
      fontFamily: {
        sans: ['Inter', ...theme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
