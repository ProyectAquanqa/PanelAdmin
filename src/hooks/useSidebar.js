/**
 * Hook para manejar estado del sidebar
 * Gestiona colapso, hover, animaciones y persistencia
 */

import { useState, useCallback, useEffect } from 'react';
import { storage } from '../config/appConfig';

/**
 * Hook para manejar estado y comportamiento del sidebar
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones para manejar el sidebar
 */
export const useSidebar = (options = {}) => {
  const {
    defaultCollapsed = true,
    enablePersistence = true,
    hoverDelay = 200
  } = options;

  // Estado de colapso del sidebar
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  
  // Estado de hover (solo para el contenido, no el header)
  const [isHovered, setIsHovered] = useState(false);
  
  // Estado de si está en transición
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Cargar estado persistido al inicializar
  useEffect(() => {
    if (!enablePersistence) return;

    const savedState = localStorage.getItem(storage.keys.sidebarCollapsed);
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, [enablePersistence]);

  // Guardar estado cuando cambie
  useEffect(() => {
    if (!enablePersistence) return;

    localStorage.setItem(storage.keys.sidebarCollapsed, JSON.stringify(isCollapsed));
  }, [isCollapsed, enablePersistence]);

  // Calcular si el sidebar debe mostrarse expandido
  const shouldExpand = !isCollapsed || isHovered;

  // Toggle del estado de colapso
  const toggleSidebar = useCallback(() => {
    setIsTransitioning(true);
    setIsCollapsed(prev => !prev);
    
    // Resetear estado de transición después de la animación
    setTimeout(() => {
      setIsTransitioning(false);
    }, 250); // Duración de la animación
  }, []);

  // Colapsar sidebar
  const collapseSidebar = useCallback(() => {
    if (!isCollapsed) {
      toggleSidebar();
    }
  }, [isCollapsed, toggleSidebar]);

  // Expandir sidebar
  const expandSidebar = useCallback(() => {
    if (isCollapsed) {
      toggleSidebar();
    }
  }, [isCollapsed, toggleSidebar]);

  // Manejar hover con delay
  const handleMouseEnter = useCallback(() => {
    if (!isCollapsed) return;

    const timeoutId = setTimeout(() => {
      setIsHovered(true);
    }, hoverDelay);

    // Limpiar timeout si el mouse sale antes del delay
    const cleanup = () => {
      clearTimeout(timeoutId);
    };

    return cleanup;
  }, [isCollapsed, hoverDelay]);

  // Manejar salida del hover
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Función para configurar eventos de hover en un elemento (específicamente para el contentRef del SimpleBar)
  const setupHoverEvents = useCallback((contentRef) => {
    if (!contentRef?.current) return;

    const handleMouseEnterContent = () => setIsHovered(true);
    const handleMouseLeaveContent = () => setIsHovered(false);
    
    // Obtener el elemento de scroll de SimpleBar
    const contentEl = contentRef.current?.getScrollElement();
    
    if (contentEl) {
      contentEl.addEventListener('mouseenter', handleMouseEnterContent);
      contentEl.addEventListener('mouseleave', handleMouseLeaveContent);
    }

    return () => {
      if (contentEl) {
        contentEl.removeEventListener('mouseenter', handleMouseEnterContent);
        contentEl.removeEventListener('mouseleave', handleMouseLeaveContent);
      }
    };
  }, []);

  // Función para manejar clicks fuera del sidebar (para móvil)
  const handleOutsideClick = useCallback((event) => {
    // Esta función se puede usar para cerrar el sidebar en móvil
    // cuando se hace click fuera de él
    if (!isCollapsed && window.innerWidth < 768) {
      collapseSidebar();
    }
  }, [isCollapsed, collapseSidebar]);

  // Función para manejar cambios de tamaño de ventana
  const handleResize = useCallback(() => {
    // En pantallas pequeñas, mantener colapsado por defecto
    if (window.innerWidth < 768 && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isCollapsed]);

  // Configurar event listeners para resize
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Obtener clases CSS para el sidebar
  const getSidebarClasses = useCallback(() => {
    const classes = ['sidebar'];
    
    if (isCollapsed) classes.push('sidebar--collapsed');
    if (shouldExpand) classes.push('sidebar--expanded');
    if (isHovered) classes.push('sidebar--hovered');
    if (isTransitioning) classes.push('sidebar--transitioning');
    
    return classes.join(' ');
  }, [isCollapsed, shouldExpand, isHovered, isTransitioning]);

  // Obtener estilos inline para el sidebar
  const getSidebarStyles = useCallback(() => {
    return {
      width: shouldExpand ? '16rem' : '5rem',
      transition: 'width 0.25s ease-in-out'
    };
  }, [shouldExpand]);

  // Información del estado actual
  const sidebarInfo = {
    isCollapsed,
    isHovered,
    shouldExpand,
    isTransitioning,
    isMobile: window.innerWidth < 768,
    width: shouldExpand ? '16rem' : '5rem'
  };

  return {
    // Estado principal
    isCollapsed,
    isHovered,
    shouldExpand,
    isTransitioning,
    
    // Funciones de control
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    
    // Funciones de hover
    handleMouseEnter,
    handleMouseLeave,
    setupHoverEvents,
    setIsHovered,
    
    // Funciones de utilidad
    handleOutsideClick,
    handleResize,
    getSidebarClasses,
    getSidebarStyles,
    
    // Información del estado
    sidebarInfo,
    
    // Estados derivados
    isMobile: window.innerWidth < 768,
    isDesktop: window.innerWidth >= 768,
    canHover: isCollapsed,
    
    // Configuración
    config: {
      defaultCollapsed,
      enablePersistence,
      hoverDelay
    }
  };
};

export default useSidebar;