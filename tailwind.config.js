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
        // Paleta moderna de azules más elegante
        blue: {
          50: '#eef5ff',
          100: '#d9e9ff',
          200: '#bcd9ff',
          300: '#8fc0ff',
          400: '#599eff',
          500: '#2e7cf2', // Azul principal (más elegante que #0074BD)
          600: '#1b62db',
          700: '#1650b8',
          800: '#174496',
          900: '#193b7a',
        },
        // Azul más brillante para acentos/highlights
        accent: {
          100: '#e6f2ff',
          200: '#c5e1ff',
          300: '#94c8ff',
          400: '#5fa5ff',
          500: '#3b82f6', // Acento principal
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Azul oscuro para fondos
        blueDark: {
          50: '#eef3ff',
          100: '#d9e4ff',
          200: '#bccef5',
          300: '#8aa7e0',
          400: '#5c7ec9',
          500: '#3b5998', // Azul oscuro principal (más elegante)
          600: '#2d4373',
          700: '#1e2e4f',
          800: '#172038',
          900: '#101726',
        },
        // Neutros
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          150: '#e9eef5',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          750: '#243141',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Open Sans',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'sidebar': '0 0 20px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.12)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'md': '10px',
        'lg': '16px',
      }
    },
  },
  plugins: [],
} 