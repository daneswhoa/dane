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
      },
      borderColor: {
        DEFAULT: 'var(--border-default)',
        subtle: 'var(--border-subtle)',
        strong: 'var(--border-strong)',
        coral: 'var(--coral)',
      },
      colors: {
        // Theme-aware colors pointing to Ink Coral Design System tokens
        base: 'var(--bg-base)',
        panel: 'var(--bg-panel)',
        raised: 'var(--bg-raised)',
        
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        
        coral: {
          DEFAULT: 'var(--coral)',
          hover: 'var(--coral-hover)',
          muted: 'var(--coral-muted)',
          text: 'var(--coral-text)',
          50: '#fff0f0',
          100: '#ffdede',
          200: '#ffc2c2',
          400: '#ff8787',
          500: '#ff6b6b',
          600: '#fa5252',
          700: '#e03131',
          900: '#8a1818',
        },
        
        green: {
          DEFAULT: 'var(--green)',
          muted: 'var(--green-muted)',
          text: 'var(--green-text)',
        },
        
        blue: {
          DEFAULT: 'var(--blue)',
          muted: 'var(--blue-muted)',
          text: 'var(--blue-text)',
        },
        
        amber: {
          DEFAULT: 'var(--amber)',
          muted: 'var(--amber-muted)',
          text: 'var(--amber-text)',
        },
        
        red: {
          DEFAULT: 'var(--red)',
          muted: 'var(--red-muted)',
          text: 'var(--red-text)',
        },

        // Legacy/Direct color scales for absolute paper/ink overrides
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
          850: '#0e0f13',
          900: '#0b0c0f',
          950: '#050608',
        }
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem', 
        '3': '0.75rem',
        '4': '1rem', 
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.625rem',
      }
    }
  },
  plugins: [],
}
