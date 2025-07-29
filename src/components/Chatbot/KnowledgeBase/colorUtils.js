/**
 * Paleta de colores coherente basada en el color principal #2D728F
 * Utiliza teoría del color para crear combinaciones armoniosas
 */

// Color principal de la aplicación
const PRIMARY = '#2D728F';

// Paleta de colores derivada del principal usando colorimetría
export const colors = {
  // Color principal y variaciones
  primary: {
    50: '#f0f8fc',
    100: '#e1f0f8', 
    200: '#b8ddef',
    300: '#85c4e0',
    400: '#4ca5cc',
    500: '#2D728F',  // Color principal
    600: '#26647f',
    700: '#1f4f63',
    800: '#1a4252',
    900: '#153645'
  },
  
  // Colores complementarios (para acentos y estados)
  accent: {
    success: '#0f5f3f',    // Verde oscuro derivado del principal
    warning: '#8f6b2d',    // Naranja complementario
    error: '#8f2d3a',      // Rojo complementario
    info: '#2d4c8f'        // Azul análogo
  },
  
  // Grises neutros que combinan con el principal
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  }
};

// Utilidades para aplicar consistentemente
export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-400'
      };
    case 'inactive':
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400'
      };
    case 'embedding':
      return {
        bg: `bg-sky-50`,
        text: `text-sky-700`,
        border: `border-sky-200`,
        dot: `bg-sky-400`
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400'
      };
  }
};

export const getPrimaryClasses = () => ({
  button: 'bg-slate-700 hover:bg-slate-800 focus:ring-slate-500 text-white',
  buttonSecondary: 'border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500',
  text: 'text-slate-700',
  textMuted: 'text-slate-500',
  border: 'border-slate-200',
  ring: 'focus:ring-slate-500'
}); 