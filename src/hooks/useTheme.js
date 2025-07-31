/**
 * Hook para manejar tema oscuro/claro de la aplicación
 * Gestiona cambio de tema, persistencia y preferencias del sistema
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getCurrentTheme,
  applyThemeVariables,
  getSystemPreference,
  getSavedTheme,
  saveTheme,
  themeConfig
} from '../config/themeConfig';

/**
 * Hook para manejar sistema de temas
 * @returns {Object} Estado y funciones para manejar temas
 */
export const useTheme = () => {
  // Estado del tema actual ('light', 'dark', 'system')
  const [themePreference, setThemePreference] = useState('system');
  
  // Estado del tema efectivo aplicado
  const [effectiveTheme, setEffectiveTheme] = useState('light');
  
  // Estado de si está en modo oscuro
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Inicializar tema desde localStorage y aplicar
  useEffect(() => {
    const savedTheme = getSavedTheme();
    setThemePreference(savedTheme);
    
    const theme = getCurrentTheme(savedTheme);
    setEffectiveTheme(theme.name);
    setIsDarkMode(theme.config.isDark);
    
    applyThemeVariables(theme);
  }, []);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    if (!themeConfig.enableSystemPreference) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      if (themePreference === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        setEffectiveTheme(newTheme);
        setIsDarkMode(e.matches);
        
        const theme = getCurrentTheme('system');
        applyThemeVariables(theme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themePreference]);

  // Función para cambiar tema
  const setTheme = useCallback((newTheme) => {
    setThemePreference(newTheme);
    saveTheme(newTheme);
    
    const theme = getCurrentTheme(newTheme);
    setEffectiveTheme(theme.name);
    setIsDarkMode(theme.config.isDark);
    
    applyThemeVariables(theme);
  }, []);

  // Toggle entre modo claro y oscuro
  const toggleTheme = useCallback(() => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
  }, [isDarkMode, setTheme]);

  // Establecer tema claro
  const setLightTheme = useCallback(() => {
    setTheme('light');
  }, [setTheme]);

  // Establecer tema oscuro
  const setDarkTheme = useCallback(() => {
    setTheme('dark');
  }, [setTheme]);

  // Usar preferencia del sistema
  const useSystemTheme = useCallback(() => {
    setTheme('system');
  }, [setTheme]);

  // Obtener información del tema actual
  const getCurrentThemeInfo = useCallback(() => {
    return getCurrentTheme(themePreference);
  }, [themePreference]);

  // Verificar si está usando preferencia del sistema
  const isUsingSystemPreference = themePreference === 'system';

  // Obtener preferencia actual del sistema
  const systemPreference = getSystemPreference();

  // Función para obtener clase CSS del tema
  const getThemeClass = useCallback(() => {
    return isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  // Función para obtener estilos CSS del tema
  const getThemeStyles = useCallback(() => {
    const theme = getCurrentThemeInfo();
    return theme.config.cssVariables;
  }, [getCurrentThemeInfo]);

  // Función para verificar si el tema soporta una característica
  const supportsFeature = useCallback((feature) => {
    const supportedFeatures = {
      transitions: themeConfig.enableTransitions,
      systemPreference: themeConfig.enableSystemPreference,
      customColors: true,
      animations: true
    };
    
    return supportedFeatures[feature] || false;
  }, []);

  // Función para obtener color específico del tema
  const getThemeColor = useCallback((colorKey) => {
    const theme = getCurrentThemeInfo();
    return theme.colors[colorKey] || null;
  }, [getCurrentThemeInfo]);

  // Función para aplicar transición suave al cambiar tema
  const applyThemeTransition = useCallback(() => {
    if (!themeConfig.enableTransitions) return;

    const root = document.documentElement;
    root.style.transition = `background-color ${themeConfig.transitionDuration}ms ease-in-out, color ${themeConfig.transitionDuration}ms ease-in-out`;
    
    setTimeout(() => {
      root.style.transition = '';
    }, themeConfig.transitionDuration);
  }, []);

  // Información del tema para debugging
  const themeInfo = {
    preference: themePreference,
    effective: effectiveTheme,
    isDark: isDarkMode,
    isSystem: isUsingSystemPreference,
    systemPreference,
    config: themeConfig
  };

  return {
    // Estado principal
    themePreference,
    effectiveTheme,
    isDarkMode,
    
    // Funciones de cambio de tema
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    useSystemTheme,
    
    // Información del tema
    getCurrentThemeInfo,
    getThemeClass,
    getThemeStyles,
    getThemeColor,
    
    // Estados derivados
    isUsingSystemPreference,
    systemPreference,
    isLight: !isDarkMode,
    
    // Utilidades
    supportsFeature,
    applyThemeTransition,
    
    // Información para debugging
    themeInfo,
    
    // Configuración
    config: themeConfig
  };
};

export default useTheme;