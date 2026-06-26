/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./components/*.{js,ts,jsx,tsx}",
    "./app/components/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        paper: {
          50: '#fcfbf9',
          100: '#f3f1ec',
          200: '#e5e2db',
          300: '#d5d0c5',
          400: '#a69d8d',
          700: '#5e564d',
          900: '#292522',
        },
        ink: {
          50: '#8c93a1',
          100: '#757d8e',
          200: '#5e687b',
          300: '#485268',
          400: '#343d50',
          500: '#272b36',
          600: '#1e2129',
          700: '#16181f',
          800: '#101217',
          900: '#0b0c0f',
          950: '#050608',
        },
        coral: {
          50: '#fff0f0',
          100: '#ffdede',
          200: '#ffc2c2',
          500: '#ff6b6b',
          600: '#fa5252',
          700: '#e03131',
          900: '#8a1818',
        },
        // AI Brand Colors
        sophia: {
          light: '#ffd6d6',
          base: '#ff8f8f',
          deep: '#cc4b4b',
          glow: 'rgba(255, 107, 107, 0.4)'
        }
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    }
  },
  plugins: [],
}
