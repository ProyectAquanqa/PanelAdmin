import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
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

// Importar componentes modulares
import { 
  SidebarHeader,
  SidebarMenu,
  SidebarItem
} from "./components";

/**
 * Componente principal de la barra lateral.
 * Maneja el estado de colapso/expansión y la navegación.
 */
const Sidebar = () => {
  // Estado para controlar si el sidebar está colapsado
  const [isCollapsed, setIsCollapsed] = useState(true);
  // Estado para controlar si el sidebar está en hover (solo para el contenido, no el header)
  const [isHovered, setIsHovered] = useState(false);
  // Estado para rastrear el último módulo en el que se hizo clic
  const [lastClickedMenu, setLastClickedMenu] = useState(null);
  // Estado para rastrear el último submenú donde se seleccionó un ítem
  const [lastSelectedSubmenu, setLastSelectedSubmenu] = useState(null);
  const location = useLocation();
  const sidebarRef = useRef(null);
  const contentRef = useRef(null); // Referencia al componente SimpleBar

  // Efecto para manejar eventos de mouse - ahora solo para el contenido y footer, no para el header
  useEffect(() => {
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
    
    const contentEl = contentRef.current?.getScrollElement();
    
    if (contentEl) {
      contentEl.addEventListener('mouseenter', handleMouseEnter);
      contentEl.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (contentEl) {
        contentEl.removeEventListener('mouseenter', handleMouseEnter);
        contentEl.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  // Efecto para detectar cambios en la ruta y actualizar el último submenú seleccionado
  useEffect(() => {
    // Encontrar qué submenú contiene la ruta actual
    const findSubmenuForPath = (path) => {
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
      let submenuId = checkItems(menuItems, 'main');
      if (!submenuId) submenuId = checkItems(eventosItems, 'eventos');
      if (!submenuId) submenuId = checkItems(chatbotItems, 'chatbot');
      if (!submenuId) submenuId = checkItems(userNotificationItems, 'users');
      if (!submenuId) submenuId = checkItems(settingsItems, 'settings');
      
      return submenuId;
    };
    
    const currentSubmenu = findSubmenuForPath(location.pathname);
    if (currentSubmenu) {
      setLastSelectedSubmenu(currentSubmenu);
      
      // Asegurar que el submenú que contiene la ruta actual esté abierto
      setExpandedMenus(prevState => ({
        ...prevState,
        [currentSubmenu]: true
      }));
    }
  }, [location.pathname]);

  // Cuando el sidebar cambia de estado, no cerramos los submenús abiertos
  // para mantener la consistencia al volver a expandir

  // Calcular si el sidebar debe mostrarse expandido (por el estado de isCollapsed o por hover en el contenido/footer)
  const shouldExpand = !isCollapsed || isHovered;

  // Memoizar el toggle del sidebar para evitar recreaciones innecesarias
  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prevState => !prevState);
  }, []);

  // Definición de los elementos del menú basados en la estructura de AquanQ
  const menuItems = useMemo(() => [
    {
      title: 'Dashboard',
      icon: <HomeIcon className="w-5 h-5" />,
      path: '/',
    },
  ], []);

  // Menú de Eventos
  const eventosItems = useMemo(() => [
    {
      title: 'Eventos',
      icon: <CalendarIcon className="w-5 h-5" />,
      path: '/eventos',
      submenu: [
        { title: 'Gestión de Eventos', path: '/eventos/gestion' },
        { title: 'Categorías', path: '/eventos/categorias' },
        { title: 'Valores', path: '/eventos/valores' },
      ],
    },
  ], []);

  // Menú de Chatbot
  const chatbotItems = useMemo(() => [
    {
      title: 'Chatbot',
      icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
      path: '/chatbot',
      submenu: [
        { title: 'Base de Conocimiento', path: '/chatbot/knowledge' },
        { title: 'Categorías', path: '/chatbot/categorias' },
        { title: 'Historial de Conversaciones', path: '/chatbot/historial' },
      ],
    },
  ], []);

  // Menú de Usuarios y Notificaciones
  const userNotificationItems = useMemo(() => [
    {
      title: 'Usuarios',
      icon: <UserGroupIcon className="w-5 h-5" />,
      path: '/usuarios',
      submenu: [
        { title: 'Gestión de Usuarios', path: '/usuarios/gestion' },
        { title: 'Perfiles', path: '/usuarios/perfiles' },
      ],
    },
    {
      title: 'Notificaciones',
      icon: <BellIcon className="w-5 h-5" />,
      path: '/notificaciones',
      submenu: [
        { title: 'Historial de Notificaciones', path: '/notificaciones/historial' },
        { title: 'Dispositivos Registrados', path: '/notificaciones/dispositivos' },
      ],
    },
    {
      title: 'Documentación',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      path: '/documentacion',
    },
  ], []);

  // Sección de configuración
  const settingsItems = useMemo(() => [
    {
      title: 'Configuración',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      path: '/configuracion',
      submenu: [
        { title: 'General', path: '/configuracion/general' },
        { title: 'API', path: '/configuracion/api' },
      ],
    },
    {
      title: 'Permisos',
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      path: '/permisos',
    },
  ], []);

  // Estados para los submenús expandidos
  const [expandedMenus, setExpandedMenus] = useState({});

  // Verificar si una ruta está activa - memoizada para evitar recálculos
  const isActive = useCallback((path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }, [location.pathname]);

  // Verificar si un menú tiene algún submódulo activo
  const hasActiveSubmenu = useCallback((item) => {
    if (!item?.submenu) return false;
    return item.submenu.some(subItem => isActive(subItem.path));
  }, [isActive]);

  // Optimizar la función toggleSubmenu con useCallback - modificada para mantener submenús activos abiertos
  const toggleSubmenu = useCallback((index, item) => {
    setLastClickedMenu(index); // Guardar el último módulo en el que se hizo clic
    
    setExpandedMenus(prevState => {
      const isCurrentlyExpanded = prevState[index];
      const newState = { ...prevState };
      
      // Si vamos a cerrar el actual, solo actualizamos ese
      if (isCurrentlyExpanded) {
        newState[index] = false;
        return newState;
      }
      
      // Si vamos a abrir uno nuevo, mantenemos abierto solo el que tiene el ítem actualmente seleccionado
      Object.keys(prevState).forEach(key => {
        // Si el menú actual no es el último donde se seleccionó un ítem, lo cerramos
        if (key !== index && key !== lastSelectedSubmenu) {
          newState[key] = false;
        }
      });
      
      // Activar el actual
      newState[index] = true;
      return newState;
    });
  }, [lastSelectedSubmenu]);

  // Función para manejar la selección de un ítem de submenú
  const handleSubmenuItemSelect = useCallback((submenuId) => {
    // Actualizar el último submenú seleccionado
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

  // Función auxiliar para obtener el objeto de menú por su ID
  const getItemByMenuId = useCallback((menuId) => {
    if (menuId?.startsWith('main_')) {
      const index = parseInt(menuId.replace('main_', ''));
      return menuItems[index];
    } else if (menuId?.startsWith('eventos_')) {
      const index = parseInt(menuId.replace('eventos_', ''));
      return eventosItems[index];
    } else if (menuId?.startsWith('chatbot_')) {
      const index = parseInt(menuId.replace('chatbot_', ''));
      return chatbotItems[index];
    } else if (menuId?.startsWith('users_')) {
      const index = parseInt(menuId.replace('users_', ''));
      return userNotificationItems[index];
    } else if (menuId?.startsWith('settings_')) {
      const index = parseInt(menuId.replace('settings_', ''));
      return settingsItems[index];
    }
    return null;
  }, [menuItems, eventosItems, chatbotItems, userNotificationItems, settingsItems]);

  // Variantes de animación para el sidebar
  const sidebarVariants = {
    expanded: { width: '16rem' },
    collapsed: { width: '5rem' }
  };

  // Configuración de la transición para hacerla más suave - solo horizontal
  const transitionConfig = {
    duration: 0.25,  // Más suave (duración más larga)
    ease: [0.25, 0.1, 0.25, 1.0],
    stiffness: 200,  // Menos rigidez para más suavidad
    damping: 20      // Menos amortiguación para movimiento más suave
  };

  // Memoizar los componentes SidebarMenu para evitar rerenderizados innecesarios
  const renderMenuSections = useMemo(() => (
    <>
      <SidebarMenu 
        items={eventosItems}
        categoryTitle="CONTENIDO"
        category="eventos"
        isCollapsed={isCollapsed}
        isHovered={isHovered}
        expandedMenus={expandedMenus}
        toggleSubmenu={toggleSubmenu}
        isActive={isActive}
        lastClickedMenu={lastClickedMenu}
        onSubmenuItemSelect={handleSubmenuItemSelect}
      />

      <SidebarMenu 
        items={chatbotItems}
        categoryTitle="INTERACCIÓN"
        category="chatbot"
        isCollapsed={isCollapsed}
        isHovered={isHovered}
        expandedMenus={expandedMenus}
        toggleSubmenu={toggleSubmenu}
        isActive={isActive}
        lastClickedMenu={lastClickedMenu}
        onSubmenuItemSelect={handleSubmenuItemSelect}
      />

      <SidebarMenu 
        items={userNotificationItems}
        categoryTitle="USUARIOS"
        category="users"
        isCollapsed={isCollapsed}
        isHovered={isHovered}
        expandedMenus={expandedMenus}
        toggleSubmenu={toggleSubmenu}
        isActive={isActive}
        lastClickedMenu={lastClickedMenu}
        onSubmenuItemSelect={handleSubmenuItemSelect}
      />

      <SidebarMenu 
        items={settingsItems}
        categoryTitle="CONFIGURACIÓN"
        category="settings"
        isCollapsed={isCollapsed}
        isHovered={isHovered}
        expandedMenus={expandedMenus}
        toggleSubmenu={toggleSubmenu}
        isActive={isActive}
        lastClickedMenu={lastClickedMenu}
        onSubmenuItemSelect={handleSubmenuItemSelect}
      />
    </>
  ), [eventosItems, chatbotItems, userNotificationItems, settingsItems, 
      isCollapsed, isHovered, expandedMenus, toggleSubmenu, isActive, lastClickedMenu, handleSubmenuItemSelect]);

  return (
    <motion.div 
      ref={sidebarRef}
      className="h-screen bg-[#2D728F] text-white flex flex-col shadow-xl z-20 sidebar-container"
      initial={false}
      animate={shouldExpand ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
      transition={transitionConfig}
    >
      {/* Header con logo y botón de colapso - SIN hover para expandir */}
      <SidebarHeader 
        isCollapsed={isCollapsed}
        shouldExpand={shouldExpand}
        toggleSidebar={toggleSidebar}
      />

      {/* Menú principal - CON hover para expandir (contentRef) */}
      <SimpleBar 
        ref={contentRef} 
        className="flex-1 sidebar-content" 
        style={{ height: 'calc(100vh - 4rem)' }}
        autoHide={false}
      >
        {/* Dashboard */}
        <ul className="w-full p-0 m-0 pt-1">
          {menuItems.map((item, index) => (
            <SidebarItem
              key={`main_${index}`}
              item={item}
              isActive={isActive(item.path)}
              isExpanded={expandedMenus[`main_${index}`]}
              isCollapsed={isCollapsed}
              shouldExpand={shouldExpand}
              toggleSubmenu={() => toggleSubmenu(`main_${index}`, item)}
              checkIsActive={isActive}
              isLastClicked={lastClickedMenu === `main_${index}`}
              onSubmenuItemSelect={() => handleSubmenuItemSelect(`main_${index}`)}
              menuId={`main_${index}`}
            />
          ))}
        </ul>

        {/* Secciones de menú con categorías - memoizadas para evitar rerenderizados */}
        {renderMenuSections}
      </SimpleBar>
    </motion.div>
  );
};

// Exportar como componente memorizado para evitar rerenderizados innecesarios
export default React.memo(Sidebar); 