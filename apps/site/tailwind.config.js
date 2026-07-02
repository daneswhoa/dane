/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./components/*.{js,ts,jsx,tsx}",
    "./app/components/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      colors: {
        primary: '#E95D2A', // distinctive brand orange-coral
        coral: {
          DEFAULT: '#ff6b6b',
          hover: '#fa5252',
          muted: 'rgba(250, 82, 82, 0.15)',
        },
        dark: {
          900: '#060709',
          800: '#0b0c0f',
          700: '#101217',
          600: '#16181f',
          500: '#1e2129',
        },
        paper: {
          50: '#fcfbf9',
          100: '#f3f1ec',
          200: '#e5e2db',
          300: '#d5d0c5',
        }
      }
    }
  },
  plugins: [],
}
