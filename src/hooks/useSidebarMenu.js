/**
 * Hook para manejar lógica de menús del sidebar
 * Gestiona expansión de menús, navegación y estado activo
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  isRouteActive,
  hasActiveSubmenu,
  findActiveMenuItem,
  getActiveMenuId,
  getInitialExpandedMenus,
  calculateNextMenuState
} from '../utils/navigationUtils';
import { menuCategories } from '../config/menuConfig';

/**
 * Hook para manejar lógica de menús del sidebar
 * @returns {Object} Estado y funciones para manejar menús
 */
export const useSidebarMenu = () => {
  const location = useLocation();

  // Estado para los menús expandidos
  const [expandedMenus, setExpandedMenus] = useState({});
  
  // Estado para rastrear el último módulo en el que se hizo clic
  const [lastClickedMenu, setLastClickedMenu] = useState(null);
  
  // Estado para rastrear el último submenú donde se seleccionó un ítem
  const [lastSelectedSubmenu, setLastSelectedSubmenu] = useState(null);

  // Inicializar menús expandidos basado en la ruta actual
  useEffect(() => {
    const initialExpanded = getInitialExpandedMenus(location.pathname, menuCategories);
    setExpandedMenus(initialExpanded);
    
    const activeMenuId = getActiveMenuId(location.pathname, menuCategories);
    if (activeMenuId) {
      setLastSelectedSubmenu(activeMenuId);
    }
  }, []); // Solo ejecutar al montar

  // Función específica para encontrar submenú por ruta (lógica del sidebar real)
  const findSubmenuForPath = useCallback((path) => {
    // Revisar todos los menús con submenús
    const checkItems = (items, category) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.submenu) {
          // Verificar si algún submódulo coincide con la ruta actual
          const submenuIndex = item.submenu.findIndex(
            subItem => path === subItem.path || path.startsWith(`${subItem.path}/`)
          );
          if (submenuIndex !== -1) {
            return `${category}_${i}`;
          }
        }
      }
      return null;
    };
    
    // Revisar en cada categoría de menú
    const mainItems = menuCategories.find(cat => cat.id === 'main')?.items || [];
    const eventosItems = menuCategories.find(cat => cat.id === 'eventos')?.items || [];
    const chatbotItems = menuCategories.find(cat => cat.id === 'chatbot')?.items || [];
    const userItems = menuCategories.find(cat => cat.id === 'users')?.items || [];
    const settingsItems = menuCategories.find(cat => cat.id === 'settings')?.items || [];
    
    let submenuId = checkItems(mainItems, 'main');
    if (!submenuId) submenuId = checkItems(eventosItems, 'eventos');
    if (!submenuId) submenuId = checkItems(chatbotItems, 'chatbot');
    if (!submenuId) submenuId = checkItems(userItems, 'users');
    if (!submenuId) submenuId = checkItems(settingsItems, 'settings');
    
    return submenuId;
  }, []);

  // Actualizar último submenú seleccionado cuando cambie la ruta (lógica del sidebar real)
  useEffect(() => {
    const currentSubmenu = findSubmenuForPath(location.pathname);
    if (currentSubmenu) {
      setLastSelectedSubmenu(currentSubmenu);
      
      // Asegurar que el submenú que contiene la ruta actual esté abierto
      setExpandedMenus(prevState => ({
        ...prevState,
        [currentSubmenu]: true
      }));
    }
  }, [location.pathname, findSubmenuForPath]);

  // Función para verificar si una ruta está activa
  const checkIsActive = useCallback((path) => {
    return isRouteActive(location.pathname, path);
  }, [location.pathname]);

  // Función para verificar si un menú tiene submódulo activo
  const checkHasActiveSubmenu = useCallback((item) => {
    return hasActiveSubmenu(item, location.pathname);
  }, [location.pathname]);

  // Toggle de submenú (lógica mejorada del sidebar real)
  const toggleSubmenu = useCallback((menuId, item) => {
    setLastClickedMenu(menuId); // Guardar el último módulo en el que se hizo clic
    
    setExpandedMenus(prevState => {
      const isCurrentlyExpanded = prevState[menuId];
      const newState = { ...prevState };
      
      // Si vamos a cerrar el actual, solo actualizamos ese
      if (isCurrentlyExpanded) {
        newState[menuId] = false;
        return newState;
      }
      
      // Si vamos a abrir uno nuevo, mantenemos abierto solo el que tiene el ítem actualmente seleccionado
      Object.keys(prevState).forEach(key => {
        // Si el menú actual no es el último donde se seleccionó un ítem, lo cerramos
        if (key !== menuId && key !== lastSelectedSubmenu) {
          newState[key] = false;
        }
      });
      
      // Activar el actual
      newState[menuId] = true;
      return newState;
    });
  }, [lastSelectedSubmenu]);

  // Función para manejar selección de ítem de submenú
  const handleSubmenuItemSelect = useCallback((submenuId) => {
    setLastSelectedSubmenu(submenuId);
    
    // Cerrar todos los demás submenús excepto el actual
    setExpandedMenus(prevState => {
      const newState = {};
      Object.keys(prevState).forEach(key => {
        newState[key] = key === submenuId;
      });
      return newState;
    });
  }, []);

  // Función para colapsar todos los menús
  const collapseAllMenus = useCallback(() => {
    setExpandedMenus({});
  }, []);

  // Función para expandir menú específico
  const expandMenu = useCallback((menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: true
    }));
  }, []);

  // Función para colapsar menú específico
  const collapseMenu = useCallback((menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: false
    }));
  }, []);

  // Obtener elemento de menú activo actual
  const activeMenuItem = useMemo(() => {
    for (const category of Object.values(menuCategories)) {
      const activeItem = findActiveMenuItem(category.items, location.pathname);
      if (activeItem) {
        return activeItem;
      }
    }
    return null;
  }, [location.pathname]);

  // Obtener ID del menú activo
  const activeMenuId = useMemo(() => {
    return getActiveMenuId(location.pathname, menuCategories);
  }, [location.pathname]);

  // Función para verificar si un menú está expandido
  const isMenuExpanded = useCallback((menuId) => {
    return Boolean(expandedMenus[menuId]);
  }, [expandedMenus]);

  // Función para obtener información de un menú
  const getMenuInfo = useCallback((menuId) => {
    return {
      isExpanded: isMenuExpanded(menuId),
      isActive: activeMenuId === menuId,
      isLastClicked: lastClickedMenu === menuId,
      isLastSelected: lastSelectedSubmenu === menuId
    };
  }, [isMenuExpanded, activeMenuId, lastClickedMenu, lastSelectedSubmenu]);

  // Función para obtener estadísticas de menús
  const getMenuStats = useCallback(() => {
    const totalMenus = Object.keys(menuCategories).reduce((total, categoryId) => {
      return total + menuCategories[categoryId].items.length;
    }, 0);

    const expandedCount = Object.values(expandedMenus).filter(Boolean).length;

    return {
      total: totalMenus,
      expanded: expandedCount,
      collapsed: totalMenus - expandedCount,
      hasExpanded: expandedCount > 0,
      allCollapsed: expandedCount === 0
    };
  }, [expandedMenus]);

  // Función para resetear estado de menús
  const resetMenuState = useCallback(() => {
    const initialExpanded = getInitialExpandedMenus(location.pathname, menuCategories);
    setExpandedMenus(initialExpanded);
    setLastClickedMenu(null);
    
    const activeMenuId = getActiveMenuId(location.pathname, menuCategories);
    setLastSelectedSubmenu(activeMenuId);
  }, [location.pathname]);

  // Función para obtener menús por categoría
  const getMenusByCategory = useCallback((categoryId) => {
    return menuCategories[categoryId]?.items || [];
  }, []);

  // Función para obtener todas las categorías
  const getAllCategories = useCallback(() => {
    return Object.keys(menuCategories);
  }, []);

  // Información del estado actual para debugging
  const menuState = {
    currentPath: location.pathname,
    expandedMenus,
    lastClickedMenu,
    lastSelectedSubmenu,
    activeMenuId,
    activeMenuItem
  };

  return {
    // Estado principal
    expandedMenus,
    lastClickedMenu,
    lastSelectedSubmenu,
    activeMenuItem,
    activeMenuId,
    
    // Funciones de verificación
    checkIsActive,
    checkHasActiveSubmenu,
    isMenuExpanded,
    getMenuInfo,
    
    // Funciones de control de menús
    toggleSubmenu,
    handleSubmenuItemSelect,
    collapseAllMenus,
    expandMenu,
    collapseMenu,
    resetMenuState,
    
    // Funciones de consulta
    getMenusByCategory,
    getAllCategories,
    getMenuStats,
    findSubmenuForPath,
    
    // Información del estado
    menuState,
    
    // Estados derivados
    hasExpandedMenus: Object.values(expandedMenus).some(Boolean),
    currentPath: location.pathname,
    
    // Configuración
    menuCategories
  };
};

export default useSidebarMenu;