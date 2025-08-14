/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    fontSize: {
      xs: ['11px', { lineHeight: '16px' }],
      sm: ['13px', { lineHeight: '18px' }], // Tamaño base 13px
      base: ['13px', { lineHeight: '19px' }], // Base del sistema en 13px
      lg: ['15px', { lineHeight: '22px' }],
      xl: ['18px', { lineHeight: '26px' }],
      '2xl': ['22px', { lineHeight: '30px' }],
      '3xl': ['26px', { lineHeight: '34px' }],
      '4xl': ['32px', { lineHeight: '40px' }],
      '5xl': ['40px', { lineHeight: '48px' }],
      '6xl': ['48px', { lineHeight: '56px' }],
    },
    extend: {
      colors: {
        // Paleta slate (pizarra) principal - moderna y profesional
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          150: '#e9eef5',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Color principal pizarra
          600: '#475569',
          700: '#334155',
          750: '#243141',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#020617',
        },
        // Accent slate más intenso para elementos destacados
        accent: {
          50: '#f8fafc',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569', // Acento principal en slate
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
        },
        // Colores complementarios para estados (éxito, error, etc.)
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
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