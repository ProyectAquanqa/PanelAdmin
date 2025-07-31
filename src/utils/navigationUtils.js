/**
 * Utilidades de navegación para sidebar y menús
 * Funciones para manejar navegación y estado de menús
 */

/**
 * Verifica si una ruta está activa
 * @param {string} currentPath - Ruta actual
 * @param {string} itemPath - Ruta del elemento de menú
 * @param {boolean} exact - Si debe ser coincidencia exacta
 * @returns {boolean} True si está activa
 */
export const isRouteActive = (currentPath, itemPath, exact = false) => {
  if (!currentPath || !itemPath) return false;
  
  if (exact) {
    return currentPath === itemPath;
  }
  
  // Para rutas raíz, usar coincidencia exacta
  if (itemPath === '/') {
    return currentPath === '/';
  }
  
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
};

/**
 * Verifica si un menú tiene algún submódulo activo
 * @param {Object} menuItem - Elemento de menú
 * @param {string} currentPath - Ruta actual
 * @returns {boolean} True si tiene submódulo activo
 */
export const hasActiveSubmenu = (menuItem, currentPath) => {
  if (!menuItem?.submenu || !Array.isArray(menuItem.submenu)) {
    return false;
  }
  
  return menuItem.submenu.some(subItem => 
    isRouteActive(currentPath, subItem.path)
  );
};

/**
 * Encuentra el elemento de menú activo en una lista
 * @param {Array} menuItems - Lista de elementos de menú
 * @param {string} currentPath - Ruta actual
 * @returns {Object|null} Elemento activo encontrado
 */
export const findActiveMenuItem = (menuItems, currentPath) => {
  if (!menuItems || !Array.isArray(menuItems)) return null;
  
  for (const item of menuItems) {
    // Verificar si el elemento principal está activo
    if (isRouteActive(currentPath, item.path)) {
      return item;
    }
    
    // Verificar submenús
    if (item.submenu) {
      for (const subItem of item.submenu) {
        if (isRouteActive(currentPath, subItem.path)) {
          return { ...item, activeSubmenu: subItem };
        }
      }
    }
  }
  
  return null;
};

/**
 * Obtiene el ID del menú que contiene la ruta actual
 * @param {string} currentPath - Ruta actual
 * @param {Object} menuCategories - Categorías de menú
 * @returns {string|null} ID del menú activo
 */
export const getActiveMenuId = (currentPath, menuCategories) => {
  if (!menuCategories || !currentPath) return null;
  
  for (const [categoryId, category] of Object.entries(menuCategories)) {
    for (let i = 0; i < category.items.length; i++) {
      const item = category.items[i];
      
      // Verificar elemento principal
      if (isRouteActive(currentPath, item.path)) {
        return `${categoryId}_${i}`;
      }
      
      // Verificar submenús
      if (item.submenu) {
        const hasActiveSubItem = item.submenu.some(subItem =>
          isRouteActive(currentPath, subItem.path)
        );
        
        if (hasActiveSubItem) {
          return `${categoryId}_${i}`;
        }
      }
    }
  }
  
  return null;
};

/**
 * Genera el estado inicial de menús expandidos
 * @param {string} currentPath - Ruta actual
 * @param {Object} menuCategories - Categorías de menú
 * @returns {Object} Estado de menús expandidos
 */
export const getInitialExpandedMenus = (currentPath, menuCategories) => {
  const expandedMenus = {};
  const activeMenuId = getActiveMenuId(currentPath, menuCategories);
  
  if (activeMenuId) {
    expandedMenus[activeMenuId] = true;
  }
  
  return expandedMenus;
};

/**
 * Calcula el siguiente estado de un menú expandido
 * @param {Object} currentState - Estado actual de menús expandidos
 * @param {string} menuId - ID del menú a toggle
 * @param {string} lastSelectedSubmenu - Último submenú seleccionado
 * @returns {Object} Nuevo estado de menús expandidos
 */
export const calculateNextMenuState = (currentState, menuId, lastSelectedSubmenu) => {
  const isCurrentlyExpanded = currentState[menuId];
  const newState = { ...currentState };
  
  // Si vamos a cerrar el actual, solo actualizamos ese
  if (isCurrentlyExpanded) {
    newState[menuId] = false;
    return newState;
  }
  
  // Si vamos a abrir uno nuevo, mantenemos abierto solo el que tiene el ítem actualmente seleccionado
  Object.keys(currentState).forEach(key => {
    // Si el menú actual no es el último donde se seleccionó un ítem, lo cerramos
    if (key !== menuId && key !== lastSelectedSubmenu) {
      newState[key] = false;
    }
  });
  
  // Activar el actual
  newState[menuId] = true;
  return newState;
};

/**
 * Obtiene información de navegación para breadcrumbs
 * @param {string} currentPath - Ruta actual
 * @returns {Object} Información de navegación
 */
export const getNavigationInfo = (currentPath) => {
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  return {
    segments: pathSegments,
    depth: pathSegments.length,
    isRoot: currentPath === '/',
    parentPath: pathSegments.length > 1 
      ? '/' + pathSegments.slice(0, -1).join('/')
      : '/',
  };
};

/**
 * Genera rutas de navegación jerárquica
 * @param {string} currentPath - Ruta actual
 * @returns {Array} Array de rutas jerárquicas
 */
export const generateHierarchicalPaths = (currentPath) => {
  if (currentPath === '/') return ['/'];
  
  const segments = currentPath.split('/').filter(Boolean);
  const paths = ['/'];
  
  for (let i = 0; i < segments.length; i++) {
    const path = '/' + segments.slice(0, i + 1).join('/');
    paths.push(path);
  }
  
  return paths;
};

/**
 * Verifica si el usuario puede acceder a una ruta
 * @param {string} path - Ruta a verificar
 * @param {Object} userPermissions - Permisos del usuario
 * @returns {boolean} True si puede acceder
 */
export const canAccessRoute = (path, userPermissions = {}) => {
  // Por ahora, todas las rutas son accesibles
  // Esta función se puede expandir para manejar permisos específicos
  return true;
};

/**
 * Filtra elementos de menú basado en permisos
 * @param {Array} menuItems - Elementos de menú
 * @param {Object} userPermissions - Permisos del usuario
 * @returns {Array} Elementos filtrados
 */
export const filterMenuByPermissions = (menuItems, userPermissions = {}) => {
  if (!menuItems || !Array.isArray(menuItems)) return [];
  
  return menuItems.filter(item => {
    // Verificar si puede acceder al elemento principal
    if (!canAccessRoute(item.path, userPermissions)) {
      return false;
    }
    
    // Filtrar submenús si existen
    if (item.submenu) {
      item.submenu = item.submenu.filter(subItem =>
        canAccessRoute(subItem.path, userPermissions)
      );
    }
    
    return true;
  });
};

/**
 * Obtiene el elemento de menú anterior y siguiente
 * @param {Array} menuItems - Lista de elementos de menú
 * @param {string} currentPath - Ruta actual
 * @returns {Object} { prev, next }
 */
export const getAdjacentMenuItems = (menuItems, currentPath) => {
  const flatItems = [];
  
  // Aplanar todos los elementos de menú
  menuItems.forEach(item => {
    flatItems.push(item);
    if (item.submenu) {
      flatItems.push(...item.submenu);
    }
  });
  
  const currentIndex = flatItems.findIndex(item => 
    isRouteActive(currentPath, item.path, true)
  );
  
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }
  
  return {
    prev: currentIndex > 0 ? flatItems[currentIndex - 1] : null,
    next: currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null,
  };
};