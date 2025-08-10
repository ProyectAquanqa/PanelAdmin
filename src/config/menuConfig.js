/**
 * Configuración de menús del sidebar
 * Centraliza toda la configuración de navegación
 */

import { 
  HomeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  BellIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

/**
 * Elementos del menú principal (Dashboard)
 */
export const menuItems = [
  {
    title: 'Dashboard',
    icon: HomeIcon,
    path: '/',
  },
];

/**
 * Elementos del menú de Eventos
 */
export const eventosItems = [
  {
    title: 'Eventos',
    icon: CalendarIcon,
    path: '/eventos',
    submenu: [
      { title: 'Gestión de Eventos', path: '/eventos/gestion' },
      { title: 'Categorías', path: '/eventos/categorias' },
      
    ],
  },
];

/**
 * Elementos del menú de Chatbot
 */
export const chatbotItems = [
  {
    title: 'Chatbot',
    icon: ChatBubbleLeftRightIcon,
    path: '/chatbot',
    submenu: [
      { title: 'Base de Conocimiento', path: '/chatbot/knowledge' },
      { title: 'Categorías', path: '/chatbot/categorias' },
      { title: 'Historial de Conversaciones', path: '/chatbot/historial' },
    ],
  },
];

/**
 * Elementos del menú de Usuarios y Notificaciones
 */
export const userNotificationItems = [
  {
    title: 'Usuarios',
    icon: UserGroupIcon,
    path: '/usuarios',
    submenu: [
      { title: 'Gestión de Usuarios', path: '/usuarios/gestion' },
      { title: 'Perfiles', path: '/usuarios/perfiles' },
      { title: 'Importación', path: '/usuarios/importacion' },
    ],
  },
  {
    title: 'Notificaciones',
    icon: BellIcon,
    path: '/notificaciones',
    submenu: [
      { title: 'Historial de Notificaciones', path: '/notificaciones/historial' },
      { title: 'Dispositivos Registrados', path: '/notificaciones/dispositivos' },
    ],
  },
  {
    title: 'Documentación',
    icon: DocumentTextIcon,
    path: '/documentacion',
  },
];

/**
 * Elementos del menú de Configuración
 */
export const settingsItems = [
  {
    title: 'Configuración',
    icon: Cog6ToothIcon,
    path: '/configuracion',
    submenu: [
      { title: 'General', path: '/configuracion/general' },
      { title: 'API', path: '/configuracion/api' },
    ],
  },
  {
    title: 'Permisos',
    icon: ShieldCheckIcon,
    path: '/permisos',
  },
];

/**
 * Configuración de categorías de menú
 */
export const menuCategories = [
  {
    id: 'main',
    title: null, // Sin título para el menú principal
    items: menuItems,
  },
  {
    id: 'eventos',
    title: 'CONTENIDO',
    items: eventosItems,
  },
  {
    id: 'chatbot',
    title: 'INTERACCIÓN',
    items: chatbotItems,
  },
  {
    id: 'users',
    title: 'USUARIOS',
    items: userNotificationItems,
  },
  {
    id: 'settings',
    title: 'CONFIGURACIÓN',
    items: settingsItems,
  },
];

/**
 * Obtiene todos los elementos de menú en una estructura plana
 * @returns {Array} Array de todos los elementos de menú
 */
export const getAllMenuItems = () => {
  const allItems = [];
  
  menuCategories.forEach(category => {
    category.items.forEach(item => {
      allItems.push(item);
      if (item.submenu) {
        item.submenu.forEach(subItem => {
          allItems.push({
            ...subItem,
            parent: item.path,
            category: category.id
          });
        });
      }
    });
  });
  
  return allItems;
};

/**
 * Encuentra un elemento de menú por su ruta
 * @param {string} path - Ruta a buscar
 * @returns {Object|null} Elemento de menú encontrado
 */
export const findMenuItemByPath = (path) => {
  const allItems = getAllMenuItems();
  return allItems.find(item => item.path === path) || null;
};

/**
 * Obtiene el elemento padre de un submenú
 * @param {string} path - Ruta del submenú
 * @returns {Object|null} Elemento padre
 */
export const getParentMenuItem = (path) => {
  const allItems = getAllMenuItems();
  const item = allItems.find(item => item.path === path);
  
  if (item && item.parent) {
    return allItems.find(parentItem => parentItem.path === item.parent);
  }
  
  return null;
};

/**
 * Verifica si una ruta tiene submenús
 * @param {string} path - Ruta a verificar
 * @returns {boolean} True si tiene submenús
 */
export const hasSubmenu = (path) => {
  const item = findMenuItemByPath(path);
  return item && item.submenu && item.submenu.length > 0;
};

/**
 * Obtiene los submenús de un elemento
 * @param {string} path - Ruta del elemento padre
 * @returns {Array} Array de submenús
 */
export const getSubmenuItems = (path) => {
  const item = findMenuItemByPath(path);
  return item && item.submenu ? item.submenu : [];
};

export default {
  menuItems,
  eventosItems,
  chatbotItems,
  userNotificationItems,
  settingsItems,
  menuCategories,
  getAllMenuItems,
  findMenuItemByPath,
  getParentMenuItem,
  hasSubmenu,
  getSubmenuItems
};