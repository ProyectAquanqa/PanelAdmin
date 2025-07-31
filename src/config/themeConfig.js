/**
 * Configuración de temas de la aplicación
 * Define colores, estilos y configuraciones para modo claro y oscuro
 */

/**
 * Configuración del tema claro
 */
export const lightTheme = {
  name: 'light',
  colors: {
    // Colores principales
    primary: '#2D728F',
    primaryHover: '#235A6F',
    primaryLight: '#83B7CC',
    
    // Fondos
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    backgroundTertiary: '#F1F5F9',
    
    // Superficies
    surface: '#FFFFFF',
    surfaceHover: '#F8FAFC',
    surfaceActive: '#F1F5F9',
    
    // Textos
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#64748B',
    textMuted: '#94A3B8',
    
    // Bordes
    border: '#E2E8F0',
    borderHover: '#CBD5E1',
    borderActive: '#94A3B8',
    
    // Estados
    success: '#10B981',
    successLight: '#D1FAE5',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    
    // Sidebar específico
    sidebarBackground: '#2D728F',
    sidebarText: '#FFFFFF',
    sidebarTextMuted: '#B3D4E0',
    sidebarHover: '#235A6F',
    sidebarActive: '#1E4A5F',
    
    // Header específico
    headerBackground: '#FFFFFF',
    headerBorder: '#E2E8F0',
    headerText: '#0F172A',
    
    // Sombras
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  
  // Configuración específica del tema
  config: {
    isDark: false,
    className: 'light',
    cssVariables: {
      '--color-primary': '#2D728F',
      '--color-background': '#FFFFFF',
      '--color-text': '#0F172A',
      '--color-border': '#E2E8F0',
    }
  }
};

/**
 * Configuración del tema oscuro
 */
export const darkTheme = {
  name: 'dark',
  colors: {
    // Colores principales
    primary: '#83B7CC',
    primaryHover: '#A5C9D6',
    primaryLight: '#2D728F',
    
    // Fondos
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',
    
    // Superficies
    surface: '#1E293B',
    surfaceHover: '#334155',
    surfaceActive: '#475569',
    
    // Textos
    textPrimary: '#F8FAFC',
    textSecondary: '#E2E8F0',
    textTertiary: '#CBD5E1',
    textMuted: '#94A3B8',
    
    // Bordes
    border: '#334155',
    borderHover: '#475569',
    borderActive: '#64748B',
    
    // Estados
    success: '#10B981',
    successLight: '#064E3B',
    error: '#EF4444',
    errorLight: '#7F1D1D',
    warning: '#F59E0B',
    warningLight: '#78350F',
    info: '#3B82F6',
    infoLight: '#1E3A8A',
    
    // Sidebar específico
    sidebarBackground: '#1E293B',
    sidebarText: '#F8FAFC',
    sidebarTextMuted: '#94A3B8',
    sidebarHover: '#334155',
    sidebarActive: '#475569',
    
    // Header específico
    headerBackground: '#1E293B',
    headerBorder: '#334155',
    headerText: '#F8FAFC',
    
    // Sombras
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  },
  
  // Configuración específica del tema
  config: {
    isDark: true,
    className: 'dark',
    cssVariables: {
      '--color-primary': '#83B7CC',
      '--color-background': '#0F172A',
      '--color-text': '#F8FAFC',
      '--color-border': '#334155',
    }
  }
};

/**
 * Temas disponibles
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

/**
 * Configuración por defecto del sistema de temas
 */
export const themeConfig = {
  defaultTheme: 'light',
  storageKey: 'theme',
  systemPreferenceKey: 'prefers-color-scheme',
  transitionDuration: 300,
  enableSystemPreference: true,
  enableTransitions: true,
};

/**
 * Obtiene el tema actual basado en preferencias
 * @param {string} preference - Preferencia del usuario ('light', 'dark', 'system')
 * @returns {Object} Configuración del tema
 */
export const getCurrentTheme = (preference = 'system') => {
  if (preference === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? darkTheme : lightTheme;
  }
  
  return themes[preference] || lightTheme;
};

/**
 * Aplica variables CSS del tema al documento
 * @param {Object} theme - Configuración del tema
 */
export const applyThemeVariables = (theme) => {
  const root = document.documentElement;
  
  Object.entries(theme.config.cssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  // Aplicar clase del tema
  root.classList.remove('light', 'dark');
  root.classList.add(theme.config.className);
};

/**
 * Detecta la preferencia del sistema
 * @returns {string} 'light' o 'dark'
 */
export const getSystemPreference = () => {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Obtiene el tema guardado en localStorage
 * @returns {string} Tema guardado o 'system' por defecto
 */
export const getSavedTheme = () => {
  if (typeof window === 'undefined') return 'system';
  
  return localStorage.getItem(themeConfig.storageKey) || 'system';
};

/**
 * Guarda la preferencia de tema en localStorage
 * @param {string} theme - Tema a guardar
 */
export const saveTheme = (theme) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(themeConfig.storageKey, theme);
};

/**
 * Configuración de transiciones para cambio de tema
 */
export const themeTransition = {
  property: 'background-color, color, border-color, box-shadow',
  duration: `${themeConfig.transitionDuration}ms`,
  easing: 'ease-in-out',
};

/**
 * Obtiene estilos CSS para transiciones de tema
 * @returns {Object} Estilos CSS
 */
export const getThemeTransitionStyles = () => {
  if (!themeConfig.enableTransitions) return {};
  
  return {
    transition: `${themeTransition.property} ${themeTransition.duration} ${themeTransition.easing}`,
  };
};

/**
 * Configuración de colores para componentes específicos
 */
export const componentColors = {
  button: {
    primary: {
      light: {
        background: lightTheme.colors.primary,
        hover: lightTheme.colors.primaryHover,
        text: '#FFFFFF',
      },
      dark: {
        background: darkTheme.colors.primary,
        hover: darkTheme.colors.primaryHover,
        text: darkTheme.colors.background,
      },
    },
    secondary: {
      light: {
        background: lightTheme.colors.backgroundTertiary,
        hover: lightTheme.colors.borderHover,
        text: lightTheme.colors.textPrimary,
      },
      dark: {
        background: darkTheme.colors.backgroundTertiary,
        hover: darkTheme.colors.borderHover,
        text: darkTheme.colors.textPrimary,
      },
    },
  },
  
  input: {
    light: {
      background: lightTheme.colors.background,
      border: lightTheme.colors.border,
      borderFocus: lightTheme.colors.primary,
      text: lightTheme.colors.textPrimary,
      placeholder: lightTheme.colors.textMuted,
    },
    dark: {
      background: darkTheme.colors.surface,
      border: darkTheme.colors.border,
      borderFocus: darkTheme.colors.primary,
      text: darkTheme.colors.textPrimary,
      placeholder: darkTheme.colors.textMuted,
    },
  },
  
  card: {
    light: {
      background: lightTheme.colors.surface,
      border: lightTheme.colors.border,
      shadow: lightTheme.colors.shadow,
    },
    dark: {
      background: darkTheme.colors.surface,
      border: darkTheme.colors.border,
      shadow: darkTheme.colors.shadow,
    },
  },
};

export default {
  lightTheme,
  darkTheme,
  themes,
  themeConfig,
  getCurrentTheme,
  applyThemeVariables,
  getSystemPreference,
  getSavedTheme,
  saveTheme,
  themeTransition,
  getThemeTransitionStyles,
  componentColors,
};