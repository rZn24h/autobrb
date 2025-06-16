/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#dc3545',    // Red
        secondary: '#6c757d',  // Gray
        accent: '#dc3545',     // Red
        light: '#f8f9fa',      // Light Gray
        dark: '#1a1a1a',       // Dark Gray
        gray: {
          100: '#f8f9fa',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0,0,0,0.2)',
        'md': '0 4px 6px rgba(0,0,0,0.3)',
        'lg': '0 10px 15px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
} 