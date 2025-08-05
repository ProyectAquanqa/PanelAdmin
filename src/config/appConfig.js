/**
 * Configuración general de la aplicación
 * Centraliza constantes y configuraciones globales
 */

/**
 * Información básica de la aplicación
 */
export const appInfo = {
  name: 'AquanQ Admin',
  version: '1.0.0',
  description: 'Panel de administración para la plataforma AquanQ',
  author: 'AquanQ Solutions',
  copyright: `© ${new Date().getFullYear()} AquanQ Solutions. Todos los derechos reservados.`,
};

/**
 * Configuración de colores principales
 */
export const colors = {
  primary: '#2D728F',
  primaryHover: '#235A6F',
  primaryLight: '#83B7CC',
  secondary: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

/**
 * Configuración de tema
 */
export const theme = {
  defaultMode: 'light', // 'light' | 'dark' | 'system'
  storageKey: 'theme',
  transitions: {
    duration: '0.3s',
    easing: 'ease-in-out',
  },
};

/**
 * Configuración de paginación por defecto
 */
export const pagination = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50, 100],
  maxVisiblePages: 5,
};

/**
 * Configuración de notificaciones
 */
export const notifications = {
  position: 'top-right',
  duration: 4000,
  maxVisible: 5,
  types: {
    success: {
      icon: 'CheckCircleIcon',
      color: colors.success,
    },
    error: {
      icon: 'XCircleIcon',
      color: colors.error,
    },
    warning: {
      icon: 'ExclamationTriangleIcon',
      color: colors.warning,
    },
    info: {
      icon: 'InformationCircleIcon',
      color: colors.info,
    },
  },
};

/**
 * Configuración de formularios
 */
export const forms = {
  validation: {
    showErrorsOnBlur: true,
    showErrorsOnSubmit: true,
    debounceDelay: 300,
  },
  defaults: {
    requiredIndicator: '*',
    errorClassName: 'error',
    successClassName: 'success',
  },
};

/**
 * Configuración de tablas
 */
export const tables = {
  defaultSortDirection: 'desc',
  defaultSortField: 'created_at',
  rowsPerPageOptions: [10, 25, 50, 100],
  defaultRowsPerPage: 10,
  enableSorting: true,
  enableFiltering: true,
  enablePagination: true,
};

/**
 * Configuración de búsqueda
 */
export const search = {
  debounceDelay: 300,
  minSearchLength: 2,
  maxResults: 100,
  highlightMatches: true,
  caseSensitive: false,
};

/**
 * Configuración de archivos
 */
export const files = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'text/plain', 'application/msword'],
    spreadsheets: ['text/csv', 'application/vnd.ms-excel'],
  },
  upload: {
    chunkSize: 1024 * 1024, // 1MB chunks
    maxConcurrent: 3,
    retryAttempts: 3,
  },
};

/**
 * Configuración de API
 */
export const api = {
  timeout: 30000, // 30 segundos
  retryAttempts: 3,
  retryDelay: 1000, // 1 segundo
  endpoints: {
    auth: '/auth',
    users: '/users',
    chatbot: '/chatbot',
    events: '/events',
    notifications: '/notifications',
  },
  external: {
    dni: {
      url: import.meta.env.VITE_DNI_API_URL || 'https://aplicativo.aquanqa.net/api/consulta-dni/',
      token: import.meta.env.VITE_DNI_API_TOKEN || '',
      timeout: 10000,
      fieldMapping: {
        request: 'idpropiedad_3638',
        response: {
          nombres: 'Nombres',
          apellidoPaterno: 'A_Paterno',
          apellidoMaterno: 'A_Materno'
        }
      }
    }
  }
};

/**
 * Configuración de localStorage
 */
export const storage = {
  keys: {
    theme: 'theme',
    user: 'user',
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    isAuthenticated: 'isAuthenticated',
    sidebarCollapsed: 'sidebar_collapsed',
    tablePreferences: 'table_preferences',
  },
  prefix: 'aquanq_',
};

/**
 * Configuración de animaciones
 */
export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

/**
 * Configuración de breakpoints responsivos
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Configuración de sidebar
 */
export const sidebar = {
  defaultCollapsed: true,
  collapsedWidth: '5rem',
  expandedWidth: '16rem',
  hoverDelay: 200,
  animationDuration: 250,
};

/**
 * Configuración de desarrollo
 */
export const development = {
  enableLogging: import.meta.env.DEV,
  enableDebugMode: import.meta.env.DEV,
  showPerformanceMetrics: import.meta.env.DEV,
  mockApiDelay: 500,
};

/**
 * URLs y enlaces externos
 */
export const links = {
  documentation: '#',
  support: '#',
  about: '#',
  contact: '#',
  privacy: '#',
  terms: '#',
};

/**
 * Configuración de accesibilidad
 */
export const accessibility = {
  focusVisible: true,
  reducedMotion: 'respect-user-preference',
  highContrast: false,
  fontSize: 'normal', // 'small' | 'normal' | 'large'
};

/**
 * Obtiene una configuración específica por clave
 * @param {string} key - Clave de configuración (ej: 'colors.primary')
 * @returns {any} Valor de configuración
 */
export const getConfig = (key) => {
  const keys = key.split('.');
  let value = {
    appInfo,
    colors,
    theme,
    pagination,
    notifications,
    forms,
    tables,
    search,
    files,
    api,
    storage,
    animations,
    breakpoints,
    sidebar,
    development,
    links,
    accessibility,
  };
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  return value;
};

/**
 * Verifica si estamos en modo desarrollo
 * @returns {boolean}
 */
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

/**
 * Verifica si estamos en modo producción
 * @returns {boolean}
 */
export const isProduction = () => {
  return import.meta.env.PROD;
};

export default {
  appInfo,
  colors,
  theme,
  pagination,
  notifications,
  forms,
  tables,
  search,
  files,
  api,
  storage,
  animations,
  breakpoints,
  sidebar,
  development,
  links,
  accessibility,
  getConfig,
  isDevelopment,
  isProduction,
};