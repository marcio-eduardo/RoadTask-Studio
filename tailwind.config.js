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
        obsidian: {
          950: '#060911',
          900: '#0A0F1D',
          850: '#0E172A',
          800: '#141E36',
          750: '#1A2644',
          700: '#202E52',
          600: '#31426E',
          500: '#4A5E96',
        },
        safira: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        esmeralda: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        carmim: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        ouro: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-safira': '0 0 20px -3px rgba(2, 132, 199, 0.4)',
        'glow-carmim': '0 0 20px -3px rgba(244, 63, 94, 0.4)',
        'glow-ouro': '0 0 20px -3px rgba(245, 158, 11, 0.4)',
        'glow-esmeralda': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
